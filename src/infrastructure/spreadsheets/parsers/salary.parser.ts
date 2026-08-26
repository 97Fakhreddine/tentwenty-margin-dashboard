import { z } from "zod";

import type { Employee } from "@/domain/employees/employee";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";

import { normalizeOptionalNumber } from "../normalizers/number.normalizer";
import { parseMonthName } from "../normalizers/period.normalizer";
import { normalizeRequiredText } from "../normalizers/text.normalizer";
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
import type { Row } from "exceljs";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const salarySchema = z.object({
  employeeNumber: z.string().min(1),
  employeeName: z.string().min(1),
  amountAed: z.number().nonnegative(),
});

export interface ParsedSalaryData {
  readonly employees: readonly Employee[];

  readonly monthlySalaries: readonly MonthlySalary[];
}

function inferYearFromWorksheetTitle(title: string): number | null {
  const match = title.match(/\b(20\d{2})\b/);

  return match ? Number(match[1]) : null;
}

function readRowText(row: Row): string {
  const cellValues: string[] = [];

  row.eachCell({ includeEmpty: false }, (cell) => {
    const cellText = cell.text.trim();

    if (cellText) {
      cellValues.push(cellText);
    }
  });

  return cellValues.join(" ");
}

export async function parseSalaryWorkbook(
  workbookBuffer: Buffer,
  fallbackYear?: number,
): Promise<SpreadsheetParseResult<ParsedSalaryData>> {
  const worksheet = await readFirstWorksheet(workbookBuffer);

  const headerRow = findHeaderRow(worksheet, [
    "Employee No.",
    "Employee Name",
    "January",
  ]);

  if (!headerRow) {
    throw new Error("Salary header row could not be identified.");
  }

  let detectedYear: number | null = null;

  for (let rowNumber = 1; rowNumber < headerRow.number; rowNumber += 1) {
    const title = readRowText(worksheet.getRow(rowNumber));

    detectedYear = inferYearFromWorksheetTitle(title);

    if (detectedYear) {
      break;
    }
  }

  const year = detectedYear ?? fallbackYear;

  if (!year) {
    throw new Error("The salary workbook year could not be determined.");
  }

  const columnIndexByHeader = createColumnIndexByHeader(headerRow);

  const employeeNumberColumn = findColumnIndex(
    columnIndexByHeader,
    "Employee No.",
  );

  const employeeNameColumn = findColumnIndex(
    columnIndexByHeader,
    "Employee Name",
  );

  if (employeeNumberColumn === null || employeeNameColumn === null) {
    throw new Error("Salary workbook is missing required employee columns.");
  }

  const employees: Employee[] = [];

  const monthlySalaries: MonthlySalary[] = [];

  const issues: SpreadsheetIssue[] = [];

  for (
    let rowNumber = headerRow.number + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const row = worksheet.getRow(rowNumber);

    const employeeNumber = normalizeRequiredText(
      row.getCell(employeeNumberColumn).text,
    );

    const employeeName = normalizeRequiredText(
      row.getCell(employeeNameColumn).text,
    );

    if (!employeeNumber && !employeeName) {
      continue;
    }

    employees.push({
      employeeNumber,
      name: employeeName,
    });

    for (const monthName of MONTH_NAMES) {
      const columnIndex = findColumnIndex(columnIndexByHeader, monthName);

      if (columnIndex === null) {
        issues.push({
          severity: "error",
          rowNumber: headerRow.number,
          field: monthName,
          message: `Salary column "${monthName}" is missing.`,
        });

        continue;
      }

      const amountAed = normalizeOptionalNumber(row.getCell(columnIndex).text);

      if (amountAed === null) {
        issues.push({
          severity: "warning",
          rowNumber,
          field: monthName,
          message: `Salary is missing for ${employeeName} in ${monthName} ${year}.`,
        });

        continue;
      }

      const validationResult = salarySchema.safeParse({
        employeeNumber,
        employeeName,
        amountAed,
      });

      if (!validationResult.success) {
        issues.push({
          severity: "error",
          rowNumber,
          field: monthName,
          message: validationResult.error.issues
            .map((issue) => issue.message)
            .join("; "),
        });

        continue;
      }

      const month = parseMonthName(monthName);

      if (month === null) {
        continue;
      }

      monthlySalaries.push({
        employeeNumber,
        period: {
          year,
          month,
        },
        amountAed,
      });
    }
  }

  return {
    data: {
      employees,
      monthlySalaries,
    },
    issues,
  };
}
