import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5101/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth interceptor state — set by AuthProvider
let getAccessToken: (() => string | null) | null = null;
let refreshTokenFn: (() => Promise<string | null>) | null = null;
let onAuthFailure: (() => void) | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export function configureApiAuth(
  tokenGetter: () => string | null,
  refreshFn: () => Promise<string | null>,
  authFailureFn: () => void
) {
  getAccessToken = tokenGetter;
  refreshTokenFn = refreshFn;
  onAuthFailure = authFailureFn;
}

// Request interceptor: attach Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshTokenFn &&
      // Don't retry auth endpoints to avoid infinite loops
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenFn();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'), null);
          onAuthFailure?.();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        onAuthFailure?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- Types (unchanged) ---

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

export interface ProfileResponse {
  email: string;
  name: string;
  pictureUrl?: string | null;
  defaultFromAddress?: string[] | null;
  defaultBankDetails?: BankDetails | null;
}

export interface UpdateProfileRequest {
  defaultFromAddress?: string[] | null;
  defaultBankDetails?: BankDetails | null;
}

export const ApiService = {
  getInvoiceList: async (): Promise<InvoiceListItem[]> => {
    const response = await api.get(`/invoices/list`);
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<InvoiceDetail> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoice: CreateInvoiceRequest): Promise<void> => {
    await api.post(`/invoices`, invoice);
  },

  updateInvoice: async (invoice: UpdateInvoiceRequest): Promise<void> => {
    await api.put(`/invoices`, invoice);
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get(`/profile`);
    return response.data;
  },

  updateProfile: async (profile: UpdateProfileRequest): Promise<void> => {
    await api.put(`/profile`, profile);
  },

  downloadInvoicePdf: async (id: number): Promise<void> => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition'];
    let filename = `invoice-${id}.pdf`;
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
      if (match) filename = decodeURIComponent(match[1].replace(/"/g, ''));
    }

    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
