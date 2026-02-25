import { Skeleton } from "@/components/ui/Skeleton";

export function InvoiceTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              Invoice #
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              Date
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Amount
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              File
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-[var(--color-border)] last:border-b-0"
            >
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="ml-auto h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
