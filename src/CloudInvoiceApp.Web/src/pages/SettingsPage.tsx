import { useEffect, useState } from "react";
import { Save, Hash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiService } from "@/services/ApiService";

export function SettingsPage() {
  const [invoiceNumberPrefix, setInvoiceNumberPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getSettings()
      .then((s) => setInvoiceNumberPrefix(s.invoiceNumberPrefix ?? ""))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const validate = (value: string): string | null => {
    if (!value) return "Invoice number prefix is required.";
    if (value.length > 10) return "Must be 1–10 characters.";
    if (!/^[A-Za-z0-9]+$/.test(value)) return "Letters and digits only.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate(invoiceNumberPrefix);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await ApiService.updateSettings({ invoiceNumberPrefix });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
        <div className="h-48 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Configure invoicing preferences
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <Hash className="h-4 w-4 text-[var(--color-text-secondary)]" />
          Invoice Number Prefix
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Used to auto-generate invoice numbers, e.g. <code>{invoiceNumberPrefix || "INV"}-000001</code>. 1–10 letters or digits.
        </p>
        <div className="mt-3">
          <Input
            value={invoiceNumberPrefix}
            onChange={(e) => {
              setInvoiceNumberPrefix(e.target.value);
              if (error) setError(null);
            }}
            placeholder="INV"
            maxLength={10}
          />
          {error && (
            <p className="mt-1 text-xs text-[var(--color-destructive)]">{error}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-1.5 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
