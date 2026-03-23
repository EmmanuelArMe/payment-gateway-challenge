import { IsString, IsEmail, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @IsString()
  @IsNotEmpty()
  deliveryCity!: string;

  @IsString()
  @IsNotEmpty()
  deliveryDepartment!: string;

  @IsString()
  @IsOptional()
  deliveryPostalCode!: string;
}
