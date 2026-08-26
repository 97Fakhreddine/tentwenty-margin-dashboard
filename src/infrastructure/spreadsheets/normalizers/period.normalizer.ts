import type { MonthNumber, YearMonth } from "@/domain/shared/period";

const MONTH_NUMBER_BY_NAME: Record<string, MonthNumber> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export function parseMonthName(value: string): MonthNumber | null {
  return MONTH_NUMBER_BY_NAME[value.trim().toLowerCase()] ?? null;
}

export function parseYearMonth(
  value: string,
  fallbackYear?: number,
): YearMonth | null {
  const normalizedValue = value
    .trim()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(
    /^([A-Za-z]+)(?:\s+(?:'(\d{2})|(\d{4})))?$/,
  );

  if (!match) {
    return null;
  }

  const monthName = match[1];

  if (!monthName) {
    return null;
  }

  const month = parseMonthName(monthName);

  if (month === null) {
    return null;
  }

  const shortYear = match[2];
  const fullYear = match[3];

  let year: number | undefined;

  if (fullYear) {
    year = Number(fullYear);
  } else if (shortYear) {
    year = 2000 + Number(shortYear);
  } else {
    year = fallbackYear;
  }

  if (!year) {
    return null;
  }

  return {
    year,
    month,
  };
}
