import type { ProjectEmployeeContributionRow } from "@/application/projects/project-detail.view-model";

import {
  formatCurrencyAed,
  formatHours,
  formatPercentage,
} from "@/components/shared/formatters";

interface EmployeeContributionTableProps {
  readonly employees: readonly ProjectEmployeeContributionRow[];
}

export function EmployeeContributionTable({
  employees,
}: EmployeeContributionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h2 className="font-semibold text-zinc-950">Employee contributions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
            <tr>
              <th className="px-6 py-3">Employee</th>

              <th className="px-4 py-3 text-right">Hours</th>

              <th className="px-4 py-3 text-right">Cost</th>

              <th className="px-4 py-3 text-right">Revenue share</th>

              <th className="px-4 py-3 text-right">Profit</th>

              <th className="px-6 py-3 text-right">Profitability</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {employees.map((employee) => (
              <tr key={employee.employeeNumber}>
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-950">
                    {employee.employeeName}
                  </div>

                  <div className="text-xs text-zinc-500">
                    {employee.employeeNumber}
                  </div>
                </td>

                <td className="px-4 py-4 text-right tabular-nums">
                  {formatHours(employee.hours)}
                </td>

                <td className="px-4 py-4 text-right tabular-nums">
                  {employee.costAed === null
                    ? "—"
                    : formatCurrencyAed(employee.costAed)}
                </td>

                <td className="px-4 py-4 text-right tabular-nums">
                  {formatCurrencyAed(employee.revenueShareAed)}
                </td>

                <td className="px-4 py-4 text-right tabular-nums">
                  {employee.profitAed === null
                    ? "—"
                    : formatCurrencyAed(employee.profitAed)}
                </td>

                <td className="px-6 py-4 text-right font-medium tabular-nums">
                  {formatPercentage(employee.profitability)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
