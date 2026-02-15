import { FileText, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  invoiceCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewInvoice: () => void;
}

export function Header({
  invoiceCount,
  searchQuery,
  onSearchChange,
  onNewInvoice,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[var(--color-accent)]" />
          <h1 className="text-lg font-semibold text-[var(--color-text)]">
            Invoices
          </h1>
          <Badge>{invoiceCount}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-56 rounded-md border border-[var(--color-border)] bg-white pl-8 pr-8 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button onClick={onNewInvoice}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>
    </header>
  );
}
