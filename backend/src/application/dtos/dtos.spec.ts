import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';
import { ProcessPaymentDto } from './process-payment.dto';

describe('CreateTransactionDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      productId: 'prod-1',
      quantity: 1,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '3001234567',
      deliveryAddress: 'Calle 123',
      deliveryCity: 'Bogota',
      deliveryDepartment: 'Cundinamarca',
      deliveryPostalCode: '110111',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid payload', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      productId: '',
      quantity: 0,
      customerName: '',
      customerEmail: 'bad-email',
      customerPhone: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryDepartment: '',
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(
      expect.arrayContaining([
        'productId',
        'quantity',
        'customerName',
        'customerEmail',
        'customerPhone',
        'deliveryAddress',
        'deliveryCity',
        'deliveryDepartment',
      ]),
    );
  });
});

describe('ProcessPaymentDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(ProcessPaymentDto, {
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      customerEmail: 'john@example.com',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid payload', async () => {
    const dto = plainToInstance(ProcessPaymentDto, {
      cardToken: '',
      acceptanceToken: '',
      customerEmail: 'bad-email',
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(
      expect.arrayContaining(['cardToken', 'acceptanceToken', 'customerEmail']),
    );
  });
});
