export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  createdAt: string;
}

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

export interface CreditCardInfo {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export const TransactionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  VOIDED: 'VOIDED',
  ERROR: 'ERROR',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface Transaction {
  id: string;
  productId: string;
  customerId: string;
  quantity: number;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  status: TransactionStatus;
  wompiReference: string | null;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const CheckoutStep = {
  PRODUCT: 'PRODUCT',
  PAYMENT_INFO: 'PAYMENT_INFO',
  SUMMARY: 'SUMMARY',
  RESULT: 'RESULT',
} as const;
export type CheckoutStep = (typeof CheckoutStep)[keyof typeof CheckoutStep];

export interface ApiResponse<T> {
  data: T;
}
