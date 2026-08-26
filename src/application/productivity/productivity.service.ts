import { DEFAULT_BILLING_CONFIGURATION } from "@/application/configuration/default-billing-configuration";

import { isBillableCategory } from "@/domain/costing/is-billable-category";
import { calculateProductivity } from "@/domain/productivity/calculate-productivity";

import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

import type { ProductivityViewModel } from "./productivity.view-model";

export class ProductivityService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getProductivity(
    year: number,
    month: number | null,
  ): Promise<ProductivityViewModel> {
    const { employees, timesheetEntries } =
      await this.repository.getYearData(year);

    const filteredEntries =
      month === null
        ? timesheetEntries
        : timesheetEntries.filter((entry) => entry.period.month === month);

    const entriesByEmployee = new Map<string, typeof filteredEntries>();

    for (const entry of filteredEntries) {
      const current = entriesByEmployee.get(entry.employeeNumber) ?? [];

      entriesByEmployee.set(entry.employeeNumber, [...current, entry]);
    }

    const employeeNameByNumber = new Map(
      employees.map((employee) => [employee.employeeNumber, employee.name]),
    );

    const rows = [...entriesByEmployee.entries()].map(
      ([employeeNumber, entries]) => {
        const totalHours = entries.reduce(
          (total, entry) => total + entry.hours,
          0,
        );

        const billableHours = entries
          .filter((entry) =>
            isBillableCategory(entry.category, DEFAULT_BILLING_CONFIGURATION),
          )
          .reduce((total, entry) => total + entry.hours, 0);

        return {
          employeeNumber,

          employeeName:
            employeeNameByNumber.get(employeeNumber) ?? employeeNumber,

          totalHours,

          billableHours,

          nonBillableHours: totalHours - billableHours,

          productivity: calculateProductivity(billableHours, totalHours),
        };
      },
    );

    return {
      year,
      month,

      employees: rows.sort(
        (left, right) => (right.productivity ?? -1) - (left.productivity ?? -1),
      ),
    };
  }
}
