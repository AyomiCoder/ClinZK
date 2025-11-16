import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthCronService } from './health-cron.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthCronService],
  exports: [HealthService],
})
export class HealthModule {}

