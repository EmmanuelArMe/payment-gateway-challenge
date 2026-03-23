import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { Result } from '../../shared/result';
import { Transaction, TransactionStatus } from '../../domain/entities/index';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createTransactionUseCase: { execute: jest.Mock };
  let processPaymentUseCase: { execute: jest.Mock };
  let getTransactionUseCase: { execute: jest.Mock };

  const transaction = new Transaction(
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
    createTransactionUseCase = { execute: jest.fn() };
    processPaymentUseCase = { execute: jest.fn() };
    getTransactionUseCase = { execute: jest.fn() };

    controller = new TransactionController(
      createTransactionUseCase as never,
      processPaymentUseCase as never,
      getTransactionUseCase as never,
    );
  });

  it('creates a transaction', async () => {
    const dto = {
      productId: 'prod-1',
      quantity: 1,
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerPhone: '3001234567',
      deliveryAddress: 'Calle 1',
      deliveryCity: 'Bogota',
      deliveryDepartment: 'Cundinamarca',
      deliveryPostalCode: '110111',
    };
    createTransactionUseCase.execute.mockResolvedValue(Result.ok(transaction));

    await expect(controller.create(dto)).resolves.toEqual({ data: transaction });
    expect(createTransactionUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('throws bad request when transaction creation fails', async () => {
    createTransactionUseCase.execute.mockResolvedValue(Result.fail('invalid payload'));

    await expect(controller.create({} as never)).rejects.toMatchObject<HttpException>({
      message: 'invalid payload',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('processes a payment', async () => {
    processPaymentUseCase.execute.mockResolvedValue(Result.ok(transaction));

    await expect(
      controller.processPayment('tx-1', {
        cardToken: 'card-token',
        acceptanceToken: 'acceptance-token',
        customerEmail: 'john@example.com',
      }),
    ).resolves.toEqual({ data: transaction });

    expect(processPaymentUseCase.execute).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });
  });

  it('throws bad request when payment processing fails', async () => {
    processPaymentUseCase.execute.mockResolvedValue(Result.fail('payment failed'));

    await expect(
      controller.processPayment('tx-1', {
        cardToken: 'card-token',
        acceptanceToken: 'acceptance-token',
        customerEmail: 'john@example.com',
      }),
    ).rejects.toMatchObject<HttpException>({
      message: 'payment failed',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('returns a transaction by id', async () => {
    getTransactionUseCase.execute.mockResolvedValue(Result.ok(transaction));

    await expect(controller.findOne('tx-1')).resolves.toEqual({ data: transaction });
  });

  it('throws not found when transaction is missing', async () => {
    getTransactionUseCase.execute.mockResolvedValue(Result.fail('Transaction not found'));

    await expect(controller.findOne('missing')).rejects.toMatchObject<HttpException>({
      message: 'Transaction not found',
      status: HttpStatus.NOT_FOUND,
    });
  });
});