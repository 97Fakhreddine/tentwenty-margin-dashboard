import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDetailService } from "@/application/projects/project-detail.service";

import { MetricCard } from "@/components/dashboard/metric-card";

import { DepartmentContributionTable } from "@/components/projects/department-contribution-table";
import { EmployeeContributionTable } from "@/components/projects/employee-contribution-table";

import {
  formatCurrencyAed,
  formatHours,
  formatPercentage,
} from "@/components/shared/formatters";

export const dynamic = "force-dynamic";

const DATA_YEAR = 2025;

interface ProjectDetailPageProps {
  readonly params: Promise<{
    referenceCode: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { referenceCode } = await params;

  const projectDetailService = new ProjectDetailService();

  const project = await projectDetailService.getProjectDetail(
    referenceCode,
    DATA_YEAR,
  );

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>{project.referenceCode}</span>

            <span>·</span>

            <span>{project.category}</span>

            {project.status ? (
              <>
                <span>·</span>
                <span>{project.status}</span>
              </>
            ) : null}
          </div>

          <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight text-zinc-950">
            {project.name}
          </h1>
        </header>

        {!project.isComplete ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Financial data for this project is incomplete. Some profitability
            figures cannot be calculated reliably.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="Project price"
            value={formatCurrencyAed(project.priceAed)}
          />

          <MetricCard label="Hours" value={formatHours(project.totalHours)} />

          <MetricCard
            label="Cost"
            value={
              project.totalCostAed === null
                ? "—"
                : formatCurrencyAed(project.totalCostAed)
            }
          />

          <MetricCard
            label="Profit"
            value={
              project.profitAed === null
                ? "—"
                : formatCurrencyAed(project.profitAed)
            }
          />

          <MetricCard label="Margin" value={formatPercentage(project.margin)} />
        </section>

        <section className="mt-8">
          <DepartmentContributionTable departments={project.departments} />
        </section>

        <section className="mt-8">
          <EmployeeContributionTable employees={project.employees} />
        </section>
      </div>
    </main>
  );
}
