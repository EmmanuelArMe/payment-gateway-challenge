import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  if (url.includes('rds.amazonaws.com')) {
    const parsed = new URL(url);
    const pool = new pg.Pool({
      host: parsed.hostname,
      port: Number(parsed.port) || 5432,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

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
        description:
          'Premium noise-cancelling wireless headphones with 30-hour battery life, deep bass, and crystal-clear audio. Perfect for music lovers and remote workers.',
        price: 250000,
        currency: 'COP',
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Pro',
        description:
          'Advanced fitness tracker with heart rate monitor, GPS, sleep tracking, and 7-day battery. Water-resistant up to 50m with AMOLED display.',
        price: 450000,
        currency: 'COP',
        stock: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Portable Power Bank 20000mAh',
        description:
          'Ultra-slim high-capacity power bank with fast charging. Charges 3 devices simultaneously via USB-C and USB-A ports.',
        price: 85000,
        currency: 'COP',
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Gaming Keyboard',
        description:
          'RGB backlit mechanical keyboard with Cherry MX switches, programmable macro keys, and aircraft-grade aluminum frame.',
        price: 320000,
        currency: 'COP',
        stock: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Charging Pad',
        description:
          'Qi-certified fast wireless charger compatible with all Qi-enabled devices. Sleek minimalist design with LED indicator.',
        price: 65000,
        currency: 'COP',
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub Adapter 7-in-1',
        description:
          'Multi-port USB-C hub with HDMI 4K, 3x USB 3.0, SD/TF card reader, and PD charging. Compatible with laptops and tablets.',
        price: 120000,
        currency: 'COP',
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam 4K Ultra HD',
        description:
          '4K webcam with autofocus, dual noise-cancelling microphones, and automatic light correction. Perfect for video calls and streaming.',
        price: 280000,
        currency: 'COP',
        stock: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Mouse Wireless',
        description:
          'Wireless ergonomic mouse with 4000 DPI optical sensor, 6 programmable buttons, and vertical anti-fatigue design.',
        price: 95000,
        currency: 'COP',
        stock: 22,
        imageUrl:
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Monitor Stand Riser',
        description:
          'Bamboo monitor stand riser with built-in storage. Elevates your screen to eye level for improved posture and desk organization.',
        price: 75000,
        currency: 'COP',
        stock: 18,
        imageUrl:
          'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Noise Cancelling Earbuds',
        description:
          'True wireless earbuds with active noise cancellation, transparency mode, Bluetooth 5.3, and 8-hour battery life with charging case.',
        price: 180000,
        currency: 'COP',
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'LED Desk Lamp',
        description:
          'LED desk lamp with 5 color modes, 10 brightness levels, USB charging port, and flexible aluminum arm.',
        price: 110000,
        currency: 'COP',
        stock: 14,
        imageUrl:
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Backpack Pro',
        description:
          '15.6-inch laptop backpack with padded compartment, external USB port, water-resistant material, and anti-theft design.',
        price: 135000,
        currency: 'COP',
        stock: 16,
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Portable Bluetooth Speaker',
        description:
          'Portable Bluetooth speaker with 360° sound, IPX7 waterproof rating, 12-hour battery life, and built-in microphone for calls.',
        price: 160000,
        currency: 'COP',
        stock: 19,
        imageUrl:
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Numpad',
        description:
          'Wireless mechanical numpad with Gateron switches, RGB backlighting, and Bluetooth/USB-C connectivity. Perfect for accountants and data entry.',
        price: 95000,
        currency: 'COP',
        stock: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cable Management Kit',
        description:
          'Complete cable organizer kit with adhesive raceways, silicone clips, velcro straps, and under-desk tray. Includes 25 pieces.',
        price: 45000,
        currency: 'COP',
        stock: 35,
        imageUrl:
          'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB Microphone Condenser',
        description:
          'USB condenser microphone with cardioid pattern, mute button, gain control, and anti-vibration shock mount. Studio-quality audio.',
        price: 210000,
        currency: 'COP',
        stock: 9,
        imageUrl:
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gaming Mousepad XL',
        description:
          'Extended 900x400mm mousepad with non-slip rubber base, stitched edges, and micro-textured cloth surface for maximum precision.',
        price: 55000,
        currency: 'COP',
        stock: 28,
        imageUrl:
          'https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Surge Protector 8-Outlet',
        description:
          '8-outlet surge protector with 3 USB ports, 2m cable, and 2100-joule protection rating. LED status indicator for peace of mind.',
        price: 68000,
        currency: 'COP',
        stock: 24,
        imageUrl:
          'https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Cooling Pad',
        description:
          'Laptop cooling pad with 5 ultra-quiet fans, adjustable angle, blue LED lighting, and 2 extra USB ports.',
        price: 72000,
        currency: 'COP',
        stock: 17,
        imageUrl:
          'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart LED Light Strip 5m',
        description:
          '5-meter smart LED light strip with WiFi, Alexa & Google Home compatible. 16 million colors and music sync mode.',
        price: 88000,
        currency: 'COP',
        stock: 21,
        imageUrl:
          'https://images.unsplash.com/photo-1550985543-49bee3167284?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam Ring Light',
        description:
          '10-inch LED ring light with adjustable tripod, 3 lighting modes, 10 brightness levels, and phone holder. Ideal for streaming.',
        price: 62000,
        currency: 'COP',
        stock: 13,
        imageUrl:
          'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Classic Wooden Pencil',
        description:
          'Traditional HB graphite pencil with smooth cedar wood barrel and eraser tip. Great for writing, sketching, and everyday use.',
        price: 1000,
        currency: 'COP',
        stock: 100,
        imageUrl:
          'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600',
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);
  products.forEach((p) =>
    console.log(`  - ${p.name} (Stock: ${p.stock}, Price: $${p.price} COP)`),
  );

  console.log('Seeding completed!');
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
