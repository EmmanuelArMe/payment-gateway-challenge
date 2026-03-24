import { Result } from '../../../shared/result.js';

export interface TokenizeCardData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface CreateWompiTransactionData {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  paymentSourceId?: string;
  paymentMethodToken?: string;
  acceptanceToken: string;
}

export interface WompiTransactionResult {
  id: string;
  status: string;
  reference: string;
  amountInCents: number;
}

export interface PaymentGatewayPort {
  getAcceptanceToken(): Promise<Result<string>>;
  tokenizeCard(data: TokenizeCardData): Promise<Result<string>>;
  createTransaction(data: CreateWompiTransactionData): Promise<Result<WompiTransactionResult>>;
  getTransaction(transactionId: string): Promise<Result<WompiTransactionResult>>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
