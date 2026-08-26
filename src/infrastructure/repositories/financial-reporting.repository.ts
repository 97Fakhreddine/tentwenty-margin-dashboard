import "server-only";

import type { Project } from "@/domain/projects/project";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { MonthNumber } from "@/domain/shared/period";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";
import type { Employee } from "@/domain/employees/employee";
import { prisma } from "@/infrastructure/database/prisma";

export interface FinancialReportingData {
  readonly projects: readonly Project[];
  readonly salaries: readonly MonthlySalary[];
  readonly timesheetEntries: readonly TimesheetEntry[];
}

export interface FinancialReportingData {
  readonly employees: readonly Employee[];
  readonly projects: readonly Project[];
  readonly salaries: readonly MonthlySalary[];
  readonly timesheetEntries: readonly TimesheetEntry[];
}

export class FinancialReportingRepository {
  async getYearData(year: number): Promise<FinancialReportingData> {
    const [
      databaseEmployees,
      databaseProjects,
      databaseSalaries,
      databaseTimesheetEntries,
    ] = await Promise.all([
      prisma.employee.findMany({
        orderBy: {
          employeeNumber: "asc",
        },
      }),
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

    const employees: Employee[] = databaseEmployees.map((employee) => ({
      employeeNumber: employee.employeeNumber,
      name: employee.name,
    }));

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
      employees,
      projects,
      salaries,
      timesheetEntries,
    };
  }
  async getRecentImports(limit = 10) {
    return prisma.importBatch.findMany({
      orderBy: {
        importedAt: "desc",
      },

      take: limit,
    });
  }
}
