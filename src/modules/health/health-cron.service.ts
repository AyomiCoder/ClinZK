import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HealthService } from './health.service';

@Injectable()
export class HealthCronService {
  private readonly logger = new Logger(HealthCronService.name);

  constructor(private readonly healthService: HealthService) {}

  @Cron('*/5 * * * *')
  handleHealthCheck() {
    this.logger.log('Running scheduled health check...');
    const result = this.healthService.check();
    this.logger.log(`Health check completed: ${result.status}`);
  }
}

