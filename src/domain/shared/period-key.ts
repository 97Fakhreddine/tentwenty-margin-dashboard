import type { YearMonth } from "./period";

export function toPeriodKey(period: YearMonth): string {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}
