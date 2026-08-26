import {
  DEFAULT_BILLABLE_CATEGORIES,
  type BillingConfiguration,
} from "@/domain";

import { isBillableCategory } from "@/domain/costing/is-billable-category";

import { calculateProjectProfitabilityPortfolio } from "@/domain/profitability/project-profitability-portfolio";

import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

import type { DashboardViewModel } from "./dashboard.view-model";

const DEFAULT_CONFIGURATION: BillingConfiguration = {
  billableCategories: DEFAULT_BILLABLE_CATEGORIES,

  monthlyOverheadAed: 0,
};

export class DashboardService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getDashboard(year: number): Promise<DashboardViewModel> {
    const { projects, salaries, timesheetEntries } =
      await this.repository.getYearData(year);

    const portfolio = calculateProjectProfitabilityPortfolio({
      projects,
      salaries,
      timesheetEntries,
      configuration: DEFAULT_CONFIGURATION,
    });

    const totalHours = timesheetEntries.reduce(
      (total, entry) => total + entry.hours,
      0,
    );

    const billableHours = timesheetEntries
      .filter((entry) =>
        isBillableCategory(entry.category, DEFAULT_CONFIGURATION),
      )
      .reduce((total, entry) => total + entry.hours, 0);

    const dashboardProjects = portfolio.projects.map((project) => ({
      referenceCode: project.referenceCode,

      name: project.name,

      revenueAed: project.priceAed,

      costAed: project.totalCostAed,

      profitAed: project.profitAed,

      margin: project.profitability,

      hours: project.totalHours,

      isComplete: project.isComplete,
    }));

    const completeProjects = dashboardProjects.filter(
      (project) => project.isComplete && project.costAed !== null,
    );

    const totalRevenueAed = dashboardProjects.reduce(
      (total, project) => total + project.revenueAed,
      0,
    );

    const totalCostAed = completeProjects.reduce(
      (total, project) => total + (project.costAed ?? 0),
      0,
    );

    const allProjectsComplete =
      completeProjects.length === dashboardProjects.length &&
      portfolio.unpricedWork.length === 0;

    const totalProfitAed = allProjectsComplete
      ? totalRevenueAed - totalCostAed
      : 0;

    const margin =
      allProjectsComplete && totalRevenueAed !== 0
        ? totalProfitAed / totalRevenueAed
        : null;

    return {
      year,

      totalHours,
      billableHours,

      revenue: {
        value: totalRevenueAed,

        isComplete: portfolio.unpricedWork.length === 0,
      },

      cost: {
        value: totalCostAed,

        isComplete: allProjectsComplete,
      },

      profit: {
        value: totalProfitAed,

        isComplete: allProjectsComplete,
      },

      margin,

      projects: dashboardProjects.sort(
        (left, right) =>
          (right.margin ?? Number.NEGATIVE_INFINITY) -
          (left.margin ?? Number.NEGATIVE_INFINITY),
      ),

      incompleteProjectCount: dashboardProjects.filter(
        (project) => !project.isComplete,
      ).length,

      unpricedReferenceCodeCount: portfolio.unpricedWork.length,
    };
  }
}
