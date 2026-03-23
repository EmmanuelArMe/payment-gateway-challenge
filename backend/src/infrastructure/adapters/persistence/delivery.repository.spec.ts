import { DeliveryPrismaRepository } from './delivery.repository';

describe('DeliveryPrismaRepository', () => {
  let repository: DeliveryPrismaRepository;
  let prisma: {
    delivery: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      delivery: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new DeliveryPrismaRepository(prisma as never);
  });

  it('creates a delivery', async () => {
    prisma.delivery.create.mockResolvedValue({
      id: 'del-1',
      transactionId: 'tx-1',
      customerId: 'cust-1',
      address: 'Calle 1',
      city: 'Bogota',
      department: 'Cundinamarca',
      postalCode: '110111',
      status: 'PENDING',
      createdAt: new Date(),
    });

    const result = await repository.create({
      transactionId: 'tx-1',
      customerId: 'cust-1',
      address: 'Calle 1',
      city: 'Bogota',
      department: 'Cundinamarca',
      postalCode: '110111',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('PENDING');
  });

  it('returns null when delivery does not exist', async () => {
    prisma.delivery.findUnique.mockResolvedValue(null);

    const result = await repository.findByTransactionId('missing');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
  });

  it('updates delivery status', async () => {
    prisma.delivery.update.mockResolvedValue({
      id: 'del-1',
      transactionId: 'tx-1',
      customerId: 'cust-1',
      address: 'Calle 1',
      city: 'Bogota',
      department: 'Cundinamarca',
      postalCode: '110111',
      status: 'ASSIGNED',
      createdAt: new Date(),
    });

    const result = await repository.updateStatus('del-1', 'ASSIGNED');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('ASSIGNED');
  });
});