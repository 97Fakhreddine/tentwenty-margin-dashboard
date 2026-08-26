import "server-only";

import type { Project } from "@/domain/projects/project";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { MonthNumber } from "@/domain/shared/period";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { prisma } from "@/infrastructure/database/prisma";

export interface FinancialReportingData {
  readonly projects: readonly Project[];
  readonly salaries: readonly MonthlySalary[];
  readonly timesheetEntries: readonly TimesheetEntry[];
}

export class FinancialReportingRepository {
  async getYearData(year: number): Promise<FinancialReportingData> {
    const [databaseProjects, databaseSalaries, databaseTimesheetEntries] =
      await Promise.all([
        prisma.project.findMany({
          orderBy: {
            referenceCode: "asc",
          },
        }),

        prisma.monthlySalary.findMany({
          where: {
            year,
          },
        }),

        prisma.timesheetEntry.findMany({
          where: {
            year,
          },
        }),
      ]);

    const projects: Project[] = databaseProjects.map((project) => ({
      referenceCode: project.referenceCode,

      name: project.name,

      priceAed: project.priceAed,

      salesPeriod: {
        year: project.salesYear,

        month: project.salesMonth as MonthNumber,
      },

      category: project.category,

      status: project.status,
    }));

    const salaries: MonthlySalary[] = databaseSalaries.map((salary) => ({
      employeeNumber: salary.employeeNumber,

      period: {
        year: salary.year,

        month: salary.month as MonthNumber,
      },

      amountAed: salary.amountAed,
    }));

    const timesheetEntries: TimesheetEntry[] = databaseTimesheetEntries.map(
      (entry) => ({
        employeeNumber: entry.employeeNumber,

        period: {
          year: entry.year,

          month: entry.month as MonthNumber,
        },

        expenseType: entry.expenseType as "DL" | "IDL",

        department: entry.department,

        designation: entry.designation,

        category: entry.category,

        referenceCode: entry.referenceCode,

        projectOrTaskName: entry.projectOrTaskName,

        companyOrCostCenter: entry.companyOrCostCenter,

        description: entry.description,

        hours: entry.hours,
      }),
    );

    return {
      projects,
      salaries,
      timesheetEntries,
    };
  }
}
