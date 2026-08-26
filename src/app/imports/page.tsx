import Link from "next/link";

import { ImportHistoryService } from "@/application/imports/import-history.service";

import { ImportCard } from "@/components/imports/import-card";
import { ImportHistoryTable } from "@/components/imports/import-history-table";

import {
  uploadProjectPrices,
  uploadSalaries,
  uploadTimesheet,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const historyService = new ImportHistoryService();

  const imports = await historyService.getRecentImports();

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
          <p className="text-sm font-medium text-zinc-500">Data management</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
            Imports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Upload corrected timesheets, salary data, or project pricing. Only
            periods contained in an uploaded timesheet or salary workbook are
            replaced.
          </p>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <ImportCard
            title="Timesheet"
            description="Upload logged hours. Existing data is replaced only for the months present in the workbook."
            action={uploadTimesheet}
          />

          <ImportCard
            title="Salaries"
            description="Upload monthly salary data used to derive direct hourly cost rates."
            action={uploadSalaries}
          />

          <ImportCard
            title="Project prices"
            description="Upload project prices and sales metadata. Projects are matched by Ref Code."
            action={uploadProjectPrices}
          />
        </section>

        <section className="mt-8">
          <ImportHistoryTable imports={imports} />
        </section>
      </div>
    </main>
  );
}
