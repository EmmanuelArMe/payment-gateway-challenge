import axios from 'axios';
import { API_BASE_URL } from '../config';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function request<T>(url: string, options?: { method?: string; data?: unknown }): Promise<T> {
  const response = await httpClient.request<T>({
    url,
    method: options?.method || 'GET',
    data: options?.data,
  });
  return response.data;
}

export const api = {
  getProducts: () => request<{ data: import('../types').Product[] }>('/api/products'),

  getProduct: (id: string) => request<{ data: import('../types').Product }>(`/api/products/${encodeURIComponent(id)}`),

  createTransaction: (data: {
    productId: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryDepartment: string;
    deliveryPostalCode: string;
  }) =>
    request<{ data: import('../types').Transaction }>('/api/transactions', {
      method: 'POST',
      data,
    }),

  processPayment: (
    transactionId: string,
    data: {
      cardToken: string;
      acceptanceToken: string;
      customerEmail: string;
    },
  ) =>
    request<{ data: import('../types').Transaction }>(
      `/api/transactions/${encodeURIComponent(transactionId)}/pay`,
      {
        method: 'POST',
        data,
      },
    ),

  getTransaction: (id: string) =>
    request<{ data: import('../types').Transaction }>(`/api/transactions/${encodeURIComponent(id)}`),

  getAcceptanceToken: () =>
    request<{ data: string }>('/api/payments/acceptance-token'),

  tokenizeCard: (data: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  }) =>
    request<{ data: string }>('/api/payments/tokenize', {
      method: 'POST',
      data,
    }),
};
