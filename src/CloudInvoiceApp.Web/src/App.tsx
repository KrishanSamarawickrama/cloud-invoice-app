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
import { DatePicker } from "@/components/ui/DatePicker";
import { ApiService, InvoiceListItem, InvoiceDetail, CreateInvoiceRequest, UpdateInvoiceRequest } from "@/services/ApiService";

function InvoiceModal({ open, onClose, onSave, initialData }) {
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate || new Date().toISOString());
  const [fromAddresses, setFromAddresses] = useState(initialData?.from || [""]);
  const [toAddresses, setToAddresses] = useState(initialData?.to || [""]);
  const [services, setServices] = useState(initialData?.services || [{ serviceName: "", amount: 0 }]);
  const [accountHolder, setAccountHolder] = useState(initialData?.bankDetails?.accountHolder || "");
  const [bankName, setBankName] = useState(initialData?.bankDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(initialData?.bankDetails?.accountNumber || "");
  const [swiftCode, setSwiftCode] = useState(initialData?.bankDetails?.swiftCode || "");

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = { 
      ...updatedServices[index], 
      [field]: field === 'amount' ? parseFloat(value) || 0 : value 
    };
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([...services, { serviceName: "", amount: 0 }]);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleFromChange = (index, value) => {
    const updated = [...fromAddresses];
    updated[index] = value;
    setFromAddresses(updated);
  };

  const handleToChange = (index, value) => {
    const updated = [...toAddresses];
    updated[index] = value;
    setToAddresses(updated);
  };

  const addFromAddress = () => {
    setFromAddresses([...fromAddresses, ""]);
  };

  const addToAddress = () => {
    setToAddresses([...toAddresses, ""]);
  };

  const removeFromAddress = (index) => {
    setFromAddresses(fromAddresses.filter((_, i) => i !== index));
  };

  const removeToAddress = (index) => {
    setToAddresses(toAddresses.filter((_, i) => i !== index));
  };

  const totalAmount = services.reduce((sum, service) => sum + (service.amount || 0), 0);

  const handleSave = async () => {
    // Clean up any empty values and prepare the data according to API schema
    const cleanedFromAddresses = fromAddresses.filter(addr => addr.trim() !== "");
    const cleanedToAddresses = toAddresses.filter(addr => addr.trim() !== "");
    const cleanedServices = services.filter(s => s.serviceName.trim() !== "" && s.amount > 0);
    
    // Format date to ISO date string (YYYY-MM-DD)
    const formattedDate = new Date(invoiceDate).toISOString().split('T')[0];
    
    const invoiceData = {
      invoiceNumber,
      invoiceDate: formattedDate,
      from: cleanedFromAddresses,
      to: cleanedToAddresses,
      bankDetails: {
        accountHolder,
        bankName,
        accountNumber,
        swiftCode
      },
      services: cleanedServices
    };

    try {
      if (initialData?.id) {
        // Update existing invoice
        const updateRequest: UpdateInvoiceRequest = { 
          id: initialData.id,
          ...invoiceData
        };
        await ApiService.updateInvoice(updateRequest);
      } else {
        // Create new invoice
        const createRequest: CreateInvoiceRequest = invoiceData;
        await ApiService.createInvoice(createRequest);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-4xl"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-[--color-primary]">{initialData ? "Edit Invoice" : "Add Invoice"}</DialogTitle>
          <DialogDescription className="text-[--color-secondary]">Provide invoice details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="mb-1 font-medium">Invoice Number</span>
              <input 
                className="border border-gray-300 rounded-md px-2 py-1" 
                type="text" 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)} 
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-medium">Invoice Date</span>
              <DatePicker
                value={invoiceDate}
                onChange={setInvoiceDate}
              />
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">From</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addFromAddress}
              >
                Add Address
              </Button>
            </div>
            {fromAddresses.map((addr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                  placeholder="Address"
                  value={addr}
                  onChange={(e) => handleFromChange(index, e.target.value)}
                />
                {fromAddresses.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromAddress(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">To</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addToAddress}
              >
                Add Address
              </Button>
            </div>
            {toAddresses.map((addr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                  placeholder="Address"
                  value={addr}
                  onChange={(e) => handleToChange(index, e.target.value)}
                />
                {toAddresses.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeToAddress(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Services</h3>
              <Button variant="outline" size="sm" onClick={addService}>Add Service</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Service Name</th>
                    <th className="text-right px-4 py-2 font-medium w-32">Amount</th>
                    <th className="px-4 py-2 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">
                        <input
                          className="w-full border border-gray-300 rounded-md px-2 py-1"
                          placeholder="Service name"
                          value={service.serviceName}
                          onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-right"
                          type="number"
                          placeholder="0.00"
                          value={service.amount}
                          onChange={(e) => handleServiceChange(index, 'amount', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeService(index)}
                          className="w-full"
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-2 font-medium text-right">Total:</td>
                    <td className="px-4 py-2 font-medium text-right">${totalAmount.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="border-t mt-4 pt-4">
            <h3 className="font-medium mb-2">Bank Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="mb-1 font-medium">Account Holder</span>
                <input 
                  className="border border-gray-300 rounded-md px-2 py-1" 
                  type="text" 
                  value={accountHolder} 
                  onChange={(e) => setAccountHolder(e.target.value)} 
                />
              </label>
              <label className="flex flex-col">
                <span className="mb-1 font-medium">Bank Name</span>
                <input 
                  className="border border-gray-300 rounded-md px-2 py-1" 
                  type="text" 
                  value={bankName} 
                  onChange={(e) => setBankName(e.target.value)} 
                />
              </label>
              <label className="flex flex-col">
                <span className="mb-1 font-medium">Account Number</span>
                <input 
                  className="border border-gray-300 rounded-md px-2 py-1" 
                  type="text" 
                  value={accountNumber} 
                  onChange={(e) => setAccountNumber(e.target.value)} 
                />
              </label>
              <label className="flex flex-col">
                <span className="mb-1 font-medium">SWIFT Code</span>
                <input 
                  className="border border-gray-300 rounded-md px-2 py-1" 
                  type="text" 
                  value={swiftCode} 
                  onChange={(e) => setSwiftCode(e.target.value)} 
                />
              </label>
            </div>
          </div>
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
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const data = await ApiService.getInvoiceList();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddInvoice = () => {
    setInvoiceToEdit(null);
    setShowModal(true);
  };

  const handleEditInvoice = async (invoice: InvoiceListItem) => {
    setIsLoading(true);
    try {
      const invoiceDetail = await ApiService.getInvoiceById(invoice.id);
      setInvoiceToEdit(invoiceDetail);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      // Fallback to list data if fetch fails
      setInvoiceToEdit(invoice as InvoiceDetail);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    try {
      await ApiService.deleteInvoice(id);
      fetchInvoices(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[--color-background] p-4 min-w-[90vw]">
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
                <div className="space-y-2">
                  <p className="text-gray-700">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  <p className="text-gray-700">Amount: ${invoice.amount.toFixed(2)}</p>
                  {invoice.fileName && (
                    <p className="text-gray-700 truncate">File: {invoice.fileName}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditInvoice(invoice)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Edit'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {showModal && (
        <InvoiceModal 
          open={showModal} 
          onClose={() => {
            setShowModal(false);
            setInvoiceToEdit(null);
          }} 
          onSave={() => {
            setShowModal(false);
            setInvoiceToEdit(null);
            // Refresh the list after save
            fetchInvoices();
          }} 
          initialData={invoiceToEdit} 
        />
      )}
    </div>
  );
}
