import { CustomerPrismaRepository } from './customer.repository';

describe('CustomerPrismaRepository', () => {
  let repository: CustomerPrismaRepository;
  let prisma: {
    customer: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      customer: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    repository = new CustomerPrismaRepository(prisma as never);
  });

  it('creates a customer', async () => {
    prisma.customer.create.mockResolvedValue({
      id: 'cust-1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '3001234567',
      createdAt: new Date(),
    });

    const result = await repository.create({
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '3001234567',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.email).toBe('john@example.com');
  });

  it('returns null when customer email is missing', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);

    const result = await repository.findByEmail('missing@example.com');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
  });

  it('returns failure when prisma throws', async () => {
    prisma.customer.findUnique.mockRejectedValue(new Error('db error'));

    const result = await repository.findById('cust-1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Failed to fetch customer');
  });
});