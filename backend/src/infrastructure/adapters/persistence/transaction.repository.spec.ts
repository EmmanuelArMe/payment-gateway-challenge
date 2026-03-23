import { TransactionPrismaRepository } from './transaction.repository';
import { TransactionStatus } from '../../../domain/entities/index';

describe('TransactionPrismaRepository', () => {
  let repository: TransactionPrismaRepository;
  let prisma: {
    transaction: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const transactionRecord = {
    id: 'tx-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    quantity: 1,
    amount: 50000,
    baseFee: 5000,
    deliveryFee: 10000,
    total: 65000,
    status: 'PENDING',
    wompiReference: null,
    paymentMethod: 'CARD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new TransactionPrismaRepository(prisma as never);
  });

  it('creates a transaction', async () => {
    prisma.transaction.create.mockResolvedValue(transactionRecord);

    const result = await repository.create({
      productId: 'prod-1',
      customerId: 'cust-1',
      quantity: 1,
      amount: 50000,
      baseFee: 5000,
      deliveryFee: 10000,
      total: 65000,
      paymentMethod: 'CARD',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(TransactionStatus.PENDING);
  });

  it('returns null when transaction is missing', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
  });

  it('updates status and reference', async () => {
    prisma.transaction.update.mockResolvedValue({
      ...transactionRecord,
      status: 'APPROVED',
      wompiReference: 'wompi-1',
    });

    const result = await repository.updateStatus(
      'tx-1',
      TransactionStatus.APPROVED,
      'wompi-1',
    );

    expect(result.isSuccess).toBe(true);
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 'tx-1' },
      data: { status: TransactionStatus.APPROVED, wompiReference: 'wompi-1' },
    });
  });
});