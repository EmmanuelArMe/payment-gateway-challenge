import { fireEvent, render, screen } from '@testing-library/react';
import ProductList from './ProductList';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockFetchProducts = jest.fn(() => ({ type: 'products/fetchAll' }));
const mockResetCheckout = jest.fn(() => ({ type: 'checkout/resetCheckout' }));

jest.mock('../hooks/useStore', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
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
    }),
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

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});