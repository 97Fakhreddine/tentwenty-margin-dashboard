import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_BILLABLE_CATEGORIES,
  type BillingConfiguration,
} from "../src/domain";

import { calculateProjectProfitabilityPortfolio } from "../src/domain/profitability/project-profitability-portfolio";

import {
  parseProjectPriceWorkbook,
  parseSalaryWorkbook,
  parseTimesheetWorkbook,
} from "../src/infrastructure/spreadsheets";

const DATA_YEAR = 2025;

const configuration: BillingConfiguration = {
  billableCategories: DEFAULT_BILLABLE_CATEGORIES,

  monthlyOverheadAed: 0,
};

function formatAed(amountAed: number | null): string {
  if (amountAed === null) {
    return "N/A";
  }

  return amountAed.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `${(value * 100).toFixed(2)}%`;
}

async function main(): Promise<void> {
  const sampleDataDirectory = path.join(process.cwd(), "data", "sample");

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

  const portfolio = calculateProjectProfitabilityPortfolio({
    projects: projectResult.data,

    salaries: salaryResult.data.monthlySalaries,

    timesheetEntries: timesheetResult.data.entries,

    configuration,
  });

  console.log("\nProject profitability");
  console.log("---------------------");

  console.table(
    portfolio.projects.map((project) => ({
      referenceCode: project.referenceCode,

      project: project.name,

      revenueAed: formatAed(project.priceAed),

      costAed: formatAed(project.totalCostAed),

      profitAed: formatAed(project.profitAed),

      margin: formatPercentage(project.profitability),

      hours: project.totalHours.toFixed(2),

      complete: project.isComplete ? "yes" : "no",
    })),
  );

  const completeProjects = portfolio.projects.filter(
    (project) => project.isComplete,
  );

  const totalRevenueAed = completeProjects.reduce(
    (total, project) => total + project.priceAed,
    0,
  );

  const totalCostAed = completeProjects.reduce(
    (total, project) => total + (project.totalCostAed ?? 0),
    0,
  );

  const totalProfitAed = totalRevenueAed - totalCostAed;

  const portfolioMargin =
    totalRevenueAed === 0 ? null : totalProfitAed / totalRevenueAed;

  console.log("\nPortfolio summary");
  console.log("-----------------");

  console.log(`Projects:            ${portfolio.projects.length}`);

  console.log(`Complete projects:   ${completeProjects.length}`);

  console.log(
    `Incomplete projects: ${
      portfolio.projects.length - completeProjects.length
    }`,
  );

  console.log(`Revenue:             AED ${formatAed(totalRevenueAed)}`);

  console.log(`Cost:                AED ${formatAed(totalCostAed)}`);

  console.log(`Profit:              AED ${formatAed(totalProfitAed)}`);

  console.log(`Portfolio margin:    ${formatPercentage(portfolioMargin)}`);

  console.log(`Unpriced ref codes:  ${portfolio.unpricedWork.length}`);

  if (portfolio.unpricedWork.length > 0) {
    console.log("\nUnpriced work");
    console.log("-------------");

    console.table(
      portfolio.unpricedWork.map((work) => ({
        referenceCode: work.referenceCode,

        hours: work.hours.toFixed(2),
      })),
    );
  }

  const projectIssues = portfolio.projects.flatMap((project) =>
    project.issues.map((issue) => ({
      referenceCode: project.referenceCode,

      code: issue.code,

      message: issue.message,
    })),
  );

  console.log(`Project issues:      ${projectIssues.length}`);

  if (projectIssues.length > 0) {
    console.log("\nProject issues");
    console.log("--------------");

    console.table(projectIssues);
  }
}

main().catch((error: unknown) => {
  console.error("\nProject profitability inspection failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
