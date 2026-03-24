import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { GetCustomerUseCase, GetCustomerByEmailUseCase } from '../../application/use-cases/get-customer.use-case.js';

@Controller('api/customers')
export class CustomerController {
  constructor(
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly getCustomerByEmailUseCase: GetCustomerByEmailUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.getCustomerUseCase.execute(id);
    return result.fold(
      (customer) => ({ data: customer }),
      (error) => {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      },
    );
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const result = await this.getCustomerByEmailUseCase.execute(email);
    return result.fold(
      (customer) => ({ data: customer }),
      (error) => {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      },
    );
  }
}
