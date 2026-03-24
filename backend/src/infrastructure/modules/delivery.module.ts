import { Module } from '@nestjs/common';
import { DeliveryController } from '../controllers/delivery.controller.js';
import { GetDeliveryUseCase } from '../../application/use-cases/get-delivery.use-case.js';
import { DeliveryPrismaRepository } from '../adapters/persistence/delivery.repository.js';
import { PrismaService } from '../adapters/persistence/prisma/prisma.service.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';

@Module({
  controllers: [DeliveryController],
  providers: [
    PrismaService,
    GetDeliveryUseCase,
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryPrismaRepository,
    },
  ],
})
export class DeliveryModule {}
