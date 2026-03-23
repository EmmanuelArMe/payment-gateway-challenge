import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductController } from './product.controller';
import { Result } from '../../shared/result';
import { Product } from '../../domain/entities/index';

describe('ProductController', () => {
  let controller: ProductController;
  let getProductsUseCase: { execute: jest.Mock };
  let getProductByIdUseCase: { execute: jest.Mock };

  const product = new Product('prod-1', 'Headphones', 'Desc', 250000, 'COP', 10, 'img', new Date());

  beforeEach(() => {
    getProductsUseCase = { execute: jest.fn() };
    getProductByIdUseCase = { execute: jest.fn() };
    controller = new ProductController(
      getProductsUseCase as never,
      getProductByIdUseCase as never,
    );
  });

  it('returns product list', async () => {
    getProductsUseCase.execute.mockResolvedValue(Result.ok([product]));

    await expect(controller.findAll()).resolves.toEqual({ data: [product] });
  });

  it('throws internal server error when listing fails', async () => {
    getProductsUseCase.execute.mockResolvedValue(Result.fail('failed to fetch'));

    await expect(controller.findAll()).rejects.toMatchObject<HttpException>({
      message: 'failed to fetch',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('returns a product by id', async () => {
    getProductByIdUseCase.execute.mockResolvedValue(Result.ok(product));

    await expect(controller.findOne('prod-1')).resolves.toEqual({ data: product });
  });

  it('throws not found when product lookup fails', async () => {
    getProductByIdUseCase.execute.mockResolvedValue(Result.fail('Product not found'));

    await expect(controller.findOne('missing')).rejects.toMatchObject<HttpException>({
      message: 'Product not found',
      status: HttpStatus.NOT_FOUND,
    });
  });
});