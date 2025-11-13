import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('database.url'),
  autoLoadEntities: true,
  synchronize: configService.get<string>('nodeEnv') === 'development',
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: false,
  logging: configService.get<string>('nodeEnv') === 'development',
  logger: 'advanced-console',
});

