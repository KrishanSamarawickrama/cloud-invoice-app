import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, X, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClientTable } from "@/components/ClientTable";
import { ClientTableSkeleton } from "@/components/ClientTableSkeleton";
import { ClientModal } from "@/components/ClientModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ApiService,
  type ClientListItem,
  type ClientDetail,
} from "@/services/ApiService";

export function ClientManager() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientDetail | null>(null);

  // Delete confirmation state
  const [clientToDelete, setClientToDelete] = useState<ClientListItem | null>(null);

  const fetchClients = async () => {
    try {
      const data = await ApiService.getClients();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  const handleNewClient = () => {
    setClientToEdit(null);
    setShowModal(true);
  };

  const handleEditClient = async (client: ClientListItem) => {
    try {
      const detail = await ApiService.getClientById(client.id);
      setClientToEdit(detail);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast.error("Failed to load client details.");
    }
  };

  const handleSaveSuccess = () => {
    fetchClients();
    toast.success(clientToEdit ? "Client updated." : "Client created.");
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await ApiService.deleteClient(clientToDelete.id);
      fetchClients();
      toast.success("Client deleted.");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client.");
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Clients
            </h1>
            <Badge>{clients.length}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage your client directory
          </p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-[var(--color-border)] bg-white pl-9 pr-8 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
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
        <ClientTableSkeleton />
      ) : clients.length === 0 ? (
        <ClientEmptyState onCreateClient={handleNewClient} />
      ) : filteredClients.length === 0 ? (
        <ClientEmptyState onCreateClient={handleNewClient} hasSearch />
      ) : (
        <ClientTable
          clients={filteredClients}
          onEdit={handleEditClient}
          onDelete={setClientToDelete}
        />
      )}

      {showModal && (
        <ClientModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setClientToEdit(null);
          }}
          onSave={handleSaveSuccess}
          initialData={clientToEdit}
        />
      )}

      <ConfirmDialog
        open={!!clientToDelete}
        onOpenChange={(open) => { if (!open) setClientToDelete(null); }}
        title="Delete Client"
        description={`Are you sure you want to delete ${clientToDelete?.name ?? "this client"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

function ClientEmptyState({
  onCreateClient,
  hasSearch,
}: {
  onCreateClient: () => void;
  hasSearch?: boolean;
}) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16">
        <Users className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
        <h3 className="text-base font-medium text-[var(--color-text)]">
          No matching clients
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
        <Users className="h-6 w-6 text-[var(--color-accent)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--color-text)]">
        No clients yet
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Get started by adding your first client.
      </p>
      <Button className="mt-4" onClick={onCreateClient}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
}
