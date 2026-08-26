import type { EmployeeProductivityRow } from "@/application/productivity/productivity.view-model";

import { formatHours, formatPercentage } from "@/components/shared/formatters";

interface ProductivityTableProps {
  readonly employees: readonly EmployeeProductivityRow[];
}

export function ProductivityTable({ employees }: ProductivityTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Employee</th>

            <th className="px-4 py-3 text-right">Total hours</th>

            <th className="px-4 py-3 text-right">Billable</th>

            <th className="px-4 py-3 text-right">Non-billable</th>

            <th className="px-6 py-3 text-right">Productivity</th>
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
                {formatHours(employee.totalHours)}
              </td>

              <td className="px-4 py-4 text-right tabular-nums">
                {formatHours(employee.billableHours)}
              </td>

              <td className="px-4 py-4 text-right tabular-nums">
                {formatHours(employee.nonBillableHours)}
              </td>

              <td className="px-6 py-4 text-right font-medium tabular-nums">
                {formatPercentage(employee.productivity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
