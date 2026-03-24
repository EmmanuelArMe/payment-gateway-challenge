import { TransactionStatus } from './transaction-status.enum.js';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly quantity: number,
    public readonly amount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public readonly total: number,
    public readonly status: TransactionStatus,
    public readonly wompiReference: string | null,
    public readonly paymentMethod: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
