import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Customer } from '../../domain/entities/index.js';
import type { CustomerRepositoryPort } from '../../domain/ports/outbound/customer.repository.port.js';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer.repository.port.js';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Customer>> {
    const result = await this.customerRepository.findById(id);
    return result.flatMap((customer) => {
      if (!customer) {
        return Result.fail<Customer>('Customer not found');
      }
      return Result.ok(customer);
    });
  }
}

@Injectable()
export class GetCustomerByEmailUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(email: string): Promise<Result<Customer>> {
    const result = await this.customerRepository.findByEmail(email);
    return result.flatMap((customer) => {
      if (!customer) {
        return Result.fail<Customer>('Customer not found');
      }
      return Result.ok(customer);
    });
  }
}
