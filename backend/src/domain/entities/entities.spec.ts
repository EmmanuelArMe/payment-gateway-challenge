import { Product, Customer, Transaction, Delivery, TransactionStatus } from './index';

describe('Domain Entities', () => {
  describe('Product', () => {
    it('should create a product with all properties', () => {
      const now = new Date();
      const product = new Product('id-1', 'Test Product', 'Description', 50000, 'COP', 10, 'https://img.example.com/test.jpg', now);
      expect(product.id).toBe('id-1');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Description');
      expect(product.price).toBe(50000);
      expect(product.currency).toBe('COP');
      expect(product.stock).toBe(10);
      expect(product.imageUrl).toBe('https://img.example.com/test.jpg');
      expect(product.createdAt).toBe(now);
    });

    it('should have readonly properties', () => {
      const product = new Product('id', 'n', 'd', 100, 'COP', 5, 'https://img.example.com/test.jpg', new Date());
      expect(product).toBeInstanceOf(Product);
    });
  });

  describe('Customer', () => {
    it('should create a customer with all properties', () => {
      const now = new Date();
      const customer = new Customer('id-1', 'John Doe', 'john@example.com', '3001234567', now);
      expect(customer.id).toBe('id-1');
      expect(customer.fullName).toBe('John Doe');
      expect(customer.email).toBe('john@example.com');
      expect(customer.phone).toBe('3001234567');
      expect(customer.createdAt).toBe(now);
    });
  });

  describe('Transaction', () => {
    it('should create a transaction with all properties', () => {
      const now = new Date();
      const tx = new Transaction(
        'tx-1', 'prod-1', 'cust-1', 2, 100000, 5000, 10000, 115000,
        TransactionStatus.PENDING, null, 'CARD', now, now,
      );
      expect(tx.id).toBe('tx-1');
      expect(tx.productId).toBe('prod-1');
      expect(tx.customerId).toBe('cust-1');
      expect(tx.quantity).toBe(2);
      expect(tx.amount).toBe(100000);
      expect(tx.baseFee).toBe(5000);
      expect(tx.deliveryFee).toBe(10000);
      expect(tx.total).toBe(115000);
      expect(tx.status).toBe(TransactionStatus.PENDING);
      expect(tx.wompiReference).toBeNull();
      expect(tx.paymentMethod).toBe('CARD');
    });

    it('should include wompiReference when provided', () => {
      const tx = new Transaction(
        'tx-1', 'prod-1', 'cust-1', 1, 50000, 5000, 10000, 65000,
        TransactionStatus.APPROVED, 'wompi-ref-123', 'CARD', new Date(), new Date(),
      );
      expect(tx.wompiReference).toBe('wompi-ref-123');
      expect(tx.status).toBe(TransactionStatus.APPROVED);
    });
  });

  describe('Delivery', () => {
    it('should create a delivery with all properties', () => {
      const now = new Date();
      const delivery = new Delivery(
        'del-1', 'tx-1', 'cust-1', 'Calle 123', 'Bogotá', 'Cundinamarca', '110111', 'PENDING', now,
      );
      expect(delivery.id).toBe('del-1');
      expect(delivery.transactionId).toBe('tx-1');
      expect(delivery.customerId).toBe('cust-1');
      expect(delivery.address).toBe('Calle 123');
      expect(delivery.city).toBe('Bogotá');
      expect(delivery.department).toBe('Cundinamarca');
      expect(delivery.postalCode).toBe('110111');
      expect(delivery.status).toBe('PENDING');
      expect(delivery.createdAt).toBe(now);
    });
  });

  describe('TransactionStatus', () => {
    it('should have all expected values', () => {
      expect(TransactionStatus.PENDING).toBe('PENDING');
      expect(TransactionStatus.APPROVED).toBe('APPROVED');
      expect(TransactionStatus.DECLINED).toBe('DECLINED');
      expect(TransactionStatus.VOIDED).toBe('VOIDED');
      expect(TransactionStatus.ERROR).toBe('ERROR');
    });
  });
});
