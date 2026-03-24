import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { Result } from '../../shared/result';
import { Customer } from '../../domain/entities/index';

describe('CustomerController', () => {
  let controller: CustomerController;
  let getCustomerUseCase: { execute: jest.Mock };
  let getCustomerByEmailUseCase: { execute: jest.Mock };

  const customer = new Customer(
    'cust-1',
    'John Doe',
    'john@example.com',
    '3001234567',
    new Date(),
  );

  beforeEach(() => {
    getCustomerUseCase = { execute: jest.fn() };
    getCustomerByEmailUseCase = { execute: jest.fn() };
    controller = new CustomerController(
      getCustomerUseCase as never,
      getCustomerByEmailUseCase as never,
    );
  });

  it('returns a customer by id', async () => {
    getCustomerUseCase.execute.mockResolvedValue(Result.ok(customer));

    await expect(controller.findOne('cust-1')).resolves.toEqual({
      data: customer,
    });
    expect(getCustomerUseCase.execute).toHaveBeenCalledWith('cust-1');
  });

  it('throws not found when customer lookup fails', async () => {
    getCustomerUseCase.execute.mockResolvedValue(
      Result.fail('Customer not found'),
    );

    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(
      HttpException,
    );
    await expect(controller.findOne('missing')).rejects.toMatchObject({
      message: 'Customer not found',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('returns a customer by email', async () => {
    getCustomerByEmailUseCase.execute.mockResolvedValue(Result.ok(customer));

    await expect(controller.findByEmail('john@example.com')).resolves.toEqual({
      data: customer,
    });
    expect(getCustomerByEmailUseCase.execute).toHaveBeenCalledWith(
      'john@example.com',
    );
  });

  it('throws not found when customer email lookup fails', async () => {
    getCustomerByEmailUseCase.execute.mockResolvedValue(
      Result.fail('Customer not found'),
    );

    await expect(
      controller.findByEmail('missing@example.com'),
    ).rejects.toBeInstanceOf(HttpException);
    await expect(
      controller.findByEmail('missing@example.com'),
    ).rejects.toMatchObject({
      message: 'Customer not found',
      status: HttpStatus.NOT_FOUND,
    });
  });
});
