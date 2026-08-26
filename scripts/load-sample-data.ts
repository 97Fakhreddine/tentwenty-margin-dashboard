import { readFile } from "node:fs/promises";
import path from "node:path";

import type { MonthNumber, YearMonth } from "../src/domain/shared/period";

import { prisma } from "../src/infrastructure/database/prisma";
import { FinancialDataRepository } from "../src/infrastructure/repositories/financial-data.repository";
import {
  parseProjectPriceWorkbook,
  parseSalaryWorkbook,
  parseTimesheetWorkbook,
} from "../src/infrastructure/spreadsheets";

const DATA_YEAR = 2025;

const sampleDataDirectory = path.join(process.cwd(), "data", "sample");

const months: readonly MonthNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const fullYearPeriods: readonly YearMonth[] = months.map((month) => ({
  year: DATA_YEAR,
  month,
}));

async function main(): Promise<void> {
  const repository = new FinancialDataRepository();

  const [timesheetBuffer, salaryBuffer, projectPriceBuffer] = await Promise.all(
    [
      readFile(path.join(sampleDataDirectory, "timesheet-2025.xlsx")),
      readFile(path.join(sampleDataDirectory, "salaries-2025.xlsx")),
      readFile(path.join(sampleDataDirectory, "project-prices-2025.xlsx")),
    ],
  );

  const [timesheetResult, salaryResult, projectResult] = await Promise.all([
    parseTimesheetWorkbook(timesheetBuffer, DATA_YEAR),
    parseSalaryWorkbook(salaryBuffer, DATA_YEAR),
    parseProjectPriceWorkbook(projectPriceBuffer, DATA_YEAR),
  ]);

  await repository.replaceTimesheetPeriods({
    employees: timesheetResult.data.employees,
    entries: timesheetResult.data.entries,
    periods: fullYearPeriods,
    sourceFileName: "timesheet-2025.xlsx",
    warningCount: timesheetResult.issues.length,
  });

  await repository.replaceSalaryPeriods({
    employees: salaryResult.data.employees,
    salaries: salaryResult.data.monthlySalaries,
    periods: fullYearPeriods,
    sourceFileName: "salaries-2025.xlsx",
    warningCount: salaryResult.issues.length,
  });

  await repository.upsertProjects({
    projects: projectResult.data,
    sourceFileName: "project-prices-2025.xlsx",
    warningCount: projectResult.issues.length,
  });

  const [employeeCount, timesheetCount, salaryCount, projectCount] =
    await Promise.all([
      prisma.employee.count(),
      prisma.timesheetEntry.count(),
      prisma.monthlySalary.count(),
      prisma.project.count(),
    ]);

  console.log("\nSample data loaded");
  console.log("------------------");
  console.log(`Employees:  ${employeeCount}`);
  console.log(`Timesheets: ${timesheetCount}`);
  console.log(`Salaries:   ${salaryCount}`);
  console.log(`Projects:   ${projectCount}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
