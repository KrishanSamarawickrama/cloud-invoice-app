import { useState, useEffect } from "react";
import { ApiService, type ClientListItem } from "@/services/ApiService";

interface ClientSelectorProps {
  onSelect: (address: string[]) => void;
}

export function ClientSelector({ onSelect }: ClientSelectorProps) {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ApiService.getClients()
      .then(setClients)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || clients.length === 0) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) return;
    try {
      const detail = await ApiService.getClientById(id);
      onSelect(detail.address);
    } catch {
      console.error("Failed to load client details");
    }
  };

  return (
    <select
      defaultValue=""
      onChange={handleChange}
      className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
    >
      <option value="" disabled>
        Load from client...
      </option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
