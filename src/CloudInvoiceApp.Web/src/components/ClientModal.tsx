import { useState } from "react";
import { Plus, Trash2, User, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ApiService,
  type ClientDetail,
  type CreateClientRequest,
  type UpdateClientRequest,
} from "@/services/ApiService";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData: ClientDetail | null;
}

export function ClientModal({
  open,
  onClose,
  onSave,
  initialData,
}: ClientModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [addressLines, setAddressLines] = useState<string[]>(
    initialData?.address?.length ? initialData.address : [""]
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddressChange = (index: number, value: string) => {
    const updated = [...addressLines];
    updated[index] = value;
    setAddressLines(updated);
  };

  const handleSave = async () => {
    const cleanedAddress = addressLines.filter((a) => a.trim() !== "");

    const clientData = {
      name,
      email: email || null,
      address: cleanedAddress,
    };

    setIsSaving(true);
    try {
      if (initialData?.id) {
        const req: UpdateClientRequest = { id: initialData.id, ...clientData };
        await ApiService.updateClient(req);
      } else {
        const req: CreateClientRequest = clientData;
        await ApiService.createClient(req);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Client" : "New Client"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the client details below."
              : "Fill in the details to add a new client."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name & Email */}
          <section>
            <SectionHeading icon={<User className="h-4 w-4" />} title="Details" />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <div className="flex items-center justify-between">
              <SectionHeading icon={<Building2 className="h-4 w-4" />} title="Address" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddressLines([...addressLines, ""])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="space-y-2 mt-3">
              {addressLines.map((line, i) => (
                <div key={i} className="relative">
                  <Input
                    className="w-full"
                    placeholder="Address line"
                    value={line}
                    onChange={(e) => handleAddressChange(i, e.target.value)}
                  />
                  {addressLines.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-destructive)]"
                      onClick={() =>
                        setAddressLines(addressLines.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : initialData
                ? "Update Client"
                : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
      <span className="text-[var(--color-text-secondary)]">{icon}</span>
      {title}
    </div>
  );
}
