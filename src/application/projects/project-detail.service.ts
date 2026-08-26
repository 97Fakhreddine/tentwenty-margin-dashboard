import { DEFAULT_BILLING_CONFIGURATION } from "@/application/configuration/default-billing-configuration";

import { calculateCostAllocationsByPeriod } from "@/domain/costing/cost-allocations-by-period";

import { calculateProjectProfitability } from "@/domain/profitability/project-profitability";

import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

import type { ProjectDetailViewModel } from "./project-detail.view-model";

export class ProjectDetailService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getProjectDetail(
    referenceCode: string,
    year: number,
  ): Promise<ProjectDetailViewModel | null> {
    const { employees, projects, salaries, timesheetEntries } =
      await this.repository.getYearData(year);

    const project = projects.find(
      (candidate) => candidate.referenceCode === referenceCode,
    );

    if (!project) {
      return null;
    }

    const costAllocationsByPeriod = calculateCostAllocationsByPeriod({
      salaries,
      timesheetEntries,
      configuration: DEFAULT_BILLING_CONFIGURATION,
    });

    const profitability = calculateProjectProfitability({
      project,
      timesheetEntries,
      costAllocationsByPeriod,
      configuration: DEFAULT_BILLING_CONFIGURATION,
    });

    const employeeNameByNumber = new Map(
      employees.map((employee) => [employee.employeeNumber, employee.name]),
    );

    return {
      referenceCode: project.referenceCode,
      name: project.name,

      category: project.category,
      status: project.status,

      priceAed: profitability.priceAed,

      totalHours: profitability.totalHours,
      totalCostAed: profitability.totalCostAed,

      profitAed: profitability.profitAed,

      margin: profitability.profitability,

      employees: profitability.employeeContributions
        .map((contribution) => ({
          employeeNumber: contribution.employeeNumber,

          employeeName:
            employeeNameByNumber.get(contribution.employeeNumber) ??
            contribution.employeeNumber,

          hours: contribution.hours,

          costAed: contribution.costAed,

          revenueShareAed: contribution.revenueShareAed,

          profitAed: contribution.profitAed,

          profitability: contribution.profitability,
        }))
        .sort((left, right) => right.hours - left.hours),

      departments: profitability.departmentContributions
        .map((department) => ({
          department: department.department,

          hours: department.hours,

          costAed: department.costAed,
        }))
        .sort((left, right) => right.hours - left.hours),

      issues: profitability.issues.map((issue) => issue.message),

      isComplete: profitability.isComplete,
    };
  }
}
