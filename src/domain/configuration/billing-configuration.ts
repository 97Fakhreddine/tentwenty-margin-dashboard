export const DEFAULT_BILLABLE_CATEGORIES = [
  "Projects",
  "Enhancements",
  "Hosting",
] as const;

export interface BillingConfiguration {
  readonly billableCategories: readonly string[];

  readonly monthlyOverheadAed: number;
}
