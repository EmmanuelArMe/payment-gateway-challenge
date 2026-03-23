import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './infrastructure/modules/product.module.js';
import { TransactionModule } from './infrastructure/modules/transaction.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    TransactionModule,
  ],
})
export class AppModule {}
