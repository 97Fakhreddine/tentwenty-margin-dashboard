import type { ProjectDepartmentContributionRow } from "@/application/projects/project-detail.view-model";

import { formatCurrencyAed, formatHours } from "@/components/shared/formatters";

interface DepartmentContributionTableProps {
  readonly departments: readonly ProjectDepartmentContributionRow[];
}

export function DepartmentContributionTable({
  departments,
}: DepartmentContributionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h2 className="font-semibold text-zinc-950">Department breakdown</h2>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Department</th>

            <th className="px-4 py-3 text-right">Hours</th>

            <th className="px-6 py-3 text-right">Cost</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {departments.map((department) => (
            <tr key={department.department}>
              <td className="px-6 py-4 font-medium">{department.department}</td>

              <td className="px-4 py-4 text-right tabular-nums">
                {formatHours(department.hours)}
              </td>

              <td className="px-6 py-4 text-right tabular-nums">
                {department.costAed === null
                  ? "—"
                  : formatCurrencyAed(department.costAed)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
