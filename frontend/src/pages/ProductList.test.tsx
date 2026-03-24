import { fireEvent, render, screen } from '@testing-library/react';
import ProductList from './ProductList';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockFetchProducts = jest.fn(() => ({ type: 'products/fetchAll' }));
const mockResetCheckout = jest.fn(() => ({ type: 'checkout/resetCheckout' }));
const mockUseAppSelector = jest.fn();

jest.mock('../hooks/useStore', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (...args: unknown[]) => mockUseAppSelector(...args),
}));

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../store/slices/productSlice', () => ({
  fetchProducts: () => mockFetchProducts(),
}));

jest.mock('../store/slices/checkoutSlice', () => ({
  resetCheckout: () => mockResetCheckout(),
}));

const defaultState = {
  products: {
    items: [
      {
        id: 'prod-1',
        name: 'Headphones',
        description: 'Noise cancelling',
        price: 250000,
        currency: 'COP',
        stock: 10,
        imageUrl: 'img',
        createdAt: '2026-03-23T00:00:00.000Z',
      },
    ],
    loading: false,
    error: null,
  },
};

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockImplementation(
      (selector: (state: unknown) => unknown) => selector(defaultState),
    );
  });

  it('dispatches initial actions and renders products', () => {
    render(<ProductList />);

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('10 disponibles')).toBeInTheDocument();
  });

  it('navigates to the product detail on click', () => {
    render(<ProductList />);

    fireEvent.click(screen.getByText('Headphones'));

    expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1');
  });

  it('filters products by search input', () => {
    render(<ProductList />);

    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'Headphones' } });

    expect(screen.getByText('Headphones')).toBeInTheDocument();

    // Clear search button should appear
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText(/No se encontraron productos/)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(<ProductList />);

    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'something' } });

    // Find the clear button (the X button in the search bar)
    const clearButtons = screen.getAllByRole('button');
    const clearBtn = clearButtons.find((btn) => btn.closest('.relative'));
    if (clearBtn) fireEvent.click(clearBtn);
  });

  it('navigates via Buy button', () => {
    render(<ProductList />);

    fireEvent.click(screen.getByText('Comprar ahora'));

    expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1');
  });
});

describe('ProductList — loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          products: { items: [], loading: true, error: null },
        }),
    );
  });

  it('shows loading spinner', () => {
    render(<ProductList />);
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });
});

describe('ProductList — error state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          products: { items: [], loading: false, error: 'Network error' },
        }),
    );
  });

  it('shows error and retry button dispatches fetchProducts', () => {
    render(<ProductList />);
    expect(screen.getByText('Network error')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});