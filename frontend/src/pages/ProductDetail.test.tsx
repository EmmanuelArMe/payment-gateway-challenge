import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetail from './ProductDetail';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

let mockProduct: Record<string, unknown> | null = {
  id: 'prod-1',
  name: 'Headphones',
  description: 'Noise-cancelling headphones',
  price: 250000,
  currency: 'COP',
  stock: 10,
  imageUrl: 'https://example.com/img.jpg',
  createdAt: '2026-01-01T00:00:00Z',
};
let mockLoading = false;

jest.mock('../hooks/useStore', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      products: { selectedProduct: mockProduct, loading: mockLoading },
      checkout: { quantity: 1 },
    }),
}));

jest.mock('react-router', () => ({
  useParams: () => ({ id: 'prod-1' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../store/slices/productSlice', () => ({
  fetchProductById: (id: string) => ({ type: 'products/fetchById', payload: id }),
}));

jest.mock('../store/slices/checkoutSlice', () => ({
  setQuantity: (q: number) => ({ type: 'checkout/setQuantity', payload: q }),
}));

describe('ProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProduct = {
      id: 'prod-1',
      name: 'Headphones',
      description: 'Noise-cancelling headphones',
      price: 250000,
      currency: 'COP',
      stock: 10,
      imageUrl: 'https://example.com/img.jpg',
      createdAt: '2026-01-01T00:00:00Z',
    };
    mockLoading = false;
  });

  it('renders product details', () => {
    render(<ProductDetail />);

    expect(screen.getByRole('heading', { name: 'Headphones' })).toBeInTheDocument();
    expect(screen.getByText('Noise-cancelling headphones')).toBeInTheDocument();
    expect(screen.getByText('10 unidades disponibles')).toBeInTheDocument();
    expect(screen.getByText('Continuar con la compra')).toBeInTheDocument();
  });

  it('renders loading spinner when loading', () => {
    mockLoading = true;
    const { container } = render(<ProductDetail />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders loading spinner when product is null', () => {
    mockProduct = null;
    const { container } = render(<ProductDetail />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('dispatches fetchProductById on mount', () => {
    render(<ProductDetail />);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'products/fetchById',
      payload: 'prod-1',
    });
  });

  it('increments and decrements quantity', () => {
    render(<ProductDetail />);

    const incrementBtn = screen.getByText('+');
    fireEvent.click(incrementBtn);

    expect(screen.getByText('2')).toBeInTheDocument();

    const decrementBtn = screen.getByText('−');
    fireEvent.click(decrementBtn);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('navigates to checkout on continue click', () => {
    render(<ProductDetail />);

    fireEvent.click(screen.getByText('Continuar con la compra'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'checkout/setQuantity',
      payload: 1,
    });
    expect(mockNavigate).toHaveBeenCalledWith('/checkout/prod-1');
  });

  it('navigates to home on back click', () => {
    render(<ProductDetail />);

    fireEvent.click(screen.getByText('Productos'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows out of stock message when stock is 0', () => {
    mockProduct = { ...mockProduct!, stock: 0 };
    render(<ProductDetail />);

    expect(screen.getByText('Producto agotado')).toBeInTheDocument();
    expect(screen.queryByText('Continuar con la compra')).not.toBeInTheDocument();
  });
});
