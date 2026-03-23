import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './infrastructure/modules/product.module.js';
import { TransactionModule } from './infrastructure/modules/transaction.module.js';
import { CustomerModule } from './infrastructure/modules/customer.module.js';
import { DeliveryModule } from './infrastructure/modules/delivery.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
})
export class AppModule {}
