"use client";

import { useRouter } from "next/navigation";

import { MONTH_OPTIONS } from "@/components/shared/months";

interface DashboardPeriodFilterProps {
  readonly year: number;
  readonly month: number | null;

  readonly availableYears: readonly number[];
}

export function DashboardPeriodFilter({
  year,
  month,
  availableYears,
}: DashboardPeriodFilterProps) {
  const router = useRouter();

  function navigate(nextYear: number, nextMonth: number | null): void {
    const params = new URLSearchParams();

    params.set("year", String(nextYear));

    if (nextMonth !== null) {
      params.set("month", String(nextMonth));
    }

    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={year}
        onChange={(event) => navigate(Number(event.target.value), month)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
      >
        {availableYears.map((availableYear) => (
          <option key={availableYear} value={availableYear}>
            {availableYear}
          </option>
        ))}
      </select>

      <select
        value={month === null ? "all" : String(month)}
        onChange={(event) =>
          navigate(
            year,

            event.target.value === "all" ? null : Number(event.target.value),
          )
        }
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
      >
        <option value="all">Full year</option>

        {MONTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
