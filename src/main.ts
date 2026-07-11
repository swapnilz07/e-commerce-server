import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './common/logger/winston.logger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdInterceptor } from './common/config/request-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger()
  });

  const configService = app.get(ConfigService)
  const port = configService.get<number>('port') ?? 5000;
  const clientUrl = configService.get<string>('clientUrl');
  const logger = app.get(CustomLogger);

  // Security & Performance
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({ origin: clientUrl, credentials: true });

  // Global Pipes (Validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  // API Prefix 
  app.setGlobalPrefix('api/v1');

  // Swagger 
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('Production-grade e-commerce backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  // Start Server
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`📖 API Docs: http://localhost:${port}/api-docs`, 'Bootstrap');

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

}
bootstrap();