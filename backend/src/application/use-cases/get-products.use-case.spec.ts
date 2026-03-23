import { GetProductsUseCase, GetProductByIdUseCase } from './get-products.use-case';
import { Result } from '../../shared/result';
import { Product } from '../../domain/entities/index';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: any;

  const mockProducts = [
    new Product('p1', 'Product 1', 'Desc 1', 50000, 'COP', 10, 'https://img.example.com/1.jpg', new Date()),
    new Product('p2', 'Product 2', 'Desc 2', 80000, 'COP', 5, 'https://img.example.com/2.jpg', new Date()),
  ];

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    useCase = new GetProductsUseCase(productRepository);
  });

  it('should return all products', async () => {
    productRepository.findAll.mockResolvedValue(Result.ok(mockProducts));

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].name).toBe('Product 1');
  });

  it('should return empty array when no products', async () => {
    productRepository.findAll.mockResolvedValue(Result.ok([]));

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it('should propagate repository errors', async () => {
    productRepository.findAll.mockResolvedValue(Result.fail('DB error'));

    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });
});

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let productRepository: any;

  const mockProduct = new Product('p1', 'Product 1', 'Desc', 50000, 'COP', 10, 'https://img.example.com/1.jpg', new Date());

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    useCase = new GetProductByIdUseCase(productRepository);
  });

  it('should return product by id', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));

    const result = await useCase.execute('p1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe('p1');
  });

  it('should fail when product not found', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('nonexistent');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should propagate repository errors', async () => {
    productRepository.findById.mockResolvedValue(Result.fail('DB error'));

    const result = await useCase.execute('p1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });
});
