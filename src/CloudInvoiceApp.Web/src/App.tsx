import { Toaster } from "sonner";
import { InvoiceManager } from "@/components/InvoiceManager";

export default function App() {
  return (
    <>
      <InvoiceManager />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
