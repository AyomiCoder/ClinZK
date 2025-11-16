import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('nodeEnv');
  const isProduction = nodeEnv === 'production';

  return {
    type: 'postgres',
    url: configService.get<string>('database.url'),
    autoLoadEntities: true,
    synchronize: true, // Auto-sync schema changes (use with caution in production)
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: false, // We handle migrations manually via MigrationService
    logging: nodeEnv === 'development',
    logger: 'advanced-console',
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
};

