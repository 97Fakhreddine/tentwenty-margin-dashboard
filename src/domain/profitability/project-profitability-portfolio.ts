import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";
import type { Project } from "@/domain/projects/project";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { calculateCostAllocationsByPeriod } from "@/domain/costing/cost-allocations-by-period";
import { isBillableCategory } from "@/domain/costing/is-billable-category";

import {
  calculateProjectProfitability,
  type ProjectProfitabilityResult,
} from "./project-profitability";

export interface UnpricedProjectWork {
  readonly referenceCode: string;
  readonly hours: number;
}

export interface ProjectProfitabilityPortfolio {
  readonly projects: readonly ProjectProfitabilityResult[];

  readonly unpricedWork: readonly UnpricedProjectWork[];
}

interface CalculateProjectProfitabilityPortfolioInput {
  readonly projects: readonly Project[];

  readonly salaries: readonly MonthlySalary[];

  readonly timesheetEntries: readonly TimesheetEntry[];

  readonly configuration: BillingConfiguration;
}

export function calculateProjectProfitabilityPortfolio({
  projects,
  salaries,
  timesheetEntries,
  configuration,
}: CalculateProjectProfitabilityPortfolioInput): ProjectProfitabilityPortfolio {
  const costAllocationsByPeriod = calculateCostAllocationsByPeriod({
    salaries,
    timesheetEntries,
    configuration,
  });

  const profitabilityResults = projects.map((project) =>
    calculateProjectProfitability({
      project,
      timesheetEntries,
      costAllocationsByPeriod,
      configuration,
    }),
  );

  const knownReferenceCodes = new Set(
    projects.map((project) => project.referenceCode),
  );

  const unpricedHoursByReferenceCode = new Map<string, number>();

  for (const entry of timesheetEntries) {
    if (
      !entry.referenceCode ||
      !isBillableCategory(entry.category, configuration) ||
      knownReferenceCodes.has(entry.referenceCode)
    ) {
      continue;
    }

    unpricedHoursByReferenceCode.set(
      entry.referenceCode,
      (unpricedHoursByReferenceCode.get(entry.referenceCode) ?? 0) +
        entry.hours,
    );
  }

  return {
    projects: profitabilityResults,

    unpricedWork: [...unpricedHoursByReferenceCode.entries()].map(
      ([referenceCode, hours]) => ({
        referenceCode,
        hours,
      }),
    ),
  };
}
