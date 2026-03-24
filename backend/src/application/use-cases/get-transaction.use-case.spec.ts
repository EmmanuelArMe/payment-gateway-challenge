import { GetTransactionUseCase } from './get-transaction.use-case';
import { Result } from '../../shared/result';
import { Transaction, TransactionStatus } from '../../domain/entities/index';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let transactionRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };
  let paymentGateway: {
    getAcceptanceToken: jest.Mock;
    tokenizeCard: jest.Mock;
    createTransaction: jest.Mock;
    getTransaction: jest.Mock;
  };
  let productRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    updateStock: jest.Mock;
  };
  let deliveryRepository: {
    create: jest.Mock;
    findByTransactionId: jest.Mock;
    updateStatus: jest.Mock;
  };

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

  const mockTransactionWithRef = new Transaction(
    'tx-1',
    'prod-1',
    'cust-1',
    1,
    50000,
    5000,
    10000,
    65000,
    TransactionStatus.PENDING,
    'wompi-ref-123',
    'CARD',
    new Date(),
    new Date(),
  );

  const mockApprovedTransaction = new Transaction(
    'tx-1',
    'prod-1',
    'cust-1',
    1,
    50000,
    5000,
    10000,
    65000,
    TransactionStatus.APPROVED,
    'wompi-ref-123',
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

    paymentGateway = {
      getAcceptanceToken: jest.fn(),
      tokenizeCard: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
    };

    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    deliveryRepository = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };

    useCase = new GetTransactionUseCase(
      transactionRepository,
      paymentGateway,
      productRepository,
      deliveryRepository,
    );
  });

  it('returns a transaction when found', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransaction));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(mockTransaction);
    expect(transactionRepository.findById).toHaveBeenCalledWith('tx-1');
  });

  it('fails when repository fails', async () => {
    transactionRepository.findById.mockResolvedValue(Result.fail('db error'));

    const result = await useCase.execute('tx-1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('db error');
  });

  it('fails when transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Transaction not found');
  });

  it('polls Wompi and updates status when PENDING with wompiReference', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransactionWithRef));
    paymentGateway.getTransaction.mockResolvedValue(
      Result.ok({ id: 'wompi-ref-123', status: 'APPROVED', reference: 'tx-1', amountInCents: 6500000 }),
    );
    transactionRepository.updateStatus.mockResolvedValue(Result.ok(mockApprovedTransaction));
    productRepository.updateStock.mockResolvedValue(Result.ok({}));
    deliveryRepository.findByTransactionId.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(TransactionStatus.APPROVED);
    expect(paymentGateway.getTransaction).toHaveBeenCalledWith('wompi-ref-123');
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith('tx-1', TransactionStatus.APPROVED);
    expect(productRepository.updateStock).toHaveBeenCalledWith('prod-1', -1);
  });

  it('does not poll Wompi when transaction has no wompiReference', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransaction));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
  });

  it('returns PENDING when Wompi still shows PENDING', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransactionWithRef));
    paymentGateway.getTransaction.mockResolvedValue(
      Result.ok({ id: 'wompi-ref-123', status: 'PENDING', reference: 'tx-1', amountInCents: 6500000 }),
    );

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(TransactionStatus.PENDING);
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('returns PENDING when Wompi call fails', async () => {
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransactionWithRef));
    paymentGateway.getTransaction.mockResolvedValue(Result.fail('Wompi error'));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(TransactionStatus.PENDING);
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('does not poll Wompi for non-PENDING transactions', async () => {
    const approvedTx = new Transaction(
      'tx-1', 'prod-1', 'cust-1', 1, 50000, 5000, 10000, 65000,
      TransactionStatus.APPROVED, 'wompi-ref-123', 'CARD', new Date(), new Date(),
    );
    transactionRepository.findById.mockResolvedValue(Result.ok(approvedTx));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
  });

  it('updates delivery status when transaction is approved', async () => {
    const mockDelivery = { id: 'del-1', transactionId: 'tx-1', status: 'PENDING' };
    transactionRepository.findById.mockResolvedValue(Result.ok(mockTransactionWithRef));
    paymentGateway.getTransaction.mockResolvedValue(
      Result.ok({ id: 'wompi-ref-123', status: 'APPROVED', reference: 'tx-1', amountInCents: 6500000 }),
    );
    transactionRepository.updateStatus.mockResolvedValue(Result.ok(mockApprovedTransaction));
    productRepository.updateStock.mockResolvedValue(Result.ok({}));
    deliveryRepository.findByTransactionId.mockResolvedValue(Result.ok(mockDelivery));
    deliveryRepository.updateStatus.mockResolvedValue(Result.ok({}));

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(deliveryRepository.findByTransactionId).toHaveBeenCalledWith('tx-1');
    expect(deliveryRepository.updateStatus).toHaveBeenCalledWith('del-1', 'ASSIGNED');
  });
});