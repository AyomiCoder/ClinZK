import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  check() {
    const result = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    
    this.logger.log(`Health check: ${result.status} at ${result.timestamp}`);
    return result;
  }
}

