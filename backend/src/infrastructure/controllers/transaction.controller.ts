import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case.js';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case.js';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto.js';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto.js';

@Controller('api/transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateTransactionDto) {
    const result = await this.createTransactionUseCase.execute(dto);
    return result.fold(
      (transaction) => ({ data: transaction }),
      (error) => {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      },
    );
  }

  @Post(':id/pay')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async processPayment(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    const result = await this.processPaymentUseCase.execute({
      transactionId: id,
      cardToken: dto.cardToken,
      acceptanceToken: dto.acceptanceToken,
      customerEmail: dto.customerEmail,
    });
    return result.fold(
      (transaction) => ({ data: transaction }),
      (error) => {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // This will be implemented with a GetTransactionUseCase
    return { data: { id, message: 'TODO: implement' } };
  }
}
