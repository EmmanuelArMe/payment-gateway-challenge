import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Product } from '../../domain/entities/index.js';
import type { ProductRepositoryPort } from '../../domain/ports/outbound/product.repository.port.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[]>> {
    return this.productRepository.findAll();
  }
}

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product>> {
    const result = await this.productRepository.findById(id);
    return result.flatMap((product) => {
      if (!product) {
        return Result.fail<Product>('Product not found');
      }
      return Result.ok(product);
    });
  }
}
