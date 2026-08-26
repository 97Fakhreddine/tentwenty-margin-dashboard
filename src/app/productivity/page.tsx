import Link from "next/link";

import { ProductivityService } from "@/application/productivity/productivity.service";

import { ProductivityFilter } from "@/components/productivity/productivity-filter";
import { ProductivityTable } from "@/components/productivity/productivity-table";

export const dynamic = "force-dynamic";

const DEFAULT_YEAR = 2025;

interface ProductivityPageProps {
  readonly searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function ProductivityPage({
  searchParams,
}: ProductivityPageProps) {
  const params = await searchParams;

  const year = Number(params.year) || DEFAULT_YEAR;

  const parsedMonth = params.month ? Number(params.month) : null;

  const month =
    parsedMonth !== null && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : null;

  const productivityService = new ProductivityService();

  const productivity = await productivityService.getProductivity(year, month);

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
            <p className="text-sm font-medium text-zinc-500">
              Team utilisation
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
              Productivity
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Billable hours divided by total logged hours.
            </p>
          </div>

          <ProductivityFilter year={year} month={month} />
        </header>

        <section className="mt-8">
          <ProductivityTable employees={productivity.employees} />
        </section>
      </div>
    </main>
  );
}
