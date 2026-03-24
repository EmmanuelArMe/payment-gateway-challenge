import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Transaction, type CreditCardInfo, type Customer, type DeliveryInfo, CheckoutStep } from '../../types';
import { api } from '../../services/api';

interface CheckoutState {
  step: CheckoutStep;
  quantity: number;
  customer: Customer | null;
  delivery: DeliveryInfo | null;
  cardInfo: Omit<CreditCardInfo, 'cvc'> | null; // Never store CVC
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

const loadState = (): Partial<CheckoutState> => {
  try {
    const serialized = localStorage.getItem('checkoutState');
    if (serialized) {
      return JSON.parse(serialized);
    }
  } catch {
    // ignore errors
  }
  return {};
};

const savedState = loadState();

const initialState: CheckoutState = {
  step: (savedState.step as CheckoutStep) || CheckoutStep.PRODUCT,
  quantity: savedState.quantity || 1,
  customer: savedState.customer || null,
  delivery: savedState.delivery || null,
  cardInfo: savedState.cardInfo || null,
  transaction: savedState.transaction || null,
  loading: false,
  error: null,
};

export const createTransaction = createAsyncThunk(
  'checkout/createTransaction',
  async (
    data: {
      productId: string;
      quantity: number;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      deliveryAddress: string;
      deliveryCity: string;
      deliveryDepartment: string;
      deliveryPostalCode: string;
    },
  ) => {
    const response = await api.createTransaction(data);
    return response.data;
  },
);

export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async (data: {
    transactionId: string;
    cardToken: string;
    acceptanceToken: string;
    customerEmail: string;
  }) => {
    const response = await api.processPayment(data.transactionId, {
      cardToken: data.cardToken,
      acceptanceToken: data.acceptanceToken,
      customerEmail: data.customerEmail,
    });
    return response.data;
  },
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
    setCustomer: (state, action: PayloadAction<Customer>) => {
      state.customer = action.payload;
    },
    setDelivery: (state, action: PayloadAction<DeliveryInfo>) => {
      state.delivery = action.payload;
    },
    setCardInfo: (state, action: PayloadAction<Omit<CreditCardInfo, 'cvc'>>) => {
      state.cardInfo = action.payload;
    },
    resetCheckout: (state) => {
      state.step = CheckoutStep.PRODUCT;
      state.quantity = 1;
      state.customer = null;
      state.delivery = null;
      state.cardInfo = null;
      state.transaction = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('checkoutState');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
        state.step = CheckoutStep.RESULT;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Payment failed';
      });
  },
});

export const {
  setStep,
  setQuantity,
  setCustomer,
  setDelivery,
  setCardInfo,
  resetCheckout,
  clearError,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
