"use client";

import { useRouter } from "next/navigation";

import { MONTH_OPTIONS } from "./months";

interface PeriodFilterProps {
  readonly pathname: string;
  readonly year: number;
  readonly month: number | null;
}

export function PeriodFilter({ pathname, year, month }: PeriodFilterProps) {
  const router = useRouter();

  function handleMonthChange(value: string): void {
    const params = new URLSearchParams();

    params.set("year", String(year));

    if (value !== "all") {
      params.set("month", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={month === null ? "all" : String(month)}
      onChange={(event) => handleMonthChange(event.target.value)}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
    >
      <option value="all">All months</option>

      {MONTH_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
