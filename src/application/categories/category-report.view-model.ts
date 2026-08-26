export interface CategoryHoursRow {
  readonly category: string;
  readonly hours: number;
  readonly percentageOfTotal: number;
  readonly isBillable: boolean;
}

export interface CategoryReportViewModel {
  readonly year: number;
  readonly month: number | null;

  readonly totalHours: number;

  readonly categories: readonly CategoryHoursRow[];
}
