import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutForm from './CheckoutForm';

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
      checkout: { quantity: 2 },
    }),
}));

jest.mock('react-router', () => ({
  useParams: () => ({ productId: 'prod-1' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../store/slices/checkoutSlice', () => ({
  setCustomer: (c: unknown) => ({ type: 'checkout/setCustomer', payload: c }),
  setDelivery: (d: unknown) => ({ type: 'checkout/setDelivery', payload: d }),
  setCardInfo: (ci: unknown) => ({ type: 'checkout/setCardInfo', payload: ci }),
}));

describe('CheckoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all three form sections', () => {
    render(<CheckoutForm />);

    expect(screen.getByText('Información personal')).toBeInTheDocument();
    expect(screen.getByText('Información de entrega')).toBeInTheDocument();
    // "Tarjeta de crédito" appears both as heading and card preview label
    expect(screen.getAllByText('Tarjeta de crédito').length).toBeGreaterThanOrEqual(1);
  });

  it('renders progress steps', () => {
    render(<CheckoutForm />);

    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Datos')).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Resultado')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', () => {
    render(<CheckoutForm />);

    fireEvent.click(screen.getByText('Revisar resumen'));

    expect(screen.getByText('Nombre requerido')).toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('Teléfono inválido')).toBeInTheDocument();
    expect(screen.getByText('Dirección requerida')).toBeInTheDocument();
    expect(screen.getByText('Ciudad requerida')).toBeInTheDocument();
    expect(screen.getByText('Departamento requerido')).toBeInTheDocument();
    expect(screen.getByText('Código postal requerido')).toBeInTheDocument();
    expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument();
    expect(screen.getByText('Titular requerido')).toBeInTheDocument();
  });

  it('fills in form and submits successfully', () => {
    render(<CheckoutForm />);

    // Customer fields
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('juan@email.com'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('3001234567'), {
      target: { value: '3001234567' },
    });

    // Delivery fields
    fireEvent.change(screen.getByPlaceholderText('Calle 123 #45-67'), {
      target: { value: 'Calle 100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Medellín'), {
      target: { value: 'Bogota' },
    });
    fireEvent.change(screen.getByPlaceholderText('Antioquia'), {
      target: { value: 'Cundinamarca' },
    });
    fireEvent.change(screen.getByPlaceholderText('050001'), {
      target: { value: '110111' },
    });

    // Card fields — use a valid Luhn number
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByPlaceholderText('NOMBRE COMO EN LA TARJETA'), {
      target: { value: 'JOHN DOE' },
    });

    // Select expiry month and year
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '12' } });
    fireEvent.change(selects[1], { target: { value: '30' } });

    // CVC
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' },
    });

    // Submit
    fireEvent.click(screen.getByText('Revisar resumen'));

    // Should have dispatched customer, delivery, cardInfo and navigated
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenCalledWith('/summary/prod-1');
  });

  it('navigates back on back button click', () => {
    render(<CheckoutForm />);

    fireEvent.click(screen.getByText('← Volver al producto'));
    expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1');
  });

  it('updates card number input and shows card brand', () => {
    render(<CheckoutForm />);

    const input = screen.getByPlaceholderText('4242 4242 4242 4242');
    fireEvent.change(input, { target: { value: '4242424242424242' } });

    // The card preview section should show visa brand
    expect(screen.getByText('visa')).toBeInTheDocument();
  });

  it('updates card holder to uppercase', () => {
    render(<CheckoutForm />);

    const input = screen.getByPlaceholderText('NOMBRE COMO EN LA TARJETA');
    fireEvent.change(input, { target: { value: 'john doe' } });

    expect(input).toHaveValue('JOHN DOE');
  });
});
