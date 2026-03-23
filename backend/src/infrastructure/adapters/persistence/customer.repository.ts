import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { CustomerRepositoryPort, CreateCustomerData } from '../../../domain/ports/outbound/customer.repository.port.js';
import { Customer } from '../../../domain/entities/index.js';
import { Result } from '../../../shared/result.js';

@Injectable()
export class CustomerPrismaRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCustomerData): Promise<Result<Customer>> {
    try {
      const c = await this.prisma.customer.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        },
      });
      return Result.ok(new Customer(c.id, c.fullName, c.email, c.phone, c.createdAt));
    } catch (error) {
      return Result.fail('Failed to create customer');
    }
  }

  async findById(id: string): Promise<Result<Customer | null>> {
    try {
      const c = await this.prisma.customer.findUnique({ where: { id } });
      if (!c) return Result.ok(null);
      return Result.ok(new Customer(c.id, c.fullName, c.email, c.phone, c.createdAt));
    } catch (error) {
      return Result.fail('Failed to fetch customer');
    }
  }

  async findByEmail(email: string): Promise<Result<Customer | null>> {
    try {
      const c = await this.prisma.customer.findUnique({ where: { email } });
      if (!c) return Result.ok(null);
      return Result.ok(new Customer(c.id, c.fullName, c.email, c.phone, c.createdAt));
    } catch (error) {
      return Result.fail('Failed to fetch customer');
    }
  }
}
