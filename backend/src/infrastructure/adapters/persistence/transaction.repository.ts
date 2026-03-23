import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { TransactionRepositoryPort, CreateTransactionData } from '../../../domain/ports/outbound/transaction.repository.port.js';
import { Transaction, TransactionStatus } from '../../../domain/entities/index.js';
import { Result } from '../../../shared/result.js';

@Injectable()
export class TransactionPrismaRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Result<Transaction>> {
    try {
      const tx = await this.prisma.transaction.create({
        data: {
          productId: data.productId,
          customerId: data.customerId,
          quantity: data.quantity,
          amount: data.amount,
          baseFee: data.baseFee,
          deliveryFee: data.deliveryFee,
          total: data.total,
          paymentMethod: data.paymentMethod,
          status: 'PENDING',
        },
      });
      return Result.ok(this.toDomain(tx));
    } catch (error) {
      return Result.fail('Failed to create transaction');
    }
  }

  async findById(id: string): Promise<Result<Transaction | null>> {
    try {
      const tx = await this.prisma.transaction.findUnique({ where: { id } });
      if (!tx) return Result.ok(null);
      return Result.ok(this.toDomain(tx));
    } catch (error) {
      return Result.fail('Failed to fetch transaction');
    }
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    wompiReference?: string,
  ): Promise<Result<Transaction>> {
    try {
      const data: Record<string, unknown> = { status };
      if (wompiReference) data.wompiReference = wompiReference;

      const tx = await this.prisma.transaction.update({
        where: { id },
        data,
      });
      return Result.ok(this.toDomain(tx));
    } catch (error) {
      return Result.fail('Failed to update transaction');
    }
  }

  private toDomain(tx: {
    id: string;
    productId: string;
    customerId: string;
    quantity: number;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    total: number;
    status: string;
    wompiReference: string | null;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction(
      tx.id,
      tx.productId,
      tx.customerId,
      tx.quantity,
      tx.amount,
      tx.baseFee,
      tx.deliveryFee,
      tx.total,
      tx.status as TransactionStatus,
      tx.wompiReference,
      tx.paymentMethod,
      tx.createdAt,
      tx.updatedAt,
    );
  }
}
