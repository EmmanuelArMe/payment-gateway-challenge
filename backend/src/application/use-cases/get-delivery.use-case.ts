import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Delivery } from '../../domain/entities/index.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery.repository.port.js';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port.js';

@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(transactionId: string): Promise<Result<Delivery>> {
    const result = await this.deliveryRepository.findByTransactionId(transactionId);
    return result.flatMap((delivery) => {
      if (!delivery) {
        return Result.fail<Delivery>('Delivery not found');
      }
      return Result.ok(delivery);
    });
  }
}
