import { Delivery } from '../../entities/index.js';
import { Result } from '../../../shared/result.js';

export interface CreateDeliveryData {
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

export interface DeliveryRepositoryPort {
  create(data: CreateDeliveryData): Promise<Result<Delivery>>;
  findByTransactionId(transactionId: string): Promise<Result<Delivery | null>>;
  updateStatus(id: string, status: string): Promise<Result<Delivery>>;
}

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');
