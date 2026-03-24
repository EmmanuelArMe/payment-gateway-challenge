import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import type { PaymentGatewayPort } from '../../domain/ports/outbound/payment-gateway.port.js';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port.js';

class TokenizeCardDto {
  @IsString()
  number!: string;

  @IsString()
  @Length(3, 4)
  cvc!: string;

  @IsString()
  expMonth!: string;

  @IsString()
  expYear!: string;

  @IsString()
  cardHolder!: string;
}

@Controller('api/payments')
export class PaymentController {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  @Get('acceptance-token')
  async getAcceptanceToken() {
    const result = await this.paymentGateway.getAcceptanceToken();
    return result.fold(
      (token) => ({ data: token }),
      (error) => {
        throw new HttpException(error, HttpStatus.BAD_GATEWAY);
      },
    );
  }

  @Post('tokenize')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async tokenizeCard(@Body() dto: TokenizeCardDto) {
    const result = await this.paymentGateway.tokenizeCard({
      number: dto.number,
      cvc: dto.cvc,
      expMonth: dto.expMonth,
      expYear: dto.expYear,
      cardHolder: dto.cardHolder,
    });
    return result.fold(
      (token) => ({ data: token }),
      (error) => {
        throw new HttpException(error, HttpStatus.BAD_GATEWAY);
      },
    );
  }
}
