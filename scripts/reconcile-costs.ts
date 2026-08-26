import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_BILLABLE_CATEGORIES,
  type BillingConfiguration,
} from "../src/domain";

import { calculateEmployeeProjectCost } from "../src/domain/costing/employee-project-cost";
import { calculateMonthlyCostAllocation } from "../src/domain/costing/monthly-cost-allocation";

import {
  parseSalaryWorkbook,
  parseTimesheetWorkbook,
} from "../src/infrastructure/spreadsheets";

const DATA_YEAR = 2025;

const configuration: BillingConfiguration = {
  billableCategories: DEFAULT_BILLABLE_CATEGORIES,

  monthlyOverheadAed: 0,
};

async function main(): Promise<void> {
  const sampleDataDirectory = path.join(process.cwd(), "data", "sample");

  const [salaryBuffer, timesheetBuffer] = await Promise.all([
    readFile(path.join(sampleDataDirectory, "salaries-2025.xlsx")),

    readFile(path.join(sampleDataDirectory, "timesheet-2025.xlsx")),
  ]);

  const [salaryResult, timesheetResult] = await Promise.all([
    parseSalaryWorkbook(salaryBuffer, DATA_YEAR),

    parseTimesheetWorkbook(timesheetBuffer, DATA_YEAR),
  ]);

  let annualSalaryAed = 0;

  let annualAllocatedCostAed = 0;

  for (let month = 1; month <= 12; month += 1) {
    const monthlySalaries = salaryResult.data.monthlySalaries.filter(
      (salary) =>
        salary.period.year === DATA_YEAR && salary.period.month === month,
    );

    const monthlyEntries = timesheetResult.data.entries.filter(
      (entry) =>
        entry.period.year === DATA_YEAR && entry.period.month === month,
    );

    const allocation = calculateMonthlyCostAllocation({
      salaries: monthlySalaries,

      timesheetEntries: monthlyEntries,

      configuration,
    });

    if (!allocation.isComplete) {
      throw new Error(
        `Missing salary data for month ${month}: ` +
          allocation.missingSalaryEmployeeNumbers.join(", "),
      );
    }

    if (allocation.indirectHourlyRateAed === null) {
      throw new Error(`No billable hours available for month ${month}.`);
    }

    let monthlyAllocatedCostAed = 0;

    for (const entry of monthlyEntries) {
      if (!configuration.billableCategories.includes(entry.category)) {
        continue;
      }

      const employeeRate = allocation.employeeRates.get(entry.employeeNumber);

      if (!employeeRate || employeeRate.directHourlyRateAed === null) {
        throw new Error(
          `Direct cost rate unavailable for employee ${entry.employeeNumber}.`,
        );
      }

      monthlyAllocatedCostAed += calculateEmployeeProjectCost({
        hours: entry.hours,

        directHourlyRateAed: employeeRate.directHourlyRateAed,

        indirectHourlyRateAed: allocation.indirectHourlyRateAed,
      });
    }

    annualSalaryAed += allocation.totalSalaryAed;

    annualAllocatedCostAed += monthlyAllocatedCostAed;

    console.log(
      `${DATA_YEAR}-${String(month).padStart(2, "0")} ` +
        `salary=AED ${allocation.totalSalaryAed.toFixed(2)} ` +
        `allocated=AED ${monthlyAllocatedCostAed.toFixed(2)}`,
    );
  }

  const differenceAed = annualAllocatedCostAed - annualSalaryAed;

  console.log("\nAnnual reconciliation");

  console.log("---------------------");

  console.log(`Salary:     AED ${annualSalaryAed.toFixed(2)}`);

  console.log(`Allocated:  AED ${annualAllocatedCostAed.toFixed(2)}`);

  console.log(`Difference: AED ${differenceAed.toFixed(6)}`);

  if (Math.abs(differenceAed) > 0.01) {
    throw new Error("Annual cost reconciliation failed.");
  }

  console.log("\nPASSED: allocated costs reconcile to salaries.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
