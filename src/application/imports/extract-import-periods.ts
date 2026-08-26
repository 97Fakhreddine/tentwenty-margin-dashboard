import type { YearMonth } from "@/domain/shared/period";

export function extractUniquePeriods(
  records: readonly { readonly period: YearMonth }[],
): readonly YearMonth[] {
  const periodsByKey = new Map<string, YearMonth>();

  for (const record of records) {
    const key = `${record.period.year}-` + `${record.period.month}`;

    periodsByKey.set(key, record.period);
  }

  return [...periodsByKey.values()].sort(
    (left, right) => left.year - right.year || left.month - right.month,
  );
}
