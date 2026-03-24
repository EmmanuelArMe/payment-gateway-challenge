import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Transaction } from '../../domain/entities/index.js';
import type { ProductRepositoryPort } from '../../domain/ports/outbound/product.repository.port.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';
import type { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction.repository.port.js';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port.js';
import type { CustomerRepositoryPort } from '../../domain/ports/outbound/customer.repository.port.js';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer.repository.port.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery.repository.port.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';
import { CreateTransactionDto } from '../dtos/create-transaction.dto.js';

const BASE_FEE = 5000; // Base fee in COP
const DELIVERY_FEE = 10000; // Delivery fee in COP

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Result<Transaction>> {
    // Step 1: Validate product exists and has stock
    const productResult = await this.productRepository.findById(dto.productId);
    if (productResult.isFailure) {
      return Result.fail(productResult.error);
    }

    const product = productResult.value;
    if (!product) {
      return Result.fail('Product not found');
    }

    if (product.stock < dto.quantity) {
      return Result.fail('Insufficient stock');
    }

    // Step 2: Create or find customer
    const customerResult = await this.customerRepository.findByEmail(
      dto.customerEmail,
    );
    if (customerResult.isFailure) {
      return Result.fail(customerResult.error);
    }

    let customerId: string;
    if (customerResult.value) {
      customerId = customerResult.value.id;
    } else {
      const newCustomerResult = await this.customerRepository.create({
        fullName: dto.customerName,
        email: dto.customerEmail,
        phone: dto.customerPhone,
      });
      if (newCustomerResult.isFailure) {
        return Result.fail(newCustomerResult.error);
      }
      customerId = newCustomerResult.value.id;
    }

    // Step 3: Calculate amounts
    const amount = product.price * dto.quantity;
    const baseFee = BASE_FEE;
    const deliveryFee = DELIVERY_FEE;
    const total = amount + baseFee + deliveryFee;

    // Step 4: Create transaction in PENDING
    const transactionResult = await this.transactionRepository.create({
      productId: dto.productId,
      customerId,
      quantity: dto.quantity,
      amount,
      baseFee,
      deliveryFee,
      total,
      paymentMethod: 'CARD',
    });

    if (transactionResult.isFailure) {
      return Result.fail(transactionResult.error);
    }

    // Step 5: Create delivery record
    const deliveryResult = await this.deliveryRepository.create({
      transactionId: transactionResult.value.id,
      customerId,
      address: dto.deliveryAddress,
      city: dto.deliveryCity,
      department: dto.deliveryDepartment,
      postalCode: dto.deliveryPostalCode,
    });

    if (deliveryResult.isFailure) {
      return Result.fail(deliveryResult.error);
    }

    return transactionResult;
  }
}
