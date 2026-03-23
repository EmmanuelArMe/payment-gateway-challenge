import { Module } from '@nestjs/common';
import { CustomerController } from '../controllers/customer.controller.js';
import { GetCustomerUseCase, GetCustomerByEmailUseCase } from '../../application/use-cases/get-customer.use-case.js';
import { CustomerPrismaRepository } from '../adapters/persistence/customer.repository.js';
import { PrismaService } from '../adapters/persistence/prisma/prisma.service.js';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer.repository.port.js';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaService,
    GetCustomerUseCase,
    GetCustomerByEmailUseCase,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerPrismaRepository,
    },
  ],
})
export class CustomerModule {}
