import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.runMigrations();
  }

  async runMigrations() {
    try {
      this.logger.log('🔄 Running database migrations...');
      
      // Ensure DataSource is initialized
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const migrations = await this.dataSource.runMigrations({
        transaction: 'all',
      });

      if (migrations.length === 0) {
        this.logger.log('✅ Database is up to date. No migrations to run.');
      } else {
        this.logger.log(
          `✅ Successfully ran ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`   - ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

