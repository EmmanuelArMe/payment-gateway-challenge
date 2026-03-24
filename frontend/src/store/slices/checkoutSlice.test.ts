jest.mock('../../config', () => ({ API_BASE_URL: 'http://localhost:3000' }));

import reducer, {
  clearError,
  createTransaction,
  processPayment,
  resetCheckout,
  setCardInfo,
  setCustomer,
  setDelivery,
  setQuantity,
  setStep,
} from './checkoutSlice';
import { CheckoutStep } from '../../types';

describe('checkoutSlice', () => {
  const initialState = {
    step: CheckoutStep.PRODUCT,
    quantity: 1,
    customer: null,
    delivery: null,
    cardInfo: null,
    transaction: null,
    loading: false,
    error: null as string | null,
  };

  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.removeItem = jest.fn();
  });

  it('handles setStep', () => {
    const state = reducer(initialState, setStep(CheckoutStep.SUMMARY));
    expect(state.step).toBe(CheckoutStep.SUMMARY);
  });

  it('handles setQuantity', () => {
    const state = reducer(initialState, setQuantity(3));
    expect(state.quantity).toBe(3);
  });

  it('handles setCustomer', () => {
    const customer = { fullName: 'John', email: 'john@example.com', phone: '3001234567' };
    const state = reducer(initialState, setCustomer(customer));
    expect(state.customer).toEqual(customer);
  });

  it('handles setDelivery', () => {
    const delivery = { address: 'Calle 1', city: 'Bogota', department: 'Cundinamarca', postalCode: '110111' };
    const state = reducer(initialState, setDelivery(delivery));
    expect(state.delivery).toEqual(delivery);
  });

  it('handles setCardInfo', () => {
    const cardInfo = { number: '4242', expMonth: '12', expYear: '30', cardHolder: 'John Doe' };
    const state = reducer(initialState, setCardInfo(cardInfo));
    expect(state.cardInfo).toEqual(cardInfo);
  });

  it('handles resetCheckout', () => {
    const state = reducer(
      {
        ...initialState,
        step: CheckoutStep.RESULT,
        quantity: 3,
        customer: { fullName: 'John', email: 'john@example.com', phone: '3001234567' },
      },
      resetCheckout(),
    );

    expect(state).toEqual(initialState);
  });

  it('handles clearError', () => {
    const state = reducer({ ...initialState, error: 'boom' }, clearError());
    expect(state.error).toBeNull();
  });

  it('handles createTransaction.pending', () => {
    const state = reducer(initialState, createTransaction.pending('', {
      productId: 'prod-1',
      quantity: 1,
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerPhone: '3001234567',
      deliveryAddress: 'Calle 1',
      deliveryCity: 'Bogota',
      deliveryDepartment: 'Cundinamarca',
      deliveryPostalCode: '110111',
    }));
    expect(state.loading).toBe(true);
  });

  it('handles createTransaction.fulfilled', () => {
    const transaction = { id: 'tx-1', status: 'PENDING' };
    const state = reducer(initialState, createTransaction.fulfilled(transaction as never, '', {
      productId: 'prod-1',
      quantity: 1,
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerPhone: '3001234567',
      deliveryAddress: 'Calle 1',
      deliveryCity: 'Bogota',
      deliveryDepartment: 'Cundinamarca',
      deliveryPostalCode: '110111',
    }));
    expect(state.transaction).toEqual(transaction);
    expect(state.loading).toBe(false);
  });

  it('handles processPayment.fulfilled', () => {
    const transaction = { id: 'tx-1', status: 'APPROVED' };
    const state = reducer(initialState, processPayment.fulfilled(transaction as never, '', {
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    }));
    expect(state.transaction).toEqual(transaction);
    expect(state.step).toBe(CheckoutStep.RESULT);
  });

  it('handles createTransaction.rejected', () => {
    const action = {
      type: createTransaction.rejected.type,
      error: { message: 'Transaction failed' },
    };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Transaction failed');
  });

  it('handles processPayment.pending', () => {
    const state = reducer(initialState, processPayment.pending('', {
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles processPayment.rejected', () => {
    const action = {
      type: processPayment.rejected.type,
      error: { message: 'Payment failed' },
    };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Payment failed');
  });
});