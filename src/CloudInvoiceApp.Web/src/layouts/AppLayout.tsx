import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ApiService } from "@/services/ApiService";

export function AppLayout() {
  const [invoiceCount, setInvoiceCount] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    ApiService.getInvoiceList()
      .then((data) => setInvoiceCount(data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar invoiceCount={invoiceCount} />
      <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
