import { DashboardService } from "@/application/dashboard/dashboard.service";

import { MetricCard } from "@/components/dashboard/metric-card";

import { ProjectProfitabilityTable } from "@/components/dashboard/project-profitability-table";

import {
  formatCurrencyAed,
  formatHours,
  formatPercentage,
} from "@/components/shared/formatters";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DASHBOARD_YEAR = 2025;

export default async function DashboardPage() {
  const dashboardService = new DashboardService();

  const dashboard = await dashboardService.getDashboard(DASHBOARD_YEAR);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Financial operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
              Margin Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Project profitability overview for {dashboard.year}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/productivity"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Productivity
            </Link>

            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
              {dashboard.year}
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={formatCurrencyAed(dashboard.revenue.value)}
          />

          <MetricCard
            label="Cost"
            value={formatCurrencyAed(dashboard.cost.value)}
          />

          <MetricCard
            label="Profit"
            value={formatCurrencyAed(dashboard.profit.value)}
          />

          <MetricCard
            label="Margin"
            value={formatPercentage(dashboard.margin)}
          />
        </section>

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

        {dashboard.incompleteProjectCount > 0 ||
        dashboard.unpricedReferenceCodeCount > 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Some financial figures are incomplete. Review missing salaries or
            project prices before relying on margin totals.
          </div>
        ) : null}

        <section className="mt-8">
          <ProjectProfitabilityTable projects={dashboard.projects} />
        </section>
      </div>
    </main>
  );
}
