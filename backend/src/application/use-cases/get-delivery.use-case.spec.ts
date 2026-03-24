import { GetDeliveryUseCase } from './get-delivery.use-case';
import { Result } from '../../shared/result';
import { Delivery } from '../../domain/entities/index';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/index';

describe('GetDeliveryUseCase', () => {
  let useCase: GetDeliveryUseCase;
  let deliveryRepository: jest.Mocked<DeliveryRepositoryPort>;

  const mockDelivery = new Delivery(
    'del-1',
    'tx-1',
    'cust-1',
    'Calle 123',
    'Bogotá',
    'Cundinamarca',
    '110111',
    'PENDING',
    new Date(),
  );

  beforeEach(() => {
    deliveryRepository = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };
    useCase = new GetDeliveryUseCase(deliveryRepository);
  });

  it('should return a delivery when found', async () => {
    deliveryRepository.findByTransactionId.mockResolvedValue(
      Result.ok(mockDelivery),
    );

    const result = await useCase.execute('tx-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.address).toBe('Calle 123');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(deliveryRepository.findByTransactionId).toHaveBeenCalledWith('tx-1');
  });

  it('should fail when delivery not found', async () => {
    deliveryRepository.findByTransactionId.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute('missing-tx');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Delivery not found');
  });

  it('should propagate repository errors', async () => {
    deliveryRepository.findByTransactionId.mockResolvedValue(
      Result.fail('DB error'),
    );

    const result = await useCase.execute('tx-1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('DB error');
  });
});
