export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED',
  ERROR = 'ERROR',
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly stock: number,
    public readonly imageUrl: string,
    public readonly createdAt: Date,
  ) {}
}

export class Customer {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly createdAt: Date,
  ) {}
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly quantity: number,
    public readonly amount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public readonly total: number,
    public readonly status: TransactionStatus,
    public readonly wompiReference: string | null,
    public readonly paymentMethod: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class Delivery {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly customerId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly department: string,
    public readonly postalCode: string,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}
}
