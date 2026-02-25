import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ClientListItem } from "@/services/ApiService";

interface ClientTableProps {
  clients: ClientListItem[];
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
}

export function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              Email
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors"
            >
              <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                {client.name}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {client.email || "\u2014"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(client)}
                    title="Edit client"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(client)}
                    title="Delete client"
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
