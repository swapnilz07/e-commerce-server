import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './common/config/configuration';
import { validationSchema } from './common/config/validation.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    // Environment Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    // Rate Limiting 
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: 60,      // Time window in seconds
        limit: 100,   // Max requests per ttl
        ignoreUserAgents: [/googlebot/i, /bingbot/i], // ignore bots
        throttlers: [],
        skipIf: () => false,
        getTracker: () => '',
        setHeaders: true,
      }),
    }),

    // Cron Jobs 
    ScheduleModule.forRoot(),

    // BullMQ Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
    }),

    HealthModule, CommonModule, PrismaModule, AuthModule, UserModule, ProductModule, CategoryModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


