import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import { toPeriodKey } from "@/domain/shared/period-key";
import type { YearMonth } from "@/domain/shared/period";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import {
  calculateMonthlyCostAllocation,
  type MonthlyCostAllocation,
} from "./monthly-cost-allocation";

interface CalculateCostAllocationsByPeriodInput {
  readonly salaries: readonly MonthlySalary[];
  readonly timesheetEntries: readonly TimesheetEntry[];
  readonly configuration: BillingConfiguration;
}

export function calculateCostAllocationsByPeriod({
  salaries,
  timesheetEntries,
  configuration,
}: CalculateCostAllocationsByPeriodInput): ReadonlyMap<
  string,
  MonthlyCostAllocation
> {
  const periods = new Map<string, YearMonth>();

  for (const salary of salaries) {
    periods.set(toPeriodKey(salary.period), salary.period);
  }

  for (const entry of timesheetEntries) {
    periods.set(toPeriodKey(entry.period), entry.period);
  }

  const allocations = new Map<string, MonthlyCostAllocation>();

  for (const [periodKey, period] of periods) {
    const periodSalaries = salaries.filter(
      (salary) =>
        salary.period.year === period.year &&
        salary.period.month === period.month,
    );

    const periodEntries = timesheetEntries.filter(
      (entry) =>
        entry.period.year === period.year &&
        entry.period.month === period.month,
    );

    allocations.set(
      periodKey,
      calculateMonthlyCostAllocation({
        salaries: periodSalaries,
        timesheetEntries: periodEntries,
        configuration,
      }),
    );
  }

  return allocations;
}
