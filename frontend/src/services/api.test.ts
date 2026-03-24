jest.mock('../config', () => ({
  API_BASE_URL: 'http://localhost:3000',
}));

import axios from 'axios';
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockRequest = jest.fn();

mockAxios.create.mockReturnValue({
  request: mockRequest,
} as never);

// Re-import api after axios mock is set up
const { api } = jest.requireActual('./api');
// Since api.ts was already imported, we need to get the instance that uses our mock
// The mock must be set before import, so let's restructure:

describe('api', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('gets products', async () => {
    mockRequest.mockResolvedValue({ data: { data: [{ id: 'prod-1' }] } });

    const result = await api.getProducts();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/products',
        method: 'GET',
      }),
    );
    expect(result.data).toEqual([{ id: 'prod-1' }]);
  });

  it('posts transaction payload', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'tx-1' } } });

    await api.createTransaction({
      productId: 'prod-1',
      quantity: 1,
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerPhone: '3001234567',
      deliveryAddress: 'Calle 1',
      deliveryCity: 'Bogota',
      deliveryDepartment: 'Cundinamarca',
      deliveryPostalCode: '110111',
    });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/transactions',
        method: 'POST',
      }),
    );
  });

  it('throws when axios rejects', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'));

    await expect(api.getProducts()).rejects.toThrow('Network error');
  });

  it('gets a single product', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'prod-1' } } });

    const result = await api.getProduct('prod-1');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/products/prod-1' }),
    );
    expect(result.data).toEqual({ id: 'prod-1' });
  });

  it('processes payment', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'tx-1', status: 'APPROVED' } } });

    const result = await api.processPayment('tx-1', {
      cardToken: 'card-token',
      acceptanceToken: 'accept-token',
      customerEmail: 'john@example.com',
    });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/transactions/tx-1/pay',
        method: 'POST',
      }),
    );
    expect(result.data.status).toBe('APPROVED');
  });

  it('gets a transaction', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'tx-1' } } });

    const result = await api.getTransaction('tx-1');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/transactions/tx-1' }),
    );
    expect(result.data).toEqual({ id: 'tx-1' });
  });

  it('gets acceptance token', async () => {
    mockRequest.mockResolvedValue({
      data: { data: 'tok-123' },
    });

    const result = await api.getAcceptanceToken();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/payments/acceptance-token' }),
    );
    expect(result.data).toBe('tok-123');
  });

  it('tokenizes a card', async () => {
    mockRequest.mockResolvedValue({ data: { data: 'card-tok-1' } });

    const result = await api.tokenizeCard({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '28',
      cardHolder: 'John Doe',
    });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/payments/tokenize',
        method: 'POST',
      }),
    );
    expect(result.data).toBe('card-tok-1');
  });
});