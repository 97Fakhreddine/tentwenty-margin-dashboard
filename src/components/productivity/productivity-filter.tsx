"use client";

import { useRouter } from "next/navigation";

import { MONTH_OPTIONS } from "@/components/shared/months";

interface ProductivityFilterProps {
  readonly year: number;
  readonly month: number | null;
}

export function ProductivityFilter({ year, month }: ProductivityFilterProps) {
  const router = useRouter();

  function handleMonthChange(value: string): void {
    const searchParams = new URLSearchParams();

    searchParams.set("year", String(year));

    if (value !== "all") {
      searchParams.set("month", value);
    }

    router.push(`/productivity?${searchParams.toString()}`);
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
