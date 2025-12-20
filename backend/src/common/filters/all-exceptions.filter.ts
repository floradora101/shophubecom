import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | undefined;

    // 1) Normal Nest HttpExceptions (your custom exceptions + ValidationPipe)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse() as any;

      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const m = body.message;

        if (Array.isArray(m)) {
          errors = m;
          message = m[0] ?? 'Validation failed';
        } else if (typeof m === 'string') {
          message = m;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }

      return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(errors ? { errors } : {}),
        timestamp,
      });
    }

    // 2) Prisma known errors (unique, not found, FK, etc.)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, msg } = mapPrismaKnownError(exception);
      statusCode = status;
      message = msg;

      // Optional: log prisma errors (useful)
      this.logger.warn(
        `[Prisma ${exception.code}] ${req.method} ${req.url} -> ${statusCode} ${message}`,
      );

      return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        timestamp,
      });
    }

    // 3) Prisma validation errors (bad query shape / wrong types)
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid request data',
        timestamp,
      });
    }

    // 4) Prisma init/connection errors
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        `[DB INIT] ${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Database unavailable',
        timestamp,
      });
    }

    // 5) Unknown crash / bug
    this.logger.error(
      `[UNHANDLED] ${req.method} ${req.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message,
      timestamp,
    });
  }
}

function mapPrismaKnownError(e: Prisma.PrismaClientKnownRequestError): {
  status: number;
  msg: string;
} {
  // meta.target is often ["email"] or ["slug"] etc.
  const target = Array.isArray(e.meta?.target) ? e.meta?.target.join(',') : '';

  switch (e.code) {
    case 'P2002': {
      // Unique constraint
      if (target.includes('email'))
        return { status: 409, msg: 'Email is already in use' };
      if (target.includes('slug'))
        return { status: 409, msg: 'Slug already exists' };
      if (target.includes('sku'))
        return { status: 409, msg: 'SKU already exists' };
      return { status: 409, msg: 'Already exists' };
    }

    case 'P2025':
      return { status: 404, msg: 'Not found' };

    case 'P2003':
      return { status: 409, msg: 'Invalid reference (foreign key)' };

    case 'P2000':
      return { status: 400, msg: 'Invalid value length' };

    default:
      return { status: 500, msg: 'Database error' };
  }
}
