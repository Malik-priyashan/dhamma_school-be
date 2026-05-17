import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || typeof dbUrl !== 'string') {
      throw new Error(
        'DATABASE_URL is not set or not a string. Check your .env file.',
      );
    }

    // Ensure Pool gets a string connection string
    const pool = new Pool({
      connectionString: String(dbUrl),
    });

    const adapter = new PrismaPg(pool);

    // Enable Prisma query logging so SQL is printed to the console
    // Prisma constructor types are strict when using a custom adapter; this
    // line intentionally passes a runtime-built options object.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super({ adapter, log: ['query', 'info', 'warn', 'error'] } as any);

    interface PrismaQueryEvent {
      query: string;
      params: string;
      duration: number;
    }

    const prismaWithEvents = this as unknown as {
      $on(event: 'query', callback: (event: PrismaQueryEvent) => void): void;
      $on(
        event: 'info' | 'warn' | 'error',
        callback: (event: unknown) => void,
      ): void;
    };

    // Log queries using Nest's logger for consistent output in VS Code terminal
    prismaWithEvents.$on('query', (e) => {
      this.logger.debug(
        `Prisma query: ${e.query} -- params: ${e.params} -- duration: ${e.duration}ms`,
      );
    });

    prismaWithEvents.$on('info', (e) =>
      this.logger.log(`Prisma info: ${JSON.stringify(e)}`),
    );
    prismaWithEvents.$on('warn', (e) =>
      this.logger.warn(`Prisma warn: ${JSON.stringify(e)}`),
    );
    prismaWithEvents.$on('error', (e) =>
      this.logger.error(`Prisma error: ${JSON.stringify(e)}`),
    );

    this.logger.log('PrismaService initialized');
  }

  async onModuleInit() {
    await this.$connect();
  }
}
