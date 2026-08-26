export interface EmployeeProductivityRow {
  readonly employeeNumber: string;
  readonly employeeName: string;

  readonly totalHours: number;
  readonly billableHours: number;
  readonly nonBillableHours: number;

  readonly productivity: number | null;
}

export interface ProductivityViewModel {
  readonly year: number;
  readonly month: number | null;

  readonly employees: readonly EmployeeProductivityRow[];
}
