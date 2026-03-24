import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL')!;
    const adapter = PrismaService.createAdapter(url);
    super({ adapter });
  }

  private static createAdapter(url: string): PrismaPg {
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
      return new PrismaPg(pool);
    }
    return new PrismaPg({ connectionString: url });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
