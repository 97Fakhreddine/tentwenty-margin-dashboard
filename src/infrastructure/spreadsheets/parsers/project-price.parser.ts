import { z } from "zod";

import type { Project } from "@/domain/projects/project";

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
  "Ref Code",
  "Project (Billable) Name",
  "Project Price",
  "Sales month",
  "Category",
  "Status",
] as const;

const projectSchema = z.object({
  referenceCode: z.string().min(1),
  name: z.string().min(1),
  priceAed: z.number().nonnegative(),
  salesPeriod: yearMonthSchema,
  category: z.string().min(1),
  status: z.string().nullable(),
});

export async function parseProjectPriceWorkbook(
  workbookBuffer: Buffer,
  fallbackYear?: number,
): Promise<SpreadsheetParseResult<readonly Project[]>> {
  const worksheet = await readFirstWorksheet(workbookBuffer);

  const headerRow = findHeaderRow(worksheet, REQUIRED_HEADERS);

  if (!headerRow) {
    throw new Error("Project price header row could not be identified.");
  }

  const columnIndexByHeader = createColumnIndexByHeader(headerRow);

  function readCell(rowNumber: number, header: string): string {
    const columnIndex = findColumnIndex(columnIndexByHeader, header);

    if (columnIndex === null) {
      return "";
    }

    return worksheet.getRow(rowNumber).getCell(columnIndex).text;
  }

  const projects: Project[] = [];

  const issues: SpreadsheetIssue[] = [];

  for (
    let rowNumber = headerRow.number + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const referenceCode = normalizeRequiredText(
      readCell(rowNumber, "Ref Code"),
    );

    const projectName = normalizeRequiredText(
      readCell(rowNumber, "Project (Billable) Name"),
    );

    if (!referenceCode && !projectName) {
      continue;
    }

    const candidate = {
      referenceCode,

      name: projectName,

      priceAed: normalizeOptionalNumber(readCell(rowNumber, "Project Price")),

      salesPeriod: parseYearMonth(
        readCell(rowNumber, "Sales month"),
        fallbackYear,
      ),

      category: normalizeRequiredText(readCell(rowNumber, "Category")),

      status: normalizeOptionalText(readCell(rowNumber, "Status")),
    };

    const validationResult = projectSchema.safeParse(candidate);

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

    projects.push(validationResult.data);
  }

  return {
    data: projects,
    issues,
  };
}
