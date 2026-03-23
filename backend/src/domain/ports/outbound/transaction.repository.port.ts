import { Transaction, TransactionStatus } from '../../entities/index.js';
import { Result } from '../../../shared/result.js';

export interface CreateTransactionData {
  productId: string;
  customerId: string;
  quantity: number;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}

export interface TransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<Result<Transaction>>;
  findById(id: string): Promise<Result<Transaction | null>>;
  updateStatus(id: string, status: TransactionStatus, wompiReference?: string): Promise<Result<Transaction>>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
