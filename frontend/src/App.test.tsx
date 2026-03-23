import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';

jest.mock('./pages/ProductList', () => () => <div>Product List Page</div>);
jest.mock('./pages/ProductDetail', () => () => <div>Product Detail Page</div>);
jest.mock('./pages/CheckoutForm', () => () => <div>Checkout Form Page</div>);
jest.mock('./pages/Summary', () => () => <div>Summary Page</div>);
jest.mock('./pages/TransactionResult', () => () => <div>Transaction Result Page</div>);

const createStore = () =>
  configureStore({
    reducer: {
      products: () => ({ items: [], selectedProduct: null, loading: false, error: null }),
      checkout: () => ({
        step: 'PRODUCT',
        quantity: 1,
        customer: null,
        delivery: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
      }),
    },
  });

describe('App', () => {
  it('renders the application header', () => {
    render(
      <Provider store={createStore()}>
        <App />
      </Provider>,
    );

    expect(screen.getByText('Payment Gateway')).toBeInTheDocument();
  });
});