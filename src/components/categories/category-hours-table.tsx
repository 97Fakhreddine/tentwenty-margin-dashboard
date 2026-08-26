import type { CategoryHoursRow } from "@/application/categories/category-report.view-model";

import { formatHours, formatPercentage } from "@/components/shared/formatters";

interface CategoryHoursTableProps {
  readonly categories: readonly CategoryHoursRow[];
}

export function CategoryHoursTable({ categories }: CategoryHoursTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Category</th>

            <th className="px-4 py-3 text-left">Type</th>

            <th className="px-4 py-3 text-right">Hours</th>

            <th className="px-6 py-3 text-right">Share of total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {categories.map((category) => (
            <tr key={category.category}>
              <td className="px-6 py-4 font-medium text-zinc-950">
                {category.category}
              </td>

              <td className="px-4 py-4 text-zinc-600">
                {category.isBillable ? "Billable" : "Non-billable"}
              </td>

              <td className="px-4 py-4 text-right tabular-nums">
                {formatHours(category.hours)}
              </td>

              <td className="px-6 py-4 text-right tabular-nums">
                {formatPercentage(category.percentageOfTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
