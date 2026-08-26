import type { EmployeeNumber } from "@/domain/shared/identifiers";
import type { YearMonth } from "@/domain/shared/period";

export type ExpenseType = "DL" | "IDL";

export interface TimesheetEntry {
  readonly period: YearMonth;

  readonly employeeNumber: EmployeeNumber;

  readonly expenseType: ExpenseType;

  readonly department: string;

  readonly designation: string;

  readonly category: string;

  readonly referenceCode: string | null;

  readonly projectOrTaskName: string | null;

  readonly companyOrCostCenter: string | null;

  readonly description: string | null;

  readonly hours: number;
}
