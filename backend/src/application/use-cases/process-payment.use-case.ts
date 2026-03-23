import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Transaction, TransactionStatus } from '../../domain/entities/index.js';
import type { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction.repository.port.js';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port.js';
import type { ProductRepositoryPort } from '../../domain/ports/outbound/product.repository.port.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';
import type { PaymentGatewayPort } from '../../domain/ports/outbound/payment-gateway.port.js';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery.repository.port.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';

export interface ProcessPaymentInput {
  transactionId: string;
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(input: ProcessPaymentInput): Promise<Result<Transaction>> {
    // Step 1: Get transaction
    const txResult = await this.transactionRepository.findById(input.transactionId);
    if (txResult.isFailure) return Result.fail(txResult.error);
    if (!txResult.value) return Result.fail('Transaction not found');

    const transaction = txResult.value;
    if (transaction.status !== TransactionStatus.PENDING) {
      return Result.fail('Transaction is not in PENDING status');
    }

    // Step 2: Create payment in Wompi
    const wompiResult = await this.paymentGateway.createTransaction({
      amountInCents: transaction.total * 100,
      currency: 'COP',
      customerEmail: input.customerEmail,
      reference: transaction.id,
      paymentMethodToken: input.cardToken,
      acceptanceToken: input.acceptanceToken,
    });

    if (wompiResult.isFailure) {
      await this.transactionRepository.updateStatus(
        transaction.id,
        TransactionStatus.ERROR,
      );
      return Result.fail(wompiResult.error);
    }

    const wompiTransaction = wompiResult.value;

    // Step 3: Map Wompi status to our status
    const statusMap: Record<string, TransactionStatus> = {
      APPROVED: TransactionStatus.APPROVED,
      DECLINED: TransactionStatus.DECLINED,
      VOIDED: TransactionStatus.VOIDED,
      ERROR: TransactionStatus.ERROR,
      PENDING: TransactionStatus.PENDING,
    };

    const newStatus = statusMap[wompiTransaction.status] || TransactionStatus.PENDING;

    // Step 4: Update transaction with result
    const updateResult = await this.transactionRepository.updateStatus(
      transaction.id,
      newStatus,
      wompiTransaction.id,
    );

    if (updateResult.isFailure) return Result.fail(updateResult.error);

    // Step 5: If approved, update stock and delivery status
    if (newStatus === TransactionStatus.APPROVED) {
      await this.productRepository.updateStock(
        transaction.productId,
        -transaction.quantity,
      );
      const deliveryResult = await this.deliveryRepository.findByTransactionId(transaction.id);
      if (deliveryResult.isSuccess && deliveryResult.value) {
        await this.deliveryRepository.updateStatus(deliveryResult.value.id, 'ASSIGNED');
      }
    }

    return updateResult;
  }
}
