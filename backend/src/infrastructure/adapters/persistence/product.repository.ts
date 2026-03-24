import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port.js';
import { Product } from '../../../domain/entities/index.js';
import { Result } from '../../../shared/result.js';

@Injectable()
export class ProductPrismaRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Result<Product[]>> {
    try {
      const products = await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return Result.ok(
        products.map(
          (p) =>
            new Product(
              p.id,
              p.name,
              p.description,
              p.price,
              p.currency,
              p.stock,
              p.imageUrl,
              p.createdAt,
            ),
        ),
      );
    } catch {
      return Result.fail('Failed to fetch products');
    }
  }

  async findById(id: string): Promise<Result<Product | null>> {
    try {
      const p = await this.prisma.product.findUnique({ where: { id } });
      if (!p) return Result.ok(null);
      return Result.ok(
        new Product(
          p.id,
          p.name,
          p.description,
          p.price,
          p.currency,
          p.stock,
          p.imageUrl,
          p.createdAt,
        ),
      );
    } catch {
      return Result.fail('Failed to fetch product');
    }
  }

  async updateStock(id: string, quantity: number): Promise<Result<Product>> {
    try {
      const p = await this.prisma.product.update({
        where: { id },
        data: { stock: { increment: quantity } },
      });
      return Result.ok(
        new Product(
          p.id,
          p.name,
          p.description,
          p.price,
          p.currency,
          p.stock,
          p.imageUrl,
          p.createdAt,
        ),
      );
    } catch {
      return Result.fail('Failed to update stock');
    }
  }
}
