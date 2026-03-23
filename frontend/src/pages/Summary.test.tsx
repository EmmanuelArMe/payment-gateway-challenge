import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Summary from './Summary';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../hooks/useStore', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      products: {
        selectedProduct: {
          id: 'prod-1',
          name: 'Headphones',
          description: 'Noise-cancelling headphones',
          price: 250000,
          currency: 'COP',
          stock: 10,
          imageUrl: 'https://example.com/img.jpg',
          createdAt: '2026-01-01T00:00:00Z',
        },
      },
      checkout: {
        quantity: 2,
        customer: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '3001234567',
        },
        delivery: {
          address: 'Calle 100',
          city: 'Bogota',
          department: 'Cundinamarca',
          postalCode: '110111',
        },
        cardInfo: {
          number: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cardHolder: 'JOHN DOE',
        },
        loading: false,
        error: null,
      },
    }),
}));

jest.mock('react-router', () => ({
  useParams: () => ({ productId: 'prod-1' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../config', () => ({
  WOMPI_PUBLIC_KEY: 'pub_test_key_123',
}));

jest.mock('../store/slices/checkoutSlice', () => ({
  createTransaction: Object.assign(
    (data: unknown) => ({ type: 'checkout/createTransaction', payload: data }),
    {
      rejected: { match: () => false },
      fulfilled: { match: () => true },
    },
  ),
  processPayment: (data: unknown) => ({
    type: 'checkout/processPayment',
    payload: data,
  }),
}));

describe('Summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all summary sections', () => {
    render(<Summary />);

    expect(screen.getByText('Resumen de compra')).toBeInTheDocument();
    // "Producto" appears in both section heading and progress steps
    expect(screen.getAllByText('Producto').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();
  });

  it('renders product details in summary', () => {
    render(<Summary />);

    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 2')).toBeInTheDocument();
  });

  it('renders customer info', () => {
    render(<Summary />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('3001234567')).toBeInTheDocument();
  });

  it('renders delivery info', () => {
    render(<Summary />);

    expect(screen.getByText('Calle 100')).toBeInTheDocument();
    expect(screen.getByText('Bogota')).toBeInTheDocument();
    expect(screen.getByText('Cundinamarca')).toBeInTheDocument();
    expect(screen.getByText('110111')).toBeInTheDocument();
  });

  it('renders card holder and expiry', () => {
    render(<Summary />);

    // card holder appears in card info section
    const holders = screen.getAllByText('JOHN DOE');
    expect(holders.length).toBeGreaterThan(0);
    // expiry is rendered as "{expMonth}/{expYear}"
    expect(screen.getByText('12/30')).toBeInTheDocument();
  });

  it('shows CVC error when paying without CVC', () => {
    render(<Summary />);

    fireEvent.click(screen.getByText(/^Pagar/));

    expect(screen.getByText('Ingrese el CVC de su tarjeta')).toBeInTheDocument();
  });

  it('navigates back on back button', () => {
    render(<Summary />);

    fireEvent.click(screen.getByText('← Volver al formulario'));
    expect(mockNavigate).toHaveBeenCalledWith('/checkout/prod-1');
  });

  it('renders progress steps', () => {
    render(<Summary />);

    // "Producto" and "Resumen" appear in both section headings and progress steps
    expect(screen.getAllByText('Producto').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Datos')).toBeInTheDocument();
    expect(screen.getAllByText('Resumen').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Resultado')).toBeInTheDocument();
  });

  it('submits payment when CVC is provided', async () => {
    mockDispatch.mockResolvedValue({ payload: { id: 'tx-1' } });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              presigned_acceptance: { acceptance_token: 'accept-token' },
            },
          }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ data: { id: 'card-token-1' } }),
      });

    render(<Summary />);

    // Enter CVC
    fireEvent.change(screen.getByPlaceholderText('CVC'), {
      target: { value: '123' },
    });

    // Click pay
    fireEvent.click(screen.getByText(/^Pagar/));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
