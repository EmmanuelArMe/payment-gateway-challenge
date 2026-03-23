const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
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
      body: JSON.stringify(data),
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
        body: JSON.stringify(data),
      },
    ),

  getTransaction: (id: string) =>
    request<{ data: import('../types').Transaction }>(`/api/transactions/${encodeURIComponent(id)}`),

  getAcceptanceToken: () =>
    request<{ data: { presigned_acceptance: { acceptance_token: string } } }>(
      '/api/payments/acceptance-token',
    ),

  tokenizeCard: (data: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  }) =>
    request<{ data: { id: string } }>('/api/payments/tokenize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
