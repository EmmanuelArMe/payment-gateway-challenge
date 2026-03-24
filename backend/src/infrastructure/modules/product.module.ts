import { Module } from '@nestjs/common';
import { ProductController } from '../controllers/product.controller.js';
import { GetProductsUseCase, GetProductByIdUseCase } from '../../application/use-cases/get-products.use-case.js';
import { ProductPrismaRepository } from '../adapters/persistence/product.repository.js';
import { PrismaService } from '../adapters/persistence/prisma/prisma.service.js';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port.js';

@Module({
  controllers: [ProductController],
  providers: [
    PrismaService,
    GetProductsUseCase,
    GetProductByIdUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductPrismaRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY, PrismaService],
})
export class ProductModule {}
