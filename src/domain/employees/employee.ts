import type { EmployeeNumber } from "@/domain/shared/identifiers";

export interface Employee {
  readonly employeeNumber: EmployeeNumber;
  readonly name: string;
}
