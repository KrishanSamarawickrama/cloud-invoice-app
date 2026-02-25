import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceTableSkeleton } from "@/components/InvoiceTableSkeleton";
import { InvoiceModal } from "@/components/InvoiceModal";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ApiService,
  type InvoiceListItem,
  type InvoiceDetail,
} from "@/services/ApiService";

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceDetail | null>(null);

  // Delete confirmation state
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceListItem | null>(null);

  const fetchInvoices = async () => {
    try {
      const data = await ApiService.getInvoiceList();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.fileName && inv.fileName.toLowerCase().includes(q))
    );
  }, [invoices, searchQuery]);

  const handleNewInvoice = () => {
    setInvoiceToEdit(null);
    setShowModal(true);
  };

  const handleEditInvoice = async (invoice: InvoiceListItem) => {
    try {
      const detail = await ApiService.getInvoiceById(invoice.id);
      setInvoiceToEdit(detail);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Failed to load invoice details.");
    }
  };

  const handleSaveSuccess = () => {
    fetchInvoices();
    toast.success(invoiceToEdit ? "Invoice updated." : "Invoice created.");
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    try {
      await ApiService.deleteInvoice(invoiceToDelete.id);
      fetchInvoices();
      toast.success("Invoice deleted.");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice.");
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      await ApiService.downloadInvoicePdf(id);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Invoices
            </h1>
            <Badge>{invoices.length}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage and track your invoices
          </p>
        </div>
        <Button onClick={handleNewInvoice}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] pl-9 pr-8 text-sm placeholder:text-[var(--color-text-muted)] placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <InvoiceTableSkeleton />
      ) : invoices.length === 0 ? (
        <EmptyState onCreateInvoice={handleNewInvoice} />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState onCreateInvoice={handleNewInvoice} hasSearch />
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onEdit={handleEditInvoice}
          onDelete={setInvoiceToDelete}
          onDownload={handleDownloadPdf}
        />
      )}

      {showModal && (
        <InvoiceModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setInvoiceToEdit(null);
          }}
          onSave={handleSaveSuccess}
          initialData={invoiceToEdit}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      <ConfirmDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => { if (!open) setInvoiceToDelete(null); }}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber ?? ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
