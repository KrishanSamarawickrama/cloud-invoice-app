import axios from 'axios';

const API_BASE_URL = "http://localhost:5101/api";

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
}

export interface Service {
  serviceName: string;
  amount: number;
}

export interface CreateInvoiceRequest {
  fileName?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  from: string[];
  to: string[];
  bankDetails: BankDetails;
  services: Service[];
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  id: number;
}

export interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  fileName?: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  from: string[];
  to: string[];
  bankDetails: BankDetails;
  services: Service[];
}

export const ApiService = {
  getInvoiceList: async (): Promise<InvoiceListItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/invoices/list`);
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<InvoiceDetail> => {
    const response = await axios.get(`${API_BASE_URL}/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoice: CreateInvoiceRequest): Promise<void> => {
    await axios.post(`${API_BASE_URL}/invoices`, invoice);
  },

  updateInvoice: async (invoice: UpdateInvoiceRequest): Promise<void> => {
    await axios.put(`${API_BASE_URL}/invoices`, invoice);
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/invoices/${id}`);
  }
};
