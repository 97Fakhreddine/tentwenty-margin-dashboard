import type { Employee } from "@/domain/employees/employee";
import type { Project } from "@/domain/projects/project";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { YearMonth } from "@/domain/shared/period";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { prisma } from "@/infrastructure/database/prisma";

interface ReplaceTimesheetPeriodsInput {
  readonly employees: readonly Employee[];
  readonly entries: readonly TimesheetEntry[];
  readonly periods: readonly YearMonth[];
  readonly sourceFileName: string;
  readonly warningCount: number;
}

interface ReplaceSalaryPeriodsInput {
  readonly employees: readonly Employee[];
  readonly salaries: readonly MonthlySalary[];
  readonly periods: readonly YearMonth[];
  readonly sourceFileName: string;
  readonly warningCount: number;
}

interface UpsertProjectsInput {
  readonly projects: readonly Project[];
  readonly sourceFileName: string;
  readonly warningCount: number;
}

export class FinancialDataRepository {
  async replaceTimesheetPeriods(
    input: ReplaceTimesheetPeriodsInput,
  ): Promise<void> {
    if (input.periods.length === 0) {
      throw new Error(
        "At least one period is required for timesheet replacement.",
      );
    }

    await prisma.$transaction(async (transaction) => {
      for (const employee of input.employees) {
        await transaction.employee.upsert({
          where: {
            employeeNumber: employee.employeeNumber,
          },
          update: {
            name: employee.name,
          },
          create: {
            employeeNumber: employee.employeeNumber,
            name: employee.name,
          },
        });
      }

      await transaction.timesheetEntry.deleteMany({
        where: {
          OR: input.periods.map((period) => ({
            year: period.year,
            month: period.month,
          })),
        },
      });

      if (input.entries.length > 0) {
        await transaction.timesheetEntry.createMany({
          data: input.entries.map((entry) => ({
            employeeNumber: entry.employeeNumber,
            year: entry.period.year,
            month: entry.period.month,
            expenseType: entry.expenseType,
            department: entry.department,
            designation: entry.designation,
            category: entry.category,
            referenceCode: entry.referenceCode,
            projectOrTaskName: entry.projectOrTaskName,
            companyOrCostCenter: entry.companyOrCostCenter,
            description: entry.description,
            hours: entry.hours,
          })),
        });
      }

      await transaction.importBatch.create({
        data: {
          kind: "TIMESHEET",
          sourceFileName: input.sourceFileName,
          recordCount: input.entries.length,
          warningCount: input.warningCount,
        },
      });
    });
  }

  async replaceSalaryPeriods(input: ReplaceSalaryPeriodsInput): Promise<void> {
    if (input.periods.length === 0) {
      throw new Error(
        "At least one period is required for salary replacement.",
      );
    }

    await prisma.$transaction(async (transaction) => {
      for (const employee of input.employees) {
        await transaction.employee.upsert({
          where: {
            employeeNumber: employee.employeeNumber,
          },
          update: {
            name: employee.name,
          },
          create: {
            employeeNumber: employee.employeeNumber,
            name: employee.name,
          },
        });
      }

      await transaction.monthlySalary.deleteMany({
        where: {
          OR: input.periods.map((period) => ({
            year: period.year,
            month: period.month,
          })),
        },
      });

      if (input.salaries.length > 0) {
        await transaction.monthlySalary.createMany({
          data: input.salaries.map((salary) => ({
            employeeNumber: salary.employeeNumber,
            year: salary.period.year,
            month: salary.period.month,
            amountAed: salary.amountAed,
          })),
        });
      }

      await transaction.importBatch.create({
        data: {
          kind: "SALARY",
          sourceFileName: input.sourceFileName,
          recordCount: input.salaries.length,
          warningCount: input.warningCount,
        },
      });
    });
  }

  async upsertProjects(input: UpsertProjectsInput): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      for (const project of input.projects) {
        await transaction.project.upsert({
          where: {
            referenceCode: project.referenceCode,
          },
          update: {
            name: project.name,
            priceAed: project.priceAed,
            salesYear: project.salesPeriod.year,
            salesMonth: project.salesPeriod.month,
            category: project.category,
            status: project.status,
          },
          create: {
            referenceCode: project.referenceCode,
            name: project.name,
            priceAed: project.priceAed,
            salesYear: project.salesPeriod.year,
            salesMonth: project.salesPeriod.month,
            category: project.category,
            status: project.status,
          },
        });
      }

      await transaction.importBatch.create({
        data: {
          kind: "PROJECT_PRICES",
          sourceFileName: input.sourceFileName,
          recordCount: input.projects.length,
          warningCount: input.warningCount,
        },
      });
    });
  }
}
