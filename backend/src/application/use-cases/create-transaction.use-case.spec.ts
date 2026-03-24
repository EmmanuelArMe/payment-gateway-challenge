import { CreateTransactionUseCase } from './create-transaction.use-case';
import { Result } from '../../shared/result';
import {
  Product,
  Customer,
  Transaction,
  TransactionStatus,
  Delivery,
} from '../../domain/entities/index';
import {
  ProductRepositoryPort,
  CustomerRepositoryPort,
  TransactionRepositoryPort,
  DeliveryRepositoryPort,
} from '../../domain/ports/outbound/index';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let customerRepository: jest.Mocked<CustomerRepositoryPort>;
  let deliveryRepository: jest.Mocked<DeliveryRepositoryPort>;

  const mockProduct = new Product(
    'prod-1',
    'Test',
    'Desc',
    50000,
    'COP',
    10,
    'https://img.example.com/test.jpg',
    new Date(),
  );
  const mockCustomer = new Customer(
    'cust-1',
    'John',
    'john@example.com',
    '300123',
    new Date(),
  );
  const mockTransaction = new Transaction(
    'tx-1',
    'prod-1',
    'cust-1',
    1,
    50000,
    5000,
    10000,
    65000,
    TransactionStatus.PENDING,
    null,
    'CARD',
    new Date(),
    new Date(),
  );
  const mockDelivery = new Delivery(
    'del-1',
    'tx-1',
    'cust-1',
    'Calle 1',
    'Bogotá',
    'Cundinamarca',
    '110111',
    'PENDING',
    new Date(),
  );

  const validDto = {
    productId: 'prod-1',
    quantity: 1,
    customerName: 'John',
    customerEmail: 'john@example.com',
    customerPhone: '300123',
    deliveryAddress: 'Calle 1',
    deliveryCity: 'Bogotá',
    deliveryDepartment: 'Cundinamarca',
    deliveryPostalCode: '110111',
  };

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    customerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    deliveryRepository = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };

    useCase = new CreateTransactionUseCase(
      productRepository,
      transactionRepository,
      customerRepository,
      deliveryRepository,
    );
  });

  it('should create a transaction successfully with new customer', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(null));
    customerRepository.create.mockResolvedValue(Result.ok(mockCustomer));
    transactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
    deliveryRepository.create.mockResolvedValue(Result.ok(mockDelivery));

    const result = await useCase.execute(validDto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe('tx-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMock = transactionRepository.create as jest.Mock;
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        customerId: 'cust-1',
        quantity: 1,
        amount: 50000,
        baseFee: 5000,
        deliveryFee: 10000,
        total: 65000,
        paymentMethod: 'CARD',
      }),
    );
  });

  it('should reuse existing customer', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(mockCustomer));
    transactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
    deliveryRepository.create.mockResolvedValue(Result.ok(mockDelivery));

    const result = await useCase.execute(validDto);

    expect(result.isSuccess).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createCustomerMock = customerRepository.create as jest.Mock;
    expect(createCustomerMock).not.toHaveBeenCalled();
  });

  it('should fail when product not found', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should fail when product repository fails', async () => {
    productRepository.findById.mockResolvedValue(Result.fail('DB error'));

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });

  it('should fail when stock is insufficient', async () => {
    const lowStockProduct = new Product(
      'prod-1',
      'Test',
      'Desc',
      50000,
      'COP',
      0,
      'https://img.example.com/test.jpg',
      new Date(),
    );
    productRepository.findById.mockResolvedValue(Result.ok(lowStockProduct));

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Insufficient stock');
  });

  it('should fail when customer lookup fails', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(
      Result.fail('Customer lookup error'),
    );

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer lookup error');
  });

  it('should fail when customer creation fails', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(null));
    customerRepository.create.mockResolvedValue(
      Result.fail('Create customer error'),
    );

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Create customer error');
  });

  it('should fail when transaction creation fails', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(mockCustomer));
    transactionRepository.create.mockResolvedValue(
      Result.fail('TX create error'),
    );

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('TX create error');
  });

  it('should fail when delivery creation fails', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(mockCustomer));
    transactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
    deliveryRepository.create.mockResolvedValue(Result.fail('Delivery error'));

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Delivery error');
  });

  it('should calculate amounts correctly for multiple quantities', async () => {
    productRepository.findById.mockResolvedValue(Result.ok(mockProduct));
    customerRepository.findByEmail.mockResolvedValue(Result.ok(mockCustomer));
    transactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
    deliveryRepository.create.mockResolvedValue(Result.ok(mockDelivery));

    await useCase.execute({ ...validDto, quantity: 3 });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMockQty = transactionRepository.create as jest.Mock;
    expect(createMockQty).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150000, // 50000 * 3
        baseFee: 5000,
        deliveryFee: 10000,
        total: 165000, // 150000 + 5000 + 10000
      }),
    );
  });
});
