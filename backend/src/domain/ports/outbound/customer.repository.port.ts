import { Customer } from '../../entities/index.js';
import { Result } from '../../../shared/result.js';

export interface CreateCustomerData {
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerRepositoryPort {
  create(data: CreateCustomerData): Promise<Result<Customer>>;
  findById(id: string): Promise<Result<Customer | null>>;
  findByEmail(email: string): Promise<Result<Customer | null>>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
