import { ProductPrismaRepository } from './product.repository';

describe('ProductPrismaRepository', () => {
  let repository: ProductPrismaRepository;
  let prisma: {
    product: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new ProductPrismaRepository(prisma as never);
  });

  it('returns mapped products', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Headphones',
        description: 'Desc',
        price: 250000,
        currency: 'COP',
        stock: 10,
        imageUrl: 'img',
        createdAt: new Date(),
      },
    ]);

    const result = await repository.findAll();

    expect(result.isSuccess).toBe(true);
    expect(result.value[0].name).toBe('Headphones');
  });

  it('returns null when product is missing', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
  });

  it('updates stock and maps the result', async () => {
    prisma.product.update.mockResolvedValue({
      id: 'prod-1',
      name: 'Headphones',
      description: 'Desc',
      price: 250000,
      currency: 'COP',
      stock: 8,
      imageUrl: 'img',
      createdAt: new Date(),
    });

    const result = await repository.updateStock('prod-1', -2);

    expect(result.isSuccess).toBe(true);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { increment: -2 } },
    });
  });

  it('returns failures when prisma throws', async () => {
    prisma.product.findMany.mockRejectedValue(new Error('db error'));

    const result = await repository.findAll();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Failed to fetch products');
  });
});