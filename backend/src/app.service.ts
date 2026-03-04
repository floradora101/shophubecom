import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Health check for load balancers and monitoring.
   * Verifies database connectivity.
   * Returns 503 Service Unavailable when database is unreachable.
   */
  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new HttpException(
        { status: 'degraded', database: 'disconnected' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
