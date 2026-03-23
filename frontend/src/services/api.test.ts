jest.mock('../config', () => ({
  API_BASE_URL: 'http://localhost:3000',
}));

import { api } from './api';

describe('api', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('gets products', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [{ id: 'prod-1' }] }),
    });

    const result = await api.getProducts();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(result.data).toEqual([{ id: 'prod-1' }]);
  });

  it('posts transaction payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { id: 'tx-1' } }),
    });

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

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transactions',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('throws when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: 'Bad request' }),
    });

    await expect(api.getProducts()).rejects.toThrow('Bad request');
  });

  it('gets a single product', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { id: 'prod-1' } }),
    });

    const result = await api.getProduct('prod-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products/prod-1',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
    expect(result.data).toEqual({ id: 'prod-1' });
  });

  it('processes payment', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { id: 'tx-1', status: 'APPROVED' } }),
    });

    const result = await api.processPayment('tx-1', {
      cardToken: 'card-token',
      acceptanceToken: 'accept-token',
      customerEmail: 'john@example.com',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transactions/tx-1/pay',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.data.status).toBe('APPROVED');
  });

  it('gets a transaction', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { id: 'tx-1' } }),
    });

    const result = await api.getTransaction('tx-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transactions/tx-1',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
    expect(result.data).toEqual({ id: 'tx-1' });
  });

  it('falls back to HTTP status on error without message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('parse error')),
    });

    await expect(api.getProducts()).rejects.toThrow('Request failed');
  });
});