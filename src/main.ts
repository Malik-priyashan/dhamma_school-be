import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Tell Express to trust the proxy X-Forwarded-For headers
  app.set('trust proxy', 1);

  // Allow hosted frontends or rewrites that forward `/api/...` to this app.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url === '/api') {
      req.url = '/';
    } else if (req.url.startsWith('/api/')) {
      req.url = req.url.slice(4);
    } else if (req.url === '/login') {
      req.url = '/auth/login';
    }

    next();
  });

  app.use(cookieParser());

  // Reject browser writes from other origins, including direct backend access.
  const frontendOrigin = new URL(process.env.FRONTEND_URL || 'http://localhost:3001').origin;
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (/^\/(auth|me|marks|student|student-request|prefect|announcing|contact-us|notifications|users)(\/|\?|$)/.test(req.url)) {
      res.setHeader('Cache-Control', 'private, no-store');
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    const backendOrigin = `${req.protocol}://${req.get('host')}`;
    if (origin && origin !== frontendOrigin && origin !== backendOrigin) {
      return res.status(403).json({ message: 'Request origin is not allowed' });
    }
    if (!origin && req.headers['sec-fetch-site'] === 'cross-site') {
      return res.status(403).json({ message: 'Cross-site request is not allowed' });
    }
    next();
  });

  // Register global Prisma exception filter to provide clearer errors
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties not in the DTO
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  // Enable CORS for local and production frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
