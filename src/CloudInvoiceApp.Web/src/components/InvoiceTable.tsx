import { Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { InvoiceListItem } from "@/services/ApiService";

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  onEdit: (invoice: InvoiceListItem) => void;
  onDelete: (invoice: InvoiceListItem) => void;
  onDownload: (id: number) => void;
}

export function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
  onDownload,
}: InvoiceTableProps) {
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
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors"
            >
              <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                {invoice.invoiceNumber}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {formatDate(invoice.invoiceDate)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-[var(--color-text)]">
                {formatCurrency(invoice.amount)}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                {invoice.fileName || "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(invoice)}
                    title="Edit invoice"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(invoice.id)}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(invoice)}
                    title="Delete invoice"
                    className="text-[var(--color-destructive)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
