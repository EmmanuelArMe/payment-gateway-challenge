import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Transaction, TransactionStatus } from '../../domain/entities/index.js';
import type { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction.repository.port.js';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port.js';
import type { PaymentGatewayPort } from '../../domain/ports/outbound/payment-gateway.port.js';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port.js';
import type { ProductRepositoryPort } from '../../domain/ports/outbound/product.repository.port.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery.repository.port.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';

@Injectable()
export class GetTransactionUseCase {
  private static readonly STATUS_MAP: Record<string, TransactionStatus> = {
    APPROVED: TransactionStatus.APPROVED,
    DECLINED: TransactionStatus.DECLINED,
    VOIDED: TransactionStatus.VOIDED,
    ERROR: TransactionStatus.ERROR,
    PENDING: TransactionStatus.PENDING,
  };

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction>> {
    const result = await this.transactionRepository.findById(id);
    if (result.isFailure) return Result.fail(result.error);
    if (!result.value) return Result.fail('Transaction not found');

    const transaction = result.value;

    if (
      transaction.status === TransactionStatus.PENDING &&
      transaction.wompiReference
    ) {
      return this.syncWithWompi(transaction);
    }

    return Result.ok(transaction);
  }

  private async syncWithWompi(
    transaction: Transaction,
  ): Promise<Result<Transaction>> {
    const wompiResult = await this.paymentGateway.getTransaction(
      transaction.wompiReference!,
    );
    if (!wompiResult.isSuccess) return Result.ok(transaction);

    const newStatus =
      GetTransactionUseCase.STATUS_MAP[wompiResult.value.status] ||
      TransactionStatus.PENDING;
    if (newStatus === TransactionStatus.PENDING) {
      return Result.ok(transaction);
    }

    const updateResult = await this.transactionRepository.updateStatus(
      transaction.id,
      newStatus,
    );
    if (updateResult.isFailure) return Result.fail(updateResult.error);

    if (newStatus === TransactionStatus.APPROVED) {
      await this.handleApproval(transaction);
    }

    return updateResult;
  }

  private async handleApproval(transaction: Transaction): Promise<void> {
    await this.productRepository.updateStock(
      transaction.productId,
      -transaction.quantity,
    );
    const deliveryResult =
      await this.deliveryRepository.findByTransactionId(transaction.id);
    if (deliveryResult.isSuccess && deliveryResult.value) {
      await this.deliveryRepository.updateStatus(
        deliveryResult.value.id,
        'ASSIGNED',
      );
    }
  }
}
