import { ProcessPaymentUseCase } from './process-payment.use-case';
import { Result } from '../../shared/result';
import { Delivery, Product, Transaction, TransactionStatus } from '../../domain/entities/index';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let transactionRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };
  let productRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    updateStock: jest.Mock;
  };
  let paymentGateway: {
    getAcceptanceToken: jest.Mock;
    tokenizeCard: jest.Mock;
    createTransaction: jest.Mock;
    getTransaction: jest.Mock;
  };
  let deliveryRepository: {
    create: jest.Mock;
    findByTransactionId: jest.Mock;
    updateStatus: jest.Mock;
  };

  const pendingTransaction = new Transaction(
    'tx-1',
    'prod-1',
    'cust-1',
    2,
    100000,
    5000,
    10000,
    115000,
    TransactionStatus.PENDING,
    null,
    'CARD',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    paymentGateway = {
      getAcceptanceToken: jest.fn(),
      tokenizeCard: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
    };
    deliveryRepository = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };

    useCase = new ProcessPaymentUseCase(
      transactionRepository,
      productRepository,
      paymentGateway,
      deliveryRepository,
    );
  });

  it('fails when transaction lookup fails', async () => {
    transactionRepository.findById.mockResolvedValue(Result.fail('lookup error'));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('lookup error');
  });

  it('fails when transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Transaction not found');
  });

  it('fails when transaction is not pending', async () => {
    const approved = new Transaction(
      pendingTransaction.id,
      pendingTransaction.productId,
      pendingTransaction.customerId,
      pendingTransaction.quantity,
      pendingTransaction.amount,
      pendingTransaction.baseFee,
      pendingTransaction.deliveryFee,
      pendingTransaction.total,
      TransactionStatus.APPROVED,
      null,
      pendingTransaction.paymentMethod,
      pendingTransaction.createdAt,
      pendingTransaction.updatedAt,
    );
    transactionRepository.findById.mockResolvedValue(Result.ok(approved));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Transaction is not in PENDING status');
  });

  it('marks transaction as error when gateway creation fails', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(pendingTransaction));
    paymentGateway.createTransaction.mockResolvedValue(Result.fail('gateway error'));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('gateway error');
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      TransactionStatus.ERROR,
    );
  });

  it('updates transaction as approved and updates stock and delivery', async () => {
    const updatedTransaction = new Transaction(
      pendingTransaction.id,
      pendingTransaction.productId,
      pendingTransaction.customerId,
      pendingTransaction.quantity,
      pendingTransaction.amount,
      pendingTransaction.baseFee,
      pendingTransaction.deliveryFee,
      pendingTransaction.total,
      TransactionStatus.APPROVED,
      'wompi-1',
      pendingTransaction.paymentMethod,
      pendingTransaction.createdAt,
      pendingTransaction.updatedAt,
    );
    const delivery = new Delivery(
      'del-1',
      'tx-1',
      'cust-1',
      'Calle 1',
      'Bogota',
      'Cundinamarca',
      '110111',
      'PENDING',
      new Date(),
    );

    transactionRepository.findById.mockResolvedValue(Result.ok(pendingTransaction));
    paymentGateway.createTransaction.mockResolvedValue(
      Result.ok({
        id: 'wompi-1',
        status: 'APPROVED',
        reference: 'tx-1',
        amountInCents: 11500000,
      }),
    );
    transactionRepository.updateStatus.mockResolvedValue(Result.ok(updatedTransaction));
    productRepository.updateStock.mockResolvedValue(
      Result.ok(new Product('prod-1', 'Test', 'Desc', 50000, 'COP', 8, 'img', new Date())),
    );
    deliveryRepository.findByTransactionId.mockResolvedValue(Result.ok(delivery));
    deliveryRepository.updateStatus.mockResolvedValue(
      Result.ok(new Delivery('del-1', 'tx-1', 'cust-1', 'Calle 1', 'Bogota', 'Cundinamarca', '110111', 'ASSIGNED', new Date())),
    );

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isSuccess).toBe(true);
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      TransactionStatus.APPROVED,
      'wompi-1',
    );
    expect(productRepository.updateStock).toHaveBeenCalledWith('prod-1', -2);
    expect(deliveryRepository.updateStatus).toHaveBeenCalledWith('del-1', 'ASSIGNED');
  });

  it('maps unknown statuses to pending', async () => {
    const updatedTransaction = new Transaction(
      pendingTransaction.id,
      pendingTransaction.productId,
      pendingTransaction.customerId,
      pendingTransaction.quantity,
      pendingTransaction.amount,
      pendingTransaction.baseFee,
      pendingTransaction.deliveryFee,
      pendingTransaction.total,
      TransactionStatus.PENDING,
      'wompi-2',
      pendingTransaction.paymentMethod,
      pendingTransaction.createdAt,
      pendingTransaction.updatedAt,
    );

    transactionRepository.findById.mockResolvedValue(Result.ok(pendingTransaction));
    paymentGateway.createTransaction.mockResolvedValue(
      Result.ok({
        id: 'wompi-2',
        status: 'SOMETHING_ELSE',
        reference: 'tx-1',
        amountInCents: 11500000,
      }),
    );
    transactionRepository.updateStatus.mockResolvedValue(Result.ok(updatedTransaction));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    expect(result.isSuccess).toBe(true);
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      TransactionStatus.PENDING,
      'wompi-2',
    );
    expect(productRepository.updateStock).not.toHaveBeenCalled();
  });
});