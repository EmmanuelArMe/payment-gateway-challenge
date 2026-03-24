jest.mock('../../config', () => ({ API_BASE_URL: 'http://localhost:3000' }));

import reducer, {
  clearSelectedProduct,
  fetchProductById,
  fetchProducts,
  selectProduct,
} from './productSlice';

describe('productSlice', () => {
  const initialState = {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
  };

  const sampleProduct = {
    id: 'prod-1',
    name: 'Test',
    description: 'A test product',
    price: 10000,
    currency: 'COP',
    stock: 10,
    imageUrl: 'https://example.com/img.jpg',
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('handles selectProduct', () => {
    const state = reducer(initialState, selectProduct(sampleProduct));

    expect(state.selectedProduct).toEqual(sampleProduct);
  });

  it('handles clearSelectedProduct', () => {
    const state = reducer(
      { ...initialState, selectedProduct: sampleProduct },
      clearSelectedProduct(),
    );

    expect(state.selectedProduct).toBeNull();
  });

  it('handles fetchProducts.pending', () => {
    const state = reducer(initialState, fetchProducts.pending('', undefined));

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles fetchProducts.fulfilled', () => {
    const products = [{ id: 'prod-1', name: 'Test' }];
    const state = reducer(initialState, fetchProducts.fulfilled(products as never, '', undefined));

    expect(state.loading).toBe(false);
    expect(state.items).toEqual(products);
  });

  it('handles fetchProducts.rejected', () => {
    const action = {
      type: fetchProducts.rejected.type,
      error: { message: 'Failed to load products' },
    };

    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load products');
  });

  it('handles fetchProductById.fulfilled', () => {
    const state = reducer(initialState, fetchProductById.fulfilled(sampleProduct as never, '', 'prod-1'));

    expect(state.selectedProduct).toEqual(sampleProduct);
  });

  it('handles fetchProductById.pending', () => {
    const state = reducer(initialState, fetchProductById.pending('', 'prod-1'));

    // pending is not explicitly handled so state remains unchanged
    expect(state.loading).toBe(false);
    expect(state.selectedProduct).toBeNull();
  });

  it('handles fetchProductById.rejected', () => {
    const action = {
      type: fetchProductById.rejected.type,
      error: { message: 'Not found' },
    };

    const state = reducer(initialState, action);

    // rejected is not explicitly handled so state remains unchanged
    expect(state.selectedProduct).toBeNull();
  });
});