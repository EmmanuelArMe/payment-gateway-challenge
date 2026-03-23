import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import checkoutReducer from './slices/checkoutSlice';

// Middleware to persist checkout state in localStorage (resilience to refresh)
const localStorageMiddleware = (store: { getState: () => RootState }) =>
  (next: (action: unknown) => unknown) =>
  (action: unknown) => {
    const result = next(action);
    const state = store.getState();
    try {
      const checkoutToPersist = {
        step: state.checkout.step,
        quantity: state.checkout.quantity,
        customer: state.checkout.customer,
        delivery: state.checkout.delivery,
        cardInfo: state.checkout.cardInfo,
        transaction: state.checkout.transaction,
      };
      localStorage.setItem('checkoutState', JSON.stringify(checkoutToPersist));
    } catch {
      // ignore localStorage errors
    }
    return result;
  };

export const store = configureStore({
  reducer: {
    products: productReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
