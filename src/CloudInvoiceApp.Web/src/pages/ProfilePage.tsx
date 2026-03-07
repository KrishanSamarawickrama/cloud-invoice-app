import { useState, useEffect } from "react";
import { Plus, Trash2, User, Landmark, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ApiService } from "@/services/ApiService";

export function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fromAddresses, setFromAddresses] = useState<string[]>([""]);
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    ApiService.getProfile()
      .then((profile) => {
        if (profile.defaultFromAddress?.length) {
          setFromAddresses(profile.defaultFromAddress);
        }
        if (profile.defaultBankDetails) {
          setAccountHolder(profile.defaultBankDetails.accountHolder || "");
          setBankName(profile.defaultBankDetails.bankName || "");
          setAccountNumber(profile.defaultBankDetails.accountNumber || "");
          setSwiftCode(profile.defaultBankDetails.swiftCode || "");
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleFromChange = (index: number, value: string) => {
    const updated = [...fromAddresses];
    updated[index] = value;
    setFromAddresses(updated);
  };

  const handleSave = async () => {
    const cleanedFrom = fromAddresses.filter((a) => a.trim() !== "");
    setIsSaving(true);
    try {
      await ApiService.updateProfile({
        defaultFromAddress: cleanedFrom.length > 0 ? cleanedFrom : null,
        defaultBankDetails:
          accountHolder || bankName || accountNumber || swiftCode
            ? { accountHolder, bankName, accountNumber, swiftCode }
            : null,
      });
      toast.success("Profile defaults saved");
    } catch {
      toast.error("Failed to save profile defaults");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
        <div className="h-32 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
        <div className="h-48 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
        <div className="h-48 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your default invoice details
        </p>
      </div>

      {/* User info card */}
      <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg font-medium text-white">
                {initials}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]">
                {user?.name}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="min-w-40">
            <Select
              label="Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
            >
              <option value="system">System (Default)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Default From Address */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
              Default From Address
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFromAddresses([...fromAddresses, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Pre-filled when creating new invoices
          </p>
          <div className="mt-3 space-y-2">
            {fromAddresses.map((addr, i) => (
              <div key={i} className="relative">
                <Input
                  className="w-full"
                  placeholder="Name or address line"
                  value={addr}
                  onChange={(e) => handleFromChange(i, e.target.value)}
                />
                {fromAddresses.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-destructive)]"
                    onClick={() =>
                      setFromAddresses(fromAddresses.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Default Bank Details */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
            <Landmark className="h-4 w-4 text-[var(--color-text-secondary)]" />
            Default Bank Details
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Pre-filled when creating new invoices
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Input
              label="Account Holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
            <Input
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <Input
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <Input
              label="SWIFT Code"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-1.5 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Defaults"}
        </Button>
      </div>
    </div>
  );
}
