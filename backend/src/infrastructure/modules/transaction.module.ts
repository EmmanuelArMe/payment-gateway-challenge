import { Module } from '@nestjs/common';
import { TransactionController } from '../controllers/transaction.controller.js';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case.js';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case.js';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case.js';
import { TransactionPrismaRepository } from '../adapters/persistence/transaction.repository.js';
import { CustomerPrismaRepository } from '../adapters/persistence/customer.repository.js';
import { DeliveryPrismaRepository } from '../adapters/persistence/delivery.repository.js';
import { WompiAdapter } from '../adapters/external/wompi/wompi.adapter.js';
import { PrismaService } from '../adapters/persistence/prisma/prisma.service.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port.js';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer.repository.port.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port.js';
import { ProductPrismaRepository } from '../adapters/persistence/product.repository.js';

@Module({
  controllers: [TransactionController],
  providers: [
    PrismaService,
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductPrismaRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionPrismaRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerPrismaRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryPrismaRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: WompiAdapter,
    },
  ],
})
export class TransactionModule {}
