import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Tell Express to trust the proxy X-Forwarded-For headers
  app.set('trust proxy', 1);

  app.use(cookieParser());

  // Register global Prisma exception filter to provide clearer errors
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties not in the DTO
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  // Enable CORS for local frontend during development
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
