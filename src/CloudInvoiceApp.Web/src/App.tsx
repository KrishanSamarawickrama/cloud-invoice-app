import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/Dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import axios from 'axios';

const API_BASE_URL = "http://localhost:5101/api/invoices";

function InvoiceModal({ open, onClose, onSave, initialData }) {
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate || "");
  const [from, setFrom] = useState(initialData?.from || "");
  const [to, setTo] = useState(initialData?.to || "");
  const [amount, setAmount] = useState(initialData?.amount || "");

  const handleSave = async () => {
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      from: [from],
      to: [to],
      services: [{ serviceName: "Service", amount: parseFloat(amount) }]
    };
    if (initialData?.id) {
      await axios.put(`${API_BASE_URL}`, { id: initialData.id, ...invoiceData });
    } else {
      await axios.post(API_BASE_URL, invoiceData);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-lg"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-[--color-primary]">{initialData ? "Edit Invoice" : "Add Invoice"}</DialogTitle>
          <DialogDescription className="text-[--color-secondary]">Provide invoice details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Invoice Number</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Invoice Date</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">From</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="text" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">To</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="text" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Amount</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{initialData ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  useEffect(() => {
    axios.get(API_BASE_URL).then(response => {
      setInvoices(response.data);
    });
  }, []);

  const handleAddInvoice = () => {
    setInvoiceToEdit(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceToEdit(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
  };

  return (
    <div className="min-h-screen bg-[--color-background] p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[--color-primary]">Invoice Manager</h1>
        <Button onClick={handleAddInvoice}>Add Invoice</Button>
      </div>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {invoices.map((invoice) => (
          <motion.div key={invoice.id} layout>
            <Card className="rounded-2xl shadow hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-xl mb-2">Invoice #{invoice.invoiceNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">From: {invoice.from}</p>
                <p className="text-gray-700">To: {invoice.to}</p>
                <p className="text-gray-700">Amount: ${invoice.services[0]?.amount}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => handleEditInvoice(invoice)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {showModal && (
        <InvoiceModal open={showModal} onClose={() => setShowModal(false)} onSave={() => setShowModal(false)} initialData={invoiceToEdit} />
      )}
    </div>
  );
}
