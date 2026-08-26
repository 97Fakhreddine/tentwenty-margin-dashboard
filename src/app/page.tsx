import Link from "next/link";

import { DashboardService } from "@/application/dashboard/dashboard.service";

import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProjectProfitabilityTable } from "@/components/dashboard/project-profitability-table";

import {
  formatCurrencyAed,
  formatHours,
  formatPercentage,
} from "@/components/shared/formatters";

import { MONTH_OPTIONS } from "@/components/shared/months";

import type { MonthNumber } from "@/domain/shared/period";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  readonly searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  const parsedYear = Number(params.year);

  const year =
    Number.isInteger(parsedYear) && parsedYear > 2000 ? parsedYear : 2025;

  const parsedMonth = params.month ? Number(params.month) : null;

  const month: MonthNumber | null =
    parsedMonth !== null && parsedMonth >= 1 && parsedMonth <= 12
      ? (parsedMonth as MonthNumber)
      : null;

  const dashboardService = new DashboardService();

  const dashboard = await dashboardService.getDashboard(year, month);

  const selectedMonthLabel =
    dashboard.filters.month === null
      ? null
      : MONTH_OPTIONS.find((option) => option.value === dashboard.filters.month)
          ?.label;

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Financial operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
              Margin Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Project profitability overview for{" "}
              {dashboard.filters.month === null
                ? dashboard.filters.year
                : `${selectedMonthLabel} ${dashboard.filters.year}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/productivity"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Productivity
            </Link>

            <Link
              href="/categories"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Categories
            </Link>

            <Link
              href="/imports"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Imports
            </Link>

            <DashboardPeriodFilter
              year={dashboard.filters.year}
              month={dashboard.filters.month}
              availableYears={dashboard.availableYears}
            />
          </div>
        </header>

        {/* Financial KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={
              dashboard.revenue.value === null
                ? "—"
                : formatCurrencyAed(dashboard.revenue.value)
            }
          />

          <MetricCard
            label="Cost"
            value={
              dashboard.cost.value === null
                ? "—"
                : formatCurrencyAed(dashboard.cost.value)
            }
          />

          <MetricCard
            label="Profit"
            value={
              dashboard.profit.value === null
                ? "—"
                : formatCurrencyAed(dashboard.profit.value)
            }
          />

          <MetricCard
            label="Margin"
            value={formatPercentage(dashboard.margin)}
          />
        </section>

        {/* Hours */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Total hours"
            value={formatHours(dashboard.totalHours)}
          />

          <MetricCard
            label="Billable hours"
            value={formatHours(dashboard.billableHours)}
          />
        </section>

        {/* Revenue assumption */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-5 py-4">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Revenue recognition
          </p>

          <p className="mt-1 text-sm text-zinc-700">
            {dashboard.revenueRecognitionLabel} This is an explicit assumption
            and is isolated from the financial calculation engine.
          </p>
        </div>

        {/* Data quality warning */}
        {dashboard.incompleteProjectCount > 0 ||
        dashboard.unpricedReferenceCodeCount > 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Some financial figures are incomplete. Review missing salaries or
            project prices before relying on margin totals.
          </div>
        ) : null}

        {/* Projects */}
        {dashboard.projects.length === 0 ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="font-medium text-zinc-950">No project activity</h2>

            <p className="mt-2 text-sm text-zinc-500">
              No project delivery or recognized revenue exists for the selected
              period.
            </p>
          </div>
        ) : (
          <section className="mt-8">
            <ProjectProfitabilityTable projects={dashboard.projects} />
          </section>
        )}
      </div>
    </main>
  );
}
