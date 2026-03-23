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

  beforeEach(() => {
    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    useCase = new GetTransactionUseCase(transactionRepository);
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
});