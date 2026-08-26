import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  parseProjectPriceWorkbook,
  parseSalaryWorkbook,
  parseTimesheetWorkbook,
  type SpreadsheetIssue,
} from "../src/infrastructure/spreadsheets";

const SAMPLE_DATA_DIRECTORY = path.join(process.cwd(), "data", "sample");

const DATA_YEAR = 2025;

function printSection(title: string): void {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printIssues(issues: readonly SpreadsheetIssue[]): void {
  if (issues.length === 0) {
    console.log("Issues: none");
    return;
  }

  const errors = issues.filter((issue) => issue.severity === "error");

  const warnings = issues.filter((issue) => issue.severity === "warning");

  console.log(`Errors:   ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  for (const issue of issues.slice(0, 10)) {
    const field = issue.field ? ` [${issue.field}]` : "";

    console.log(
      `  ${issue.severity.toUpperCase()} row ${issue.rowNumber}${field}: ${issue.message}`,
    );
  }

  if (issues.length > 10) {
    console.log(`  ... ${issues.length - 10} additional issue(s)`);
  }
}

async function main(): Promise<void> {
  const [timesheetBuffer, salaryBuffer, projectPriceBuffer] = await Promise.all(
    [
      readFile(path.join(SAMPLE_DATA_DIRECTORY, "timesheet-2025.xlsx")),
      readFile(path.join(SAMPLE_DATA_DIRECTORY, "salaries-2025.xlsx")),
      readFile(path.join(SAMPLE_DATA_DIRECTORY, "project-prices-2025.xlsx")),
    ],
  );

  const [timesheetResult, salaryResult, projectResult] = await Promise.all([
    parseTimesheetWorkbook(timesheetBuffer, DATA_YEAR),
    parseSalaryWorkbook(salaryBuffer, DATA_YEAR),
    parseProjectPriceWorkbook(projectPriceBuffer, DATA_YEAR),
  ]);

  printSection("Timesheet");

  console.log(`Entries:   ${timesheetResult.data.entries.length}`);

  console.log(`Employees: ${timesheetResult.data.employees.length}`);

  const totalLoggedHours = timesheetResult.data.entries.reduce(
    (totalHours, entry) => totalHours + entry.hours,
    0,
  );

  console.log(`Hours:     ${totalLoggedHours.toFixed(2)}`);

  printIssues(timesheetResult.issues);

  printSection("Salaries");

  console.log(`Employees: ${salaryResult.data.employees.length}`);

  console.log(
    `Monthly salary records: ${salaryResult.data.monthlySalaries.length}`,
  );

  const totalSalaryAed = salaryResult.data.monthlySalaries.reduce(
    (totalSalary, salary) => totalSalary + salary.amountAed,
    0,
  );

  console.log(
    `Annual salary total: AED ${totalSalaryAed.toLocaleString("en-US")}`,
  );

  printIssues(salaryResult.issues);

  printSection("Projects");

  console.log(`Projects: ${projectResult.data.length}`);

  const totalProjectPriceAed = projectResult.data.reduce(
    (totalPrice, project) => totalPrice + project.priceAed,
    0,
  );

  console.log(
    `Total listed price: AED ${totalProjectPriceAed.toLocaleString("en-US")}`,
  );

  printIssues(projectResult.issues);

  printSection("Cross-file validation");

  const salaryPeriods = new Set(
    salaryResult.data.monthlySalaries.map(
      (salary) =>
        `${salary.employeeNumber}:${salary.period.year}:${salary.period.month}`,
    ),
  );

  const missingSalaryPeriods = new Map<
    string,
    {
      employeeNumber: string;
      year: number;
      month: number;
    }
  >();

  for (const entry of timesheetResult.data.entries) {
    const salaryKey =
      `${entry.employeeNumber}:` +
      `${entry.period.year}:` +
      `${entry.period.month}`;

    if (!salaryPeriods.has(salaryKey)) {
      missingSalaryPeriods.set(salaryKey, {
        employeeNumber: entry.employeeNumber,
        year: entry.period.year,
        month: entry.period.month,
      });
    }
  }

  const projectReferenceCodes = new Set(
    projectResult.data.map((project) => project.referenceCode),
  );

  const billableCategories = new Set(["Projects", "Enhancements", "Hosting"]);

  const missingProjectPrices = new Set<string>();

  for (const entry of timesheetResult.data.entries) {
    if (!billableCategories.has(entry.category) || !entry.referenceCode) {
      continue;
    }

    if (!projectReferenceCodes.has(entry.referenceCode)) {
      missingProjectPrices.add(entry.referenceCode);
    }
  }

  console.log(
    `Logged employee-months without salary: ${missingSalaryPeriods.size}`,
  );

  for (const item of missingSalaryPeriods.values()) {
    console.log(
      `  - ${item.employeeNumber}: ${item.year}-${String(item.month).padStart(2, "0")}`,
    );
  }

  console.log(
    `Billable reference codes without project price: ${missingProjectPrices.size}`,
  );

  for (const referenceCode of missingProjectPrices) {
    console.log(`  - ${referenceCode}`);
  }

  const parserErrors = [
    ...timesheetResult.issues,
    ...salaryResult.issues,
    ...projectResult.issues,
  ].filter((issue) => issue.severity === "error");

  printSection("Result");

  if (parserErrors.length > 0) {
    console.error(
      `FAILED: ${parserErrors.length} parser error(s) must be resolved.`,
    );

    process.exitCode = 1;
    return;
  }

  console.log("PASSED: all three workbooks were parsed successfully.");
}

main().catch((error: unknown) => {
  console.error("\nData inspection failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
