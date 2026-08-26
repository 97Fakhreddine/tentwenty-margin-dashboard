import type { EmployeeNumber } from "@/domain/shared/identifiers";
import type { YearMonth } from "@/domain/shared/period";

export interface MonthlySalary {
  readonly employeeNumber: EmployeeNumber;
  readonly period: YearMonth;
  readonly amountAed: number;
}
