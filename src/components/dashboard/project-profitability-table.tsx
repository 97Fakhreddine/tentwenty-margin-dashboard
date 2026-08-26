import Link from "next/link";

import type { DashboardProjectRow } from "@/application/dashboard/dashboard.view-model";

import {
    formatCurrencyAed,
    formatHours,
    formatPercentage,
} from "@/components/shared/formatters";

interface ProjectProfitabilityTableProps {
    readonly projects:
    readonly DashboardProjectRow[];
}

export function ProjectProfitabilityTable({
    projects,
}: ProjectProfitabilityTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-4">
                <h2 className="font-semibold text-zinc-950">
                    Project profitability
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Ranked by margin
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                            <th className="px-6 py-3">
                                Project
                            </th>

                            <th className="px-4 py-3 text-right">
                                Hours
                            </th>

                            <th className="px-4 py-3 text-right">
                                Revenue
                            </th>

                            <th className="px-4 py-3 text-right">
                                Cost
                            </th>

                            <th className="px-4 py-3 text-right">
                                Profit
                            </th>

                            <th className="px-6 py-3 text-right">
                                Margin
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100">
                        {projects.map(
                            (project) => (
                                <tr
                                    key={
                                        project.referenceCode
                                    }
                                    className="hover:bg-zinc-50"
                                >
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/projects/${project.referenceCode}`}
                                            className="font-medium text-zinc-950 hover:underline"
                                        >
                                            {project.name}
                                        </Link>

                                        <div className="mt-1 text-xs text-zinc-500">
                                            {
                                                project.referenceCode
                                            }
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {formatHours(
                                            project.hours,
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {formatCurrencyAed(
                                            project.revenueAed,
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {project.costAed ===
                                            null
                                            ? "—"
                                            : formatCurrencyAed(
                                                project.costAed,
                                            )}
                                    </td>

                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {project.profitAed ===
                                            null
                                            ? "—"
                                            : formatCurrencyAed(
                                                project.profitAed,
                                            )}
                                    </td>

                                    <td className="px-6 py-4 text-right font-medium tabular-nums">
                                        {formatPercentage(
                                            project.margin,
                                        )}
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}