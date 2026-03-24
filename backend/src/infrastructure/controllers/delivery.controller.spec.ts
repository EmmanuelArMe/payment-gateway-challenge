import { HttpException, HttpStatus } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { Result } from '../../shared/result';
import { Delivery } from '../../domain/entities/index';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let getDeliveryUseCase: { execute: jest.Mock };

  const delivery = new Delivery(
    'del-1', 'tx-1', 'cust-1', 'Calle 123', 'Bogotá', 'Cundinamarca', '110111', 'PENDING', new Date(),
  );

  beforeEach(() => {
    getDeliveryUseCase = { execute: jest.fn() };
    controller = new DeliveryController(getDeliveryUseCase as never);
  });

  it('returns a delivery by transaction id', async () => {
    getDeliveryUseCase.execute.mockResolvedValue(Result.ok(delivery));

    await expect(controller.findByTransaction('tx-1')).resolves.toEqual({ data: delivery });
    expect(getDeliveryUseCase.execute).toHaveBeenCalledWith('tx-1');
  });

  it('throws not found when delivery lookup fails', async () => {
    getDeliveryUseCase.execute.mockResolvedValue(Result.fail('Delivery not found'));

    await expect(controller.findByTransaction('missing')).rejects.toMatchObject<HttpException>({
      message: 'Delivery not found',
      status: HttpStatus.NOT_FOUND,
    });
  });
});
