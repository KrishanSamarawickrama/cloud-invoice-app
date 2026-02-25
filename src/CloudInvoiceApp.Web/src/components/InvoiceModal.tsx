import { useState, useEffect } from "react";
import { Plus, Trash2, Download, Building2, User, Briefcase, Landmark } from "lucide-react";
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
import { DatePicker } from "@/components/ui/DatePicker";
import { formatCurrency } from "@/lib/formatters";
import {
  ApiService,
  type InvoiceDetail,
  type CreateInvoiceRequest,
  type UpdateInvoiceRequest,
} from "@/services/ApiService";
import { ClientSelector } from "@/components/ClientSelector";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData: InvoiceDetail | null;
  onDownloadPdf: (id: number) => void;
}

export function InvoiceModal({
  open,
  onClose,
  onSave,
  initialData,
  onDownloadPdf,
}: InvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate || new Date().toISOString());
  const [fromAddresses, setFromAddresses] = useState<string[]>(initialData?.from || [""]);
  const [toAddresses, setToAddresses] = useState<string[]>(initialData?.to || [""]);
  const [services, setServices] = useState<{ serviceName: string; amount: number }[]>(
    initialData?.services || [{ serviceName: "", amount: 0 }]
  );
  const [accountHolder, setAccountHolder] = useState(initialData?.bankDetails?.accountHolder || "");
  const [bankName, setBankName] = useState(initialData?.bankDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(initialData?.bankDetails?.accountNumber || "");
  const [swiftCode, setSwiftCode] = useState(initialData?.bankDetails?.swiftCode || "");
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate from profile defaults when creating a new invoice
  useEffect(() => {
    if (!open || initialData) return;
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
      .catch(() => {});
  }, [open, initialData]);

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = {
      ...updated[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value,
    };
    setServices(updated);
  };

  const handleFromChange = (index: number, value: string) => {
    const updated = [...fromAddresses];
    updated[index] = value;
    setFromAddresses(updated);
  };

  const handleToChange = (index: number, value: string) => {
    const updated = [...toAddresses];
    updated[index] = value;
    setToAddresses(updated);
  };

  const totalAmount = services.reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleSave = async () => {
    const cleanedFrom = fromAddresses.filter((a) => a.trim() !== "");
    const cleanedTo = toAddresses.filter((a) => a.trim() !== "");
    const cleanedServices = services.filter((s) => s.serviceName.trim() !== "" && s.amount > 0);
    const formattedDate = new Date(invoiceDate).toISOString().split("T")[0];

    const invoiceData = {
      invoiceNumber,
      invoiceDate: formattedDate,
      from: cleanedFrom,
      to: cleanedTo,
      bankDetails: { accountHolder, bankName, accountNumber, swiftCode },
      services: cleanedServices,
    };

    setIsSaving(true);
    try {
      if (initialData?.id) {
        const req: UpdateInvoiceRequest = { id: initialData.id, ...invoiceData };
        await ApiService.updateInvoice(req);
      } else {
        const req: CreateInvoiceRequest = invoiceData;
        await ApiService.createInvoice(req);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      throw error; // Let InvoiceManager handle toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Invoice" : "New Invoice"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Update the invoice details below." : "Fill in the details to create a new invoice."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <section>
            <SectionHeading icon={<Briefcase className="h-4 w-4" />} title="Invoice Details" />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
              />
              <DatePicker
                label="Invoice Date"
                value={invoiceDate}
                onChange={setInvoiceDate}
              />
            </div>
          </section>

          {/* From & To side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* From */}
            <section>
              <div className="flex items-center justify-between">
                <SectionHeading icon={<User className="h-4 w-4" />} title="From" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFromAddresses([...fromAddresses, ""])}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-3">
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
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-destructive)] "
                        onClick={() => setFromAddresses(fromAddresses.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* To */}
            <section>
              <div className="flex items-center justify-between">
                <SectionHeading icon={<Building2 className="h-4 w-4" />} title="To" />
                <div className="flex items-center gap-2">
                  <ClientSelector onSelect={(address) => setToAddresses(address.length ? address : [""])} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setToAddresses([...toAddresses, ""])}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                {toAddresses.map((addr, i) => (
                  <div key={i} className="relative">
                    <Input
                      className="w-full"
                      placeholder="Recipient name or address"
                      value={addr}
                      onChange={(e) => handleToChange(i, e.target.value)}
                    />
                    {toAddresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-destructive)] "
                        onClick={() => setToAddresses(toAddresses.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Services */}
          <section>
            <div className="flex items-center justify-between">
              <SectionHeading icon={<Briefcase className="h-4 w-4" />} title="Services" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setServices([...services, { serviceName: "", amount: 0 }])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="mt-3 overflow-hidden rounded-md border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                      Service Name
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)] w-32">
                      Amount
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-3 py-2">
                        <input
                          className="w-full h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
                          placeholder="Service name"
                          value={service.serviceName}
                          onChange={(e) => handleServiceChange(i, "serviceName", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="w-full h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
                          type="number"
                          placeholder="0.00"
                          value={service.amount || ""}
                          onChange={(e) => handleServiceChange(i, "amount", e.target.value)}
                        />
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--color-destructive)] "
                          onClick={() => setServices(services.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--color-background)]">
                    <td className="px-3 py-2 text-right font-medium text-[var(--color-text)]">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-[var(--color-text)]">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Bank Details */}
          <section>
            <SectionHeading icon={<Landmark className="h-4 w-4" />} title="Bank Details" />
            <div className="grid grid-cols-2 gap-4 mt-3">
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
          </section>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {initialData?.id && (
            <Button variant="secondary" onClick={() => onDownloadPdf(initialData.id)}>
              <Download className="mr-1.5 h-4 w-4" />
              Download PDF
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : initialData ? "Update Invoice" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
      <span className="text-[var(--color-text-secondary)]">{icon}</span>
      {title}
    </div>
  );
}
