import { DEFAULT_BILLING_CONFIGURATION } from "@/application/configuration/default-billing-configuration";

import { isBillableCategory } from "@/domain/costing/is-billable-category";

import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

import type { CategoryReportViewModel } from "./category-report.view-model";

export class CategoryReportService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getCategoryReport(
    year: number,
    month: number | null,
  ): Promise<CategoryReportViewModel> {
    const { timesheetEntries } = await this.repository.getYearData(year);

    const filteredEntries =
      month === null
        ? timesheetEntries
        : timesheetEntries.filter((entry) => entry.period.month === month);

    const totalHours = filteredEntries.reduce(
      (total, entry) => total + entry.hours,
      0,
    );

    const hoursByCategory = new Map<string, number>();

    for (const entry of filteredEntries) {
      hoursByCategory.set(
        entry.category,
        (hoursByCategory.get(entry.category) ?? 0) + entry.hours,
      );
    }

    const categories = [...hoursByCategory.entries()]
      .map(([category, hours]) => ({
        category,

        hours,

        percentageOfTotal: totalHours === 0 ? 0 : hours / totalHours,

        isBillable: isBillableCategory(category, DEFAULT_BILLING_CONFIGURATION),
      }))
      .sort((left, right) => right.hours - left.hours);

    return {
      year,
      month,
      totalHours,
      categories,
    };
  }
}
