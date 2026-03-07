import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { ApiService } from "@/services/ApiService";

export function AppLayout() {
  const [invoiceCount, setInvoiceCount] = useState<number | undefined>(
    undefined
  );
  const location = useLocation();

  useEffect(() => {
    ApiService.getInvoiceList()
      .then((data) => setInvoiceCount(data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar invoiceCount={invoiceCount} />
      <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
