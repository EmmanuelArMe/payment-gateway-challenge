import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  GetProductsUseCase,
  GetProductByIdUseCase,
} from '../../application/use-cases/get-products.use-case.js';

@Controller('api/products')
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  async findAll() {
    const result = await this.getProductsUseCase.execute();
    return result.fold(
      (products) => ({ data: products }),
      (error) => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.getProductByIdUseCase.execute(id);
    return result.fold(
      (product) => ({ data: product }),
      (error) => {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      },
    );
  }
}
