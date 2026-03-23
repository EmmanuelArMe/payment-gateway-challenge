import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.delivery.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // Seed products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life, deep bass, and crystal-clear audio. Perfect for music lovers and remote workers.',
        price: 250000,
        currency: 'COP',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracker with heart rate monitor, GPS, sleep tracking, and 7-day battery. Water-resistant up to 50m with AMOLED display.',
        price: 450000,
        currency: 'COP',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Portable Power Bank 20000mAh',
        description: 'Ultra-slim high-capacity power bank with fast charging. Charges 3 devices simultaneously via USB-C and USB-A ports.',
        price: 85000,
        currency: 'COP',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches, programmable macro keys, and aircraft-grade aluminum frame.',
        price: 320000,
        currency: 'COP',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d1b2d2b1?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Charging Pad',
        description: 'Qi-certified fast wireless charger compatible with all Qi-enabled devices. Sleek minimalist design with LED indicator.',
        price: 65000,
        currency: 'COP',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub Adapter 7-in-1',
        description: 'Multi-port USB-C hub with HDMI 4K, 3x USB 3.0, SD/TF card reader, and PD charging. Compatible with laptops and tablets.',
        price: 120000,
        currency: 'COP',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);
  products.forEach((p) => console.log(`  - ${p.name} (Stock: ${p.stock}, Price: $${p.price} COP)`));

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
