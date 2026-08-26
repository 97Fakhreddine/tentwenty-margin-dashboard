import { z } from "zod";

import type { Employee } from "@/domain/employees/employee";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { normalizeOptionalNumber } from "../normalizers/number.normalizer";
import { parseYearMonth } from "../normalizers/period.normalizer";
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from "../normalizers/text.normalizer";
import {
  createColumnIndexByHeader,
  findColumnIndex,
  findHeaderRow,
} from "../shared/header-reader";
import {
  type SpreadsheetIssue,
  type SpreadsheetParseResult,
} from "../shared/spreadsheet-result";
import { readFirstWorksheet } from "../shared/spreadsheet-reader";
import { yearMonthSchema } from "@/validation/year-month.schema";

const REQUIRED_HEADERS = [
  "Month",
  "Employee No.",
  "Employee Name",
  "Type of Expense",
  "Department",
  "Designation",
  "Category",
  "Ref Code",
  "Project (Billable) / Task (Unbillable) Name",
  "Company Name (Billable)/ Fixed Costs (Unbillable)",
  "Description",
  "Hours",
] as const;

const timesheetRowSchema = z.object({
  period: yearMonthSchema,

  employeeNumber: z.string().min(1),

  employeeName: z.string().min(1),

  expenseType: z.enum(["DL", "IDL"]),

  department: z.string().min(1),

  designation: z.string().min(1),

  category: z.string().min(1),

  referenceCode: z.string().nullable(),

  projectOrTaskName: z.string().nullable(),

  companyOrCostCenter: z.string().nullable(),

  description: z.string().nullable(),

  hours: z.number().nonnegative(),
});

export interface ParsedTimesheetData {
  readonly employees: readonly Employee[];

  readonly entries: readonly TimesheetEntry[];
}

export async function parseTimesheetWorkbook(
  workbookBuffer: Buffer,
  fallbackYear?: number,
): Promise<SpreadsheetParseResult<ParsedTimesheetData>> {
  const worksheet = await readFirstWorksheet(workbookBuffer);

  const headerRow = findHeaderRow(worksheet, REQUIRED_HEADERS);

  if (!headerRow) {
    throw new Error("Timesheet header row could not be identified.");
  }

  const columnIndexByHeader = createColumnIndexByHeader(headerRow);

  function readCell(rowNumber: number, header: string): string {
    const columnIndex = findColumnIndex(columnIndexByHeader, header);

    if (columnIndex === null) {
      return "";
    }

    return worksheet.getRow(rowNumber).getCell(columnIndex).text;
  }

  const entries: TimesheetEntry[] = [];

  const employeesByNumber = new Map<string, Employee>();

  const issues: SpreadsheetIssue[] = [];

  for (
    let rowNumber = headerRow.number + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const employeeNumber = normalizeRequiredText(
      readCell(rowNumber, "Employee No."),
    );

    const employeeName = normalizeRequiredText(
      readCell(rowNumber, "Employee Name"),
    );

    const rawMonth = readCell(rowNumber, "Month");

    const rawHours = readCell(rowNumber, "Hours");

    if (!employeeNumber && !employeeName && !rawMonth && !rawHours) {
      continue;
    }

    const period = parseYearMonth(rawMonth, fallbackYear);

    const hours = normalizeOptionalNumber(rawHours);

    const candidate = {
      period,

      employeeNumber,

      employeeName,

      expenseType: normalizeRequiredText(
        readCell(rowNumber, "Type of Expense"),
      ),

      department: normalizeRequiredText(readCell(rowNumber, "Department")),

      designation: normalizeRequiredText(readCell(rowNumber, "Designation")),

      category: normalizeRequiredText(readCell(rowNumber, "Category")),

      referenceCode: normalizeOptionalText(readCell(rowNumber, "Ref Code")),

      projectOrTaskName: normalizeOptionalText(
        readCell(rowNumber, "Project (Billable) / Task (Unbillable) Name"),
      ),

      companyOrCostCenter: normalizeOptionalText(
        readCell(
          rowNumber,
          "Company Name (Billable)/ Fixed Costs (Unbillable)",
        ),
      ),

      description: normalizeOptionalText(readCell(rowNumber, "Description")),

      hours,
    };

    const validationResult = timesheetRowSchema.safeParse(candidate);

    if (!validationResult.success) {
      issues.push({
        severity: "error",
        rowNumber,
        message: validationResult.error.issues
          .map((issue) => issue.message)
          .join("; "),
      });

      continue;
    }

    const validatedRow = validationResult.data;

    const existingEmployee = employeesByNumber.get(validatedRow.employeeNumber);

    if (
      existingEmployee &&
      existingEmployee.name !== validatedRow.employeeName
    ) {
      issues.push({
        severity: "warning",
        rowNumber,
        field: "Employee Name",
        message:
          `Employee ${validatedRow.employeeNumber} ` +
          `appears with multiple names.`,
      });
    } else if (!existingEmployee) {
      employeesByNumber.set(validatedRow.employeeNumber, {
        employeeNumber: validatedRow.employeeNumber,
        name: validatedRow.employeeName,
      });
    }

    entries.push({
      period: validatedRow.period,
      employeeNumber: validatedRow.employeeNumber,
      expenseType: validatedRow.expenseType,
      department: validatedRow.department,
      designation: validatedRow.designation,
      category: validatedRow.category,
      referenceCode: validatedRow.referenceCode,
      projectOrTaskName: validatedRow.projectOrTaskName,
      companyOrCostCenter: validatedRow.companyOrCostCenter,
      description: validatedRow.description,
      hours: validatedRow.hours,
    });
  }

  return {
    data: {
      employees: [...employeesByNumber.values()],
      entries,
    },

    issues,
  };
}
