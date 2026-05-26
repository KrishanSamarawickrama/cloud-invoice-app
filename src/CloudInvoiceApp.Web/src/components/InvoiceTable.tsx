import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { InvoiceListItem } from "@/services/ApiService";

type SortKey = "invoiceNumber" | "invoiceDate" | "createdDate" | "amount" | "fileName";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  onEdit: (invoice: InvoiceListItem) => void;
  onDelete: (invoice: InvoiceListItem) => void;
  onDownload: (id: number) => void;
}

const DEFAULT_DIR_BY_KEY: Record<SortKey, SortDir> = {
  invoiceNumber: "asc",
  invoiceDate: "desc",
  createdDate: "desc",
  amount: "desc",
  fileName: "asc",
};

function compare(a: InvoiceListItem, b: InvoiceListItem, key: SortKey): number {
  switch (key) {
    case "invoiceNumber":
      return a.invoiceNumber.localeCompare(b.invoiceNumber);
    case "fileName":
      return (a.fileName ?? "").localeCompare(b.fileName ?? "");
    case "invoiceDate":
      return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
    case "createdDate":
      return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    case "amount":
      return a.amount - b.amount;
  }
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  active: SortState;
  align?: "left" | "right";
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, sortKey, active, align = "left", onSort }: SortHeaderProps) {
  const isActive = active.key === sortKey;
  const Icon = isActive
    ? (active.dir === "asc" ? ChevronUp : ChevronDown)
    : ChevronsUpDown;
  const ariaSort = isActive ? (active.dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th
      aria-sort={ariaSort}
      className={`px-4 py-3 font-medium text-[var(--color-text-secondary)] ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center gap-1 rounded ${align === "right" ? "flex-row-reverse" : ""} hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2`}
      >
        <span>{label}</span>
        <Icon
          className={`h-3.5 w-3.5 transition-opacity ${
            isActive
              ? "text-[var(--color-accent)] opacity-100"
              : "opacity-30 group-hover:opacity-60"
          }`}
        />
      </button>
    </th>
  );
}

export function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
  onDownload,
}: InvoiceTableProps) {
  const [sort, setSort] = useState<SortState>({ key: "invoiceDate", dir: "desc" });

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: DEFAULT_DIR_BY_KEY[key] }
    );
  };

  const sortedInvoices = useMemo(() => {
    const copy = [...invoices];
    copy.sort((a, b) => {
      const cmp = compare(a, b, sort.key);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [invoices, sort]);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <SortHeader label="Invoice #" sortKey="invoiceNumber" active={sort} onSort={handleSort} />
            <SortHeader label="Date" sortKey="invoiceDate" active={sort} onSort={handleSort} />
            <SortHeader label="Created" sortKey="createdDate" active={sort} onSort={handleSort} />
            <SortHeader label="Amount" sortKey="amount" active={sort} align="right" onSort={handleSort} />
            <SortHeader label="File" sortKey="fileName" active={sort} onSort={handleSort} />
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedInvoices.map((invoice, index) => (
            <motion.tr
              key={invoice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="border-b border-[var(--color-border)] last:border-b-0 transition-colors hover:bg-[var(--color-accent-light)]/50"
            >
              <td className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => onEdit(invoice)}
                  aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                  className="cursor-pointer rounded text-[var(--color-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  {invoice.invoiceNumber}
                </button>
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {formatDate(invoice.invoiceDate)}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {formatDate(invoice.createdDate)}
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
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
