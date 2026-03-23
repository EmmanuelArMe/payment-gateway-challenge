import { GetCustomerUseCase, GetCustomerByEmailUseCase } from './get-customer.use-case';
import { Result } from '../../shared/result';
import { Customer } from '../../domain/entities/index';

describe('GetCustomerUseCase', () => {
  let useCase: GetCustomerUseCase;
  let customerRepository: any;

  const mockCustomer = new Customer('cust-1', 'John Doe', 'john@example.com', '3001234567', new Date());

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    useCase = new GetCustomerUseCase(customerRepository);
  });

  it('should return a customer when found', async () => {
    customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));

    const result = await useCase.execute('cust-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.fullName).toBe('John Doe');
    expect(customerRepository.findById).toHaveBeenCalledWith('cust-1');
  });

  it('should fail when customer not found', async () => {
    customerRepository.findById.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer not found');
  });

  it('should propagate repository errors', async () => {
    customerRepository.findById.mockResolvedValue(Result.fail('DB error'));

    const result = await useCase.execute('cust-1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });
});

describe('GetCustomerByEmailUseCase', () => {
  let useCase: GetCustomerByEmailUseCase;
  let customerRepository: any;

  const mockCustomer = new Customer('cust-1', 'John Doe', 'john@example.com', '3001234567', new Date());

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    useCase = new GetCustomerByEmailUseCase(customerRepository);
  });

  it('should return a customer when found by email', async () => {
    customerRepository.findByEmail.mockResolvedValue(Result.ok(mockCustomer));

    const result = await useCase.execute('john@example.com');

    expect(result.isSuccess).toBe(true);
    expect(result.value.email).toBe('john@example.com');
    expect(customerRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
  });

  it('should fail when customer not found by email', async () => {
    customerRepository.findByEmail.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('missing@example.com');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer not found');
  });

  it('should propagate repository errors', async () => {
    customerRepository.findByEmail.mockResolvedValue(Result.fail('DB error'));

    const result = await useCase.execute('john@example.com');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });
});
