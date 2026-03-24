import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TransactionResult from './TransactionResult';
import { TransactionStatus } from '../types';

const mockNavigate = jest.fn();
const mockGetTransaction = jest.fn();
let mockTransaction: Record<string, unknown> | null = {
  id: 'tx-1',
  productId: 'prod-1',
  customerId: 'cust-1',
  quantity: 1,
  amount: 50000,
  baseFee: 5000,
  deliveryFee: 10000,
  total: 65000,
  status: 'APPROVED',
  wompiReference: 'wompi-1',
  paymentMethod: 'CARD',
  createdAt: '2026-03-23T00:00:00.000Z',
  updatedAt: '2026-03-23T00:00:00.000Z',
};

jest.mock('../hooks/useStore', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      checkout: {
        transaction: mockTransaction,
      },
    }),
}));

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ transactionId: 'tx-1' }),
}));

jest.mock('../services/api', () => ({
  api: {
    getTransaction: (...args: unknown[]) => mockGetTransaction(...args),
  },
}));

describe('TransactionResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      quantity: 1,
      amount: 50000,
      baseFee: 5000,
      deliveryFee: 10000,
      total: 65000,
      status: 'APPROVED',
      wompiReference: 'wompi-1',
      paymentMethod: 'CARD',
      createdAt: '2026-03-23T00:00:00.000Z',
      updatedAt: '2026-03-23T00:00:00.000Z',
    };
  });

  it('renders approved transaction details from store state', () => {
    render(<TransactionResult />);

    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    expect(screen.getByText('Detalles de la transacción')).toBeInTheDocument();
    expect(screen.getByText('wompi-1')).toBeInTheDocument();
    expect(screen.getByText('Volver a productos')).toBeInTheDocument();
  });

  it('fetches transaction when store state is missing', async () => {
    mockTransaction = null;

    mockGetTransaction.mockResolvedValue({
      data: {
        id: 'tx-2',
        productId: 'prod-1',
        customerId: 'cust-1',
        quantity: 1,
        amount: 50000,
        baseFee: 5000,
        deliveryFee: 10000,
        total: 65000,
        status: TransactionStatus.APPROVED,
        wompiReference: null,
        paymentMethod: 'CARD',
        createdAt: '2026-03-23T00:00:00.000Z',
        updatedAt: '2026-03-23T00:00:00.000Z',
      },
    });

    render(<TransactionResult />);

    await waitFor(() => {
      expect(mockGetTransaction).toHaveBeenCalledWith('tx-1');
    });
  });

  it('renders declined transaction', () => {
    mockTransaction = { ...mockTransaction!, status: TransactionStatus.DECLINED };
    render(<TransactionResult />);
    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
  });

  it('renders pending status and shows polling indicator', () => {
    mockTransaction = { ...mockTransaction!, status: TransactionStatus.PENDING };
    render(<TransactionResult />);
    expect(screen.getByText('Pago pendiente')).toBeInTheDocument();
    expect(screen.getByText('Verificando estado del pago...')).toBeInTheDocument();
  });

  it('renders error status', () => {
    mockTransaction = { ...mockTransaction!, status: TransactionStatus.ERROR };
    render(<TransactionResult />);
    expect(screen.getByText('Error en el pago')).toBeInTheDocument();
  });

  it('renders voided status', () => {
    mockTransaction = { ...mockTransaction!, status: TransactionStatus.VOIDED };
    render(<TransactionResult />);
    expect(screen.getByText('Transacción anulada')).toBeInTheDocument();
  });

  it('polls for status updates when pending', async () => {
    jest.useFakeTimers();
    mockTransaction = { ...mockTransaction!, status: TransactionStatus.PENDING };

    mockGetTransaction.mockResolvedValue({
      data: { ...mockTransaction, status: TransactionStatus.APPROVED },
    });

    render(<TransactionResult />);

    // Advance timers to trigger the polling interval
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockGetTransaction).toHaveBeenCalledWith('tx-1');
    });

    jest.useRealTimers();
  });

  it('navigates home when clicking "Volver a productos"', () => {
    render(<TransactionResult />);

    fireEvent.click(screen.getByText('Volver a productos'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('falls back to error config for unknown status', () => {
    mockTransaction = { ...mockTransaction!, status: 'UNKNOWN_STATUS' };
    render(<TransactionResult />);
    // Should fall back to ERROR config
    expect(screen.getByText('Error en el pago')).toBeInTheDocument();
  });
});