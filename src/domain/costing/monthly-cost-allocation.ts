import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { calculateDirectHourlyRate } from "./direct-hourly-rate";
import { isBillableCategory } from "./is-billable-category";

export interface EmployeeMonthlyCostRate {
  readonly employeeNumber: string;

  readonly monthlySalaryAed: number;

  readonly totalLoggedHours: number;
  readonly billableHours: number;
  readonly nonBillableHours: number;

  readonly directHourlyRateAed: number | null;

  readonly nonBillableCostAed: number;
}

export interface MonthlyCostAllocation {
  readonly employeeRates: ReadonlyMap<string, EmployeeMonthlyCostRate>;

  readonly totalSalaryAed: number;

  readonly billableHours: number;

  readonly supportStaffSalaryAed: number;

  readonly nonBillableTimeCostAed: number;

  readonly monthlyOverheadAed: number;

  readonly indirectCostPoolAed: number;

  readonly indirectHourlyRateAed: number | null;

  readonly missingSalaryEmployeeNumbers: readonly string[];

  readonly isComplete: boolean;
}

interface CalculateMonthlyCostAllocationInput {
  readonly salaries: readonly MonthlySalary[];

  readonly timesheetEntries: readonly TimesheetEntry[];

  readonly configuration: BillingConfiguration;
}

export function calculateMonthlyCostAllocation({
  salaries,
  timesheetEntries,
  configuration,
}: CalculateMonthlyCostAllocationInput): MonthlyCostAllocation {
  const entriesByEmployee = new Map<string, TimesheetEntry[]>();

  for (const entry of timesheetEntries) {
    const employeeEntries = entriesByEmployee.get(entry.employeeNumber) ?? [];

    employeeEntries.push(entry);

    entriesByEmployee.set(entry.employeeNumber, employeeEntries);
  }

  const salaryEmployeeNumbers = new Set(
    salaries.map((salary) => salary.employeeNumber),
  );

  const missingSalaryEmployeeNumbers = [
    ...new Set(
      timesheetEntries
        .filter((entry) => !salaryEmployeeNumbers.has(entry.employeeNumber))
        .map((entry) => entry.employeeNumber),
    ),
  ];

  const totalBillableHours = timesheetEntries
    .filter((entry) => isBillableCategory(entry.category, configuration))
    .reduce((totalHours, entry) => totalHours + entry.hours, 0);

  const employeeRates = new Map<string, EmployeeMonthlyCostRate>();

  let totalSalaryAed = 0;
  let supportStaffSalaryAed = 0;
  let nonBillableTimeCostAed = 0;

  for (const salary of salaries) {
    totalSalaryAed += salary.amountAed;

    const employeeEntries = entriesByEmployee.get(salary.employeeNumber) ?? [];

    const totalLoggedHours = employeeEntries.reduce(
      (totalHours, entry) => totalHours + entry.hours,
      0,
    );

    const billableHours = employeeEntries
      .filter((entry) => isBillableCategory(entry.category, configuration))
      .reduce((totalHours, entry) => totalHours + entry.hours, 0);

    const nonBillableHours = totalLoggedHours - billableHours;

    const directHourlyRateAed = calculateDirectHourlyRate({
      monthlySalaryAed: salary.amountAed,

      totalLoggedHours,
    });

    if (totalLoggedHours === 0) {
      supportStaffSalaryAed += salary.amountAed;
    }

    const nonBillableCostAed =
      directHourlyRateAed === null ? 0 : nonBillableHours * directHourlyRateAed;

    nonBillableTimeCostAed += nonBillableCostAed;

    employeeRates.set(salary.employeeNumber, {
      employeeNumber: salary.employeeNumber,

      monthlySalaryAed: salary.amountAed,

      totalLoggedHours,

      billableHours,

      nonBillableHours,

      directHourlyRateAed,

      nonBillableCostAed,
    });
  }

  const indirectCostPoolAed =
    supportStaffSalaryAed +
    nonBillableTimeCostAed +
    configuration.monthlyOverheadAed;

  const indirectHourlyRateAed =
    totalBillableHours === 0 ? null : indirectCostPoolAed / totalBillableHours;

  return {
    employeeRates,

    totalSalaryAed,

    billableHours: totalBillableHours,

    supportStaffSalaryAed,

    nonBillableTimeCostAed,

    monthlyOverheadAed: configuration.monthlyOverheadAed,

    indirectCostPoolAed,

    indirectHourlyRateAed,

    missingSalaryEmployeeNumbers,

    isComplete: missingSalaryEmployeeNumbers.length === 0,
  };
}
