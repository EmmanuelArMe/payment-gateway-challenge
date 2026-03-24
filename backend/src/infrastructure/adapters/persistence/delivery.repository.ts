import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import {
  DeliveryRepositoryPort,
  CreateDeliveryData,
} from '../../../domain/ports/outbound/delivery.repository.port.js';
import { Delivery } from '../../../domain/entities/index.js';
import { Result } from '../../../shared/result.js';

@Injectable()
export class DeliveryPrismaRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryData): Promise<Result<Delivery>> {
    try {
      const d = await this.prisma.delivery.create({
        data: {
          transactionId: data.transactionId,
          customerId: data.customerId,
          address: data.address,
          city: data.city,
          department: data.department,
          postalCode: data.postalCode,
        },
      });
      return Result.ok(
        new Delivery(
          d.id,
          d.transactionId,
          d.customerId,
          d.address,
          d.city,
          d.department,
          d.postalCode,
          d.status,
          d.createdAt,
        ),
      );
    } catch {
      return Result.fail('Failed to create delivery');
    }
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<Result<Delivery | null>> {
    try {
      const d = await this.prisma.delivery.findUnique({
        where: { transactionId },
      });
      if (!d) return Result.ok(null);
      return Result.ok(
        new Delivery(
          d.id,
          d.transactionId,
          d.customerId,
          d.address,
          d.city,
          d.department,
          d.postalCode,
          d.status,
          d.createdAt,
        ),
      );
    } catch {
      return Result.fail('Failed to fetch delivery');
    }
  }

  async updateStatus(id: string, status: string): Promise<Result<Delivery>> {
    try {
      const d = await this.prisma.delivery.update({
        where: { id },
        data: { status },
      });
      return Result.ok(
        new Delivery(
          d.id,
          d.transactionId,
          d.customerId,
          d.address,
          d.city,
          d.department,
          d.postalCode,
          d.status,
          d.createdAt,
        ),
      );
    } catch {
      return Result.fail('Failed to update delivery');
    }
  }
}
