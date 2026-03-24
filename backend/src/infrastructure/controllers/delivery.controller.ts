import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { GetDeliveryUseCase } from '../../application/use-cases/get-delivery.use-case.js';

@Controller('api/deliveries')
export class DeliveryController {
  constructor(
    private readonly getDeliveryUseCase: GetDeliveryUseCase,
  ) {}

  @Get('transaction/:transactionId')
  async findByTransaction(@Param('transactionId') transactionId: string) {
    const result = await this.getDeliveryUseCase.execute(transactionId);
    return result.fold(
      (delivery) => ({ data: delivery }),
      (error) => {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      },
    );
  }
}
