import { Product } from '../../entities/index.js';
import { Result } from '../../../shared/result.js';

export interface ProductRepositoryPort {
  findAll(): Promise<Result<Product[]>>;
  findById(id: string): Promise<Result<Product | null>>;
  updateStock(id: string, quantity: number): Promise<Result<Product>>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
