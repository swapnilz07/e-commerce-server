import { Global, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {

        if (!process.env.DATABASE_URL) {
            throw new Error('❌ DATABASE_URL is not defined in environment variables!');
        }

        // Create a PostgreSQL connection pool
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
        });

        // Create the Prisma adapter using the pool
        const adapter = new PrismaPg(pool);

        // Pass the adapter to PrismaClient constructor
        super({
            adapter,
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('✅ PostgreSQL connected successfully via Prisma!');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('🔌 PostgreSQL connection closed.');
    }
}
