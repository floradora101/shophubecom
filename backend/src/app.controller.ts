import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint for load balancers and monitoring.
   * GET /api/health - returns { status, database }
   */
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
