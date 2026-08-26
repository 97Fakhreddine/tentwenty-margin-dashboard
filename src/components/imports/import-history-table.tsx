import type { ImportHistoryRow } from "@/application/imports/import-history.service";

interface ImportHistoryTableProps {
  readonly imports: readonly ImportHistoryRow[];
}

export function ImportHistoryTable({ imports }: ImportHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h2 className="font-semibold text-zinc-950">Import history</h2>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Type</th>

            <th className="px-4 py-3 text-left">File</th>

            <th className="px-4 py-3 text-right">Records</th>

            <th className="px-4 py-3 text-right">Warnings</th>

            <th className="px-6 py-3 text-right">Imported</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {imports.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 font-medium">{item.kind}</td>

              <td className="px-4 py-4">{item.sourceFileName}</td>

              <td className="px-4 py-4 text-right tabular-nums">
                {item.recordCount}
              </td>

              <td className="px-4 py-4 text-right tabular-nums">
                {item.warningCount}
              </td>

              <td className="px-6 py-4 text-right text-zinc-500">
                {item.importedAt.toLocaleString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
