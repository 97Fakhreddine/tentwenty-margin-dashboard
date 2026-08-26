import { FinancialDataRepository } from "@/infrastructure/repositories/financial-data.repository";

import {
  parseProjectPriceWorkbook,
  parseSalaryWorkbook,
  parseTimesheetWorkbook,
} from "@/infrastructure/spreadsheets";

import { extractUniquePeriods } from "./extract-import-periods";

import type { ImportResult } from "./import-result";

function collectWarnings(
  issues: readonly {
    readonly severity: "warning" | "error";
    readonly rowNumber: number;
    readonly field?: string;
    readonly message: string;
  }[],
): readonly string[] {
  return issues
    .filter((issue) => issue.severity === "warning")
    .map((issue) => {
      const field = issue.field ? ` (${issue.field})` : "";

      return `Row ${issue.rowNumber}${field}: ` + issue.message;
    });
}

function assertNoParserErrors(
  issues: readonly {
    readonly severity: "warning" | "error";
    readonly rowNumber: number;
    readonly field?: string;
    readonly message: string;
  }[],
): void {
  const errors = issues.filter((issue) => issue.severity === "error");

  if (errors.length === 0) {
    return;
  }

  const message = errors
    .slice(0, 5)
    .map((issue) => `Row ${issue.rowNumber}: ${issue.message}`)
    .join("\n");

  throw new Error(`The spreadsheet contains invalid data:\n${message}`);
}

export class FinancialImportService {
  constructor(private readonly repository = new FinancialDataRepository()) {}

  async importTimesheet(
    fileName: string,
    buffer: Buffer,
  ): Promise<ImportResult> {
    const result = await parseTimesheetWorkbook(buffer);

    assertNoParserErrors(result.issues);

    const periods = extractUniquePeriods(result.data.entries);

    if (periods.length === 0) {
      throw new Error("The timesheet does not contain any importable periods.");
    }

    await this.repository.replaceTimesheetPeriods({
      employees: result.data.employees,

      entries: result.data.entries,

      periods,

      sourceFileName: fileName,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,
    });

    return {
      kind: "TIMESHEET",

      sourceFileName: fileName,

      importedRecordCount: result.data.entries.length,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,

      periods: periods.map(
        (period) => `${period.year}-${String(period.month).padStart(2, "0")}`,
      ),

      warnings: collectWarnings(result.issues),
    };
  }

  async importSalaries(
    fileName: string,
    buffer: Buffer,
  ): Promise<ImportResult> {
    const result = await parseSalaryWorkbook(buffer);

    assertNoParserErrors(result.issues);

    const periods = extractUniquePeriods(result.data.monthlySalaries);

    if (periods.length === 0) {
      throw new Error(
        "The salary workbook does not contain any importable periods.",
      );
    }

    await this.repository.replaceSalaryPeriods({
      employees: result.data.employees,

      salaries: result.data.monthlySalaries,

      periods,

      sourceFileName: fileName,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,
    });

    return {
      kind: "SALARY",

      sourceFileName: fileName,

      importedRecordCount: result.data.monthlySalaries.length,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,

      periods: periods.map(
        (period) => `${period.year}-${String(period.month).padStart(2, "0")}`,
      ),

      warnings: collectWarnings(result.issues),
    };
  }

  async importProjectPrices(
    fileName: string,
    buffer: Buffer,
  ): Promise<ImportResult> {
    const result = await parseProjectPriceWorkbook(buffer);

    assertNoParserErrors(result.issues);

    await this.repository.upsertProjects({
      projects: result.data,

      sourceFileName: fileName,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,
    });

    return {
      kind: "PROJECT_PRICES",

      sourceFileName: fileName,

      importedRecordCount: result.data.length,

      warningCount: result.issues.filter(
        (issue) => issue.severity === "warning",
      ).length,

      periods: [],

      warnings: collectWarnings(result.issues),
    };
  }
}
