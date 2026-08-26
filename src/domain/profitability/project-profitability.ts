import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";
import type { Project } from "@/domain/projects/project";
import { toPeriodKey } from "@/domain/shared/period-key";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import type { MonthlyCostAllocation } from "@/domain/costing/monthly-cost-allocation";
import { calculateEmployeeProjectCost } from "@/domain/costing/employee-project-cost";
import { isBillableCategory } from "@/domain/costing/is-billable-category";

import { calculateEmployeeRevenueShare } from "./employee-revenue-share";
import { calculateProfitability } from "./calculate-profitability";

export interface EmployeeProjectContribution {
  readonly employeeNumber: string;
  readonly hours: number;

  readonly costAed: number | null;

  readonly revenueShareAed: number;

  readonly profitAed: number | null;

  readonly profitability: number | null;
}

export interface DepartmentProjectContribution {
  readonly department: string;
  readonly hours: number;
  readonly costAed: number | null;
}

export interface ProjectProfitabilityIssue {
  readonly code:
    | "MISSING_MONTHLY_ALLOCATION"
    | "MISSING_EMPLOYEE_RATE"
    | "MISSING_DIRECT_RATE";

  readonly message: string;
}

export interface ProjectProfitabilityResult {
  readonly referenceCode: string;
  readonly name: string;

  readonly priceAed: number;

  readonly totalHours: number;

  readonly totalCostAed: number | null;

  readonly profitAed: number | null;

  readonly profitability: number | null;

  readonly employeeContributions: readonly EmployeeProjectContribution[];

  readonly departmentContributions: readonly DepartmentProjectContribution[];

  readonly issues: readonly ProjectProfitabilityIssue[];

  readonly isComplete: boolean;
}

interface CalculateProjectProfitabilityInput {
  readonly project: Project;

  readonly timesheetEntries: readonly TimesheetEntry[];

  readonly costAllocationsByPeriod: ReadonlyMap<string, MonthlyCostAllocation>;

  readonly configuration: BillingConfiguration;
}

export function calculateProjectProfitability({
  project,
  timesheetEntries,
  costAllocationsByPeriod,
  configuration,
}: CalculateProjectProfitabilityInput): ProjectProfitabilityResult {
  const projectEntries = timesheetEntries.filter(
    (entry) =>
      entry.referenceCode === project.referenceCode &&
      isBillableCategory(entry.category, configuration),
  );

  const totalHours = projectEntries.reduce(
    (total, entry) => total + entry.hours,
    0,
  );

  const issues: ProjectProfitabilityIssue[] = [];

  const employeeHours = new Map<string, number>();

  const employeeCosts = new Map<string, number>();

  const employeesWithUnknownCost = new Set<string>();

  const departmentHours = new Map<string, number>();

  const departmentCosts = new Map<string, number>();

  const departmentsWithUnknownCost = new Set<string>();

  for (const entry of projectEntries) {
    employeeHours.set(
      entry.employeeNumber,
      (employeeHours.get(entry.employeeNumber) ?? 0) + entry.hours,
    );

    departmentHours.set(
      entry.department,
      (departmentHours.get(entry.department) ?? 0) + entry.hours,
    );

    const allocation = costAllocationsByPeriod.get(toPeriodKey(entry.period));

    if (!allocation) {
      issues.push({
        code: "MISSING_MONTHLY_ALLOCATION",
        message:
          `No cost allocation exists for ` + `${toPeriodKey(entry.period)}.`,
      });
      employeesWithUnknownCost.add(entry.employeeNumber);
      departmentsWithUnknownCost.add(entry.department);
      continue;
    }

    const employeeRate = allocation.employeeRates.get(entry.employeeNumber);

    if (!employeeRate) {
      issues.push({
        code: "MISSING_EMPLOYEE_RATE",
        message:
          `No salary/cost rate exists for employee ` +
          `${entry.employeeNumber} in ${toPeriodKey(entry.period)}.`,
      });

      employeesWithUnknownCost.add(entry.employeeNumber);

      departmentsWithUnknownCost.add(entry.department);

      continue;
    }

    if (
      employeeRate.directHourlyRateAed === null ||
      allocation.indirectHourlyRateAed === null
    ) {
      issues.push({
        code: "MISSING_DIRECT_RATE",
        message:
          `Cost rate cannot be calculated for employee ` +
          `${entry.employeeNumber} in ${toPeriodKey(entry.period)}.`,
      });

      employeesWithUnknownCost.add(entry.employeeNumber);

      departmentsWithUnknownCost.add(entry.department);

      continue;
    }

    const entryCostAed = calculateEmployeeProjectCost({
      hours: entry.hours,

      directHourlyRateAed: employeeRate.directHourlyRateAed,

      indirectHourlyRateAed: allocation.indirectHourlyRateAed,
    });

    employeeCosts.set(
      entry.employeeNumber,
      (employeeCosts.get(entry.employeeNumber) ?? 0) + entryCostAed,
    );

    departmentCosts.set(
      entry.department,
      (departmentCosts.get(entry.department) ?? 0) + entryCostAed,
    );
  }

  const employeeContributions = [...employeeHours.entries()].map(
    ([employeeNumber, hours]) => {
      const revenueShareAed =
        calculateEmployeeRevenueShare({
          projectPriceAed: project.priceAed,

          employeeHours: hours,

          totalProjectHours: totalHours,
        }) ?? 0;

      const costAed = employeesWithUnknownCost.has(employeeNumber)
        ? null
        : (employeeCosts.get(employeeNumber) ?? 0);

      const profitability =
        costAed === null
          ? null
          : calculateProfitability(revenueShareAed, costAed);

      return {
        employeeNumber,
        hours,
        costAed,
        revenueShareAed,

        profitAed: costAed === null ? null : revenueShareAed - costAed,

        profitability,
      };
    },
  );

  const departmentContributions = [...departmentHours.entries()].map(
    ([department, hours]) => ({
      department,

      hours,

      costAed: departmentsWithUnknownCost.has(department)
        ? null
        : (departmentCosts.get(department) ?? 0),
    }),
  );

  const hasUnknownCost = employeeContributions.some(
    (contribution) => contribution.costAed === null,
  );

  const totalCostAed = hasUnknownCost
    ? null
    : employeeContributions.reduce(
        (total, contribution) => total + (contribution.costAed ?? 0),
        0,
      );

  const profitAed =
    totalCostAed === null ? null : project.priceAed - totalCostAed;

  const profitability =
    totalCostAed === null
      ? null
      : calculateProfitability(project.priceAed, totalCostAed);

  return {
    referenceCode: project.referenceCode,
    name: project.name,
    priceAed: project.priceAed,
    totalHours,
    totalCostAed,
    profitAed,
    profitability,
    employeeContributions,
    departmentContributions,
    issues,
    isComplete: totalCostAed !== null && issues.length === 0,
  };
}
