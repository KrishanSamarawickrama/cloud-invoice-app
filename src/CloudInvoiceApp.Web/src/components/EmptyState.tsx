import { FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  onCreateInvoice: () => void;
  hasSearch?: boolean;
}

export function EmptyState({ onCreateInvoice, hasSearch }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 shadow-sm"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-light)] mb-4">
          <FileText className="h-8 w-8 text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-base font-medium text-[var(--color-text)]">
          No matching invoices
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Try adjusting your search term.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 shadow-sm"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)] shadow-lg mb-4">
        <FileText className="h-8 w-8 text-white" />
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
    </motion.div>
  );
}
