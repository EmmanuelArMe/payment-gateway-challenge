import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @IsString()
  @IsNotEmpty()
  acceptanceToken!: string;

  @IsEmail()
  customerEmail!: string;
}
