export interface DashboardMetric {
  readonly value: number;
  readonly isComplete: boolean;
}

export interface DashboardProjectRow {
  readonly referenceCode: string;
  readonly name: string;

  readonly revenueAed: number;

  readonly costAed: number | null;
  readonly profitAed: number | null;

  readonly margin: number | null;

  readonly hours: number;

  readonly isComplete: boolean;
}

export interface DashboardViewModel {
  readonly year: number;

  readonly totalHours: number;
  readonly billableHours: number;

  readonly revenue: DashboardMetric;
  readonly cost: DashboardMetric;
  readonly profit: DashboardMetric;

  readonly margin: number | null;

  readonly projects: readonly DashboardProjectRow[];

  readonly incompleteProjectCount: number;

  readonly unpricedReferenceCodeCount: number;
}
