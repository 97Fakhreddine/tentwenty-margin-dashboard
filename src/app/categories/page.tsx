import Link from "next/link";

import { CategoryReportService } from "@/application/categories/category-report.service";

import { CategoryHoursTable } from "@/components/categories/category-hours-table";
import { PeriodFilter } from "@/components/shared/period-filter";

import { formatHours } from "@/components/shared/formatters";

export const dynamic = "force-dynamic";

const DEFAULT_YEAR = 2025;

interface CategoryPageProps {
  readonly searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function CategoryPage({
  searchParams,
}: CategoryPageProps) {
  const params = await searchParams;

  const year = Number(params.year) || DEFAULT_YEAR;

  const parsedMonth = params.month ? Number(params.month) : null;

  const month =
    parsedMonth !== null && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : null;

  const service = new CategoryReportService();

  const report = await service.getCategoryReport(year, month);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">Time allocation</p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
              Categories
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Where the team spends its time.
            </p>
          </div>

          <PeriodFilter pathname="/categories" year={year} month={month} />
        </header>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total logged hours</p>

          <p className="mt-1 text-2xl font-semibold text-zinc-950">
            {formatHours(report.totalHours)}
          </p>
        </div>

        {report.categories.length === 0 ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="font-medium text-zinc-950">No category data</h2>

            <p className="mt-2 text-sm text-zinc-500">
              No logged hours are available for the selected period.
            </p>
          </div>
        ) : (
          <section className="mt-8">
            <CategoryHoursTable categories={report.categories} />
          </section>
        )}
      </div>
    </main>
  );
}
