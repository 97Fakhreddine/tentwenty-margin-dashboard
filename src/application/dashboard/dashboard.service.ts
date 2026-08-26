import { DEFAULT_BILLING_CONFIGURATION } from "@/application/configuration/default-billing-configuration";

import { isBillableCategory } from "@/domain/costing/is-billable-category";
import { calculateCostAllocationsByPeriod } from "@/domain/costing/cost-allocations-by-period";

import { calculateProjectProfitability } from "@/domain/profitability/project-profitability";

import type { MonthNumber } from "@/domain/shared/period";

import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

import {
  SALES_MONTH_REVENUE_RECOGNITION,
  type RevenueRecognitionPeriod,
} from "./revenue-recognition-policy";

import type {
  DashboardProjectRow,
  DashboardViewModel,
} from "./dashboard.view-model";

export class DashboardService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getDashboard(
    year: number,
    month: MonthNumber | null,
  ): Promise<DashboardViewModel> {
    const [data, availableYears] = await Promise.all([
      this.repository.getYearData(year),

      this.repository.getAvailableYears(),
    ]);

    const { projects, salaries, timesheetEntries } = data;

    const filteredTimesheetEntries =
      month === null
        ? timesheetEntries
        : timesheetEntries.filter((entry) => entry.period.month === month);

    const filteredSalaries =
      month === null
        ? salaries
        : salaries.filter((salary) => salary.period.month === month);

    const period: RevenueRecognitionPeriod = {
      year,
      month,
    };

    const costAllocationsByPeriod = calculateCostAllocationsByPeriod({
      salaries: filteredSalaries,

      timesheetEntries: filteredTimesheetEntries,

      configuration: DEFAULT_BILLING_CONFIGURATION,
    });

    const totalHours = filteredTimesheetEntries.reduce(
      (total, entry) => total + entry.hours,
      0,
    );

    const billableEntries = filteredTimesheetEntries.filter((entry) =>
      isBillableCategory(entry.category, DEFAULT_BILLING_CONFIGURATION),
    );

    const billableHours = billableEntries.reduce(
      (total, entry) => total + entry.hours,
      0,
    );

    const knownReferenceCodes = new Set(
      projects.map((project) => project.referenceCode),
    );

    const unpricedReferenceCodes = new Set(
      billableEntries
        .map((entry) => entry.referenceCode)
        .filter(
          (referenceCode): referenceCode is string =>
            referenceCode !== null && !knownReferenceCodes.has(referenceCode),
        ),
    );

    const dashboardProjects: DashboardProjectRow[] = projects
      .map((project) => {
        /*
         * We pass only entries from the selected period.
         * We consume the resulting cost/hours fields here.
         *
         * Revenue for the dashboard period is handled
         * separately by the revenue-recognition policy.
         */
        const delivery = calculateProjectProfitability({
          project,

          timesheetEntries: filteredTimesheetEntries,

          costAllocationsByPeriod,

          configuration: DEFAULT_BILLING_CONFIGURATION,
        });

        const revenueAed = SALES_MONTH_REVENUE_RECOGNITION.recognizedRevenueAed(
          project,
          period,
        );

        const profitAed =
          delivery.totalCostAed === null
            ? null
            : revenueAed - delivery.totalCostAed;

        const margin =
          profitAed !== null && revenueAed > 0 ? profitAed / revenueAed : null;

        return {
          referenceCode: project.referenceCode,

          name: project.name,

          revenueAed,

          costAed: delivery.totalCostAed,

          profitAed,

          margin,

          hours: delivery.totalHours,

          isComplete: delivery.isComplete,
        };
      })
      .filter((project) => project.hours > 0 || project.revenueAed > 0);

    const revenueComplete = unpricedReferenceCodes.size === 0;

    const costComplete =
      unpricedReferenceCodes.size === 0 &&
      dashboardProjects.every(
        (project) => project.isComplete && project.costAed !== null,
      );

    const totalRevenueAed = dashboardProjects.reduce(
      (total, project) => total + project.revenueAed,
      0,
    );

    const totalCostAed = dashboardProjects.reduce(
      (total, project) => total + (project.costAed ?? 0),
      0,
    );

    const profitComplete = revenueComplete && costComplete;

    const totalProfitAed = profitComplete
      ? totalRevenueAed - totalCostAed
      : null;

    const margin =
      totalProfitAed !== null && totalRevenueAed > 0
        ? totalProfitAed / totalRevenueAed
        : null;

    return {
      filters: {
        year,
        month,
      },

      availableYears: availableYears.length > 0 ? availableYears : [year],

      revenueRecognitionLabel: SALES_MONTH_REVENUE_RECOGNITION.label,

      totalHours,
      billableHours,

      revenue: {
        value: revenueComplete ? totalRevenueAed : null,

        isComplete: revenueComplete,
      },

      cost: {
        value: costComplete ? totalCostAed : null,

        isComplete: costComplete,
      },

      profit: {
        value: totalProfitAed,

        isComplete: profitComplete,
      },

      margin,

      projects: dashboardProjects.sort((left, right) => {
        if (left.margin === null && right.margin === null) {
          return right.hours - left.hours;
        }

        if (left.margin === null) {
          return 1;
        }

        if (right.margin === null) {
          return -1;
        }

        return right.margin - left.margin;
      }),

      incompleteProjectCount: dashboardProjects.filter(
        (project) => !project.isComplete,
      ).length,

      unpricedReferenceCodeCount: unpricedReferenceCodes.size,
    };
  }
}
