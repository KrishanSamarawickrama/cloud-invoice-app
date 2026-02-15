import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  onCreateInvoice: () => void;
  hasSearch?: boolean;
}

export function EmptyState({ onCreateInvoice, hasSearch }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16">
        <FileText className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
        <h3 className="text-base font-medium text-[var(--color-text)]">
          No matching invoices
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Try adjusting your search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-light)] mb-4">
        <FileText className="h-6 w-6 text-[var(--color-accent)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--color-text)]">
        No invoices yet
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Get started by creating your first invoice.
      </p>
      <Button className="mt-4" onClick={onCreateInvoice}>
        <Plus className="mr-1.5 h-4 w-4" />
        Create Invoice
      </Button>
    </div>
  );
}
