import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isObject = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null;

    const name =
      isObject(exception) && typeof exception['name'] === 'string'
        ? exception['name']
        : undefined;
    const message =
      isObject(exception) && typeof exception['message'] === 'string'
        ? exception['message']
        : undefined;
    const stack =
      isObject(exception) && typeof exception['stack'] === 'string'
        ? exception['stack']
        : undefined;

    const isPrismaInitError =
      name === 'PrismaClientInitializationError' ||
      (typeof message === 'string' &&
        message.includes('PrismaClientInitializationError'));

    if (isPrismaInitError) {
      this.logger.error(
        'Prisma initialization failed',
        stack ?? message ?? exception,
      );
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Prisma Initialization Error',
        message: message ?? 'Failed to initialize Prisma client',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json(res);
    }

    this.logger.error(
      'Unhandled exception',
      stack ?? message ?? String(exception),
    );
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
