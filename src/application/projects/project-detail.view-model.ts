export interface ProjectEmployeeContributionRow {
  readonly employeeNumber: string;
  readonly employeeName: string;

  readonly hours: number;

  readonly costAed: number | null;
  readonly revenueShareAed: number;

  readonly profitAed: number | null;
  readonly profitability: number | null;
}

export interface ProjectDepartmentContributionRow {
  readonly department: string;
  readonly hours: number;
  readonly costAed: number | null;
}

export interface ProjectDetailViewModel {
  readonly referenceCode: string;
  readonly name: string;

  readonly category: string;
  readonly status: string | null;

  readonly priceAed: number;

  readonly totalHours: number;
  readonly totalCostAed: number | null;

  readonly profitAed: number | null;
  readonly margin: number | null;

  readonly employees: readonly ProjectEmployeeContributionRow[];

  readonly departments: readonly ProjectDepartmentContributionRow[];

  readonly issues: readonly string[];

  readonly isComplete: boolean;
}
