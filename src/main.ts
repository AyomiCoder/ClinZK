import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

async function validateEnv(configService: ConfigService): Promise<void> {
  const logger = new Logger('Environment');
  const requiredVars = [
    'DATABASE_URL',
  ];

  const missing: string[] = [];
  const available: string[] = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      available.push(varName);
    }
  });

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  logger.log('✅ All required environment variables are available');
  available.forEach((varName) => {
    const value = process.env[varName];
    const displayValue =
      varName.includes('KEY') || varName.includes('PASSWORD')
        ? `${value?.substring(0, 8)}...`
        : value;
    logger.log(`  ✓ ${varName}: ${displayValue}`);
  });
}

async function checkDatabaseConnection(
  configService: ConfigService,
): Promise<void> {
  const logger = new Logger('Database');
  const dbUrl = configService.get<string>('database.url');
  const nodeEnv = configService.get<string>('nodeEnv');
  const isProduction = nodeEnv === 'production';

  if (!dbUrl) {
    logger.error('DATABASE_URL is not set');
    throw new Error('DATABASE_URL is not set');
  }

  try {
    const dataSource = new DataSource({
      type: 'postgres',
      url: dbUrl,
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false,
    });

    await dataSource.initialize();
    logger.log('✅ Database connection established successfully');
    logger.log(`  ✓ Connected to: ${dbUrl.split('@')[1] || 'database'}`);
    await dataSource.destroy();
  } catch (error) {
    logger.error('❌ Failed to connect to database');
    logger.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  logger.log('🔍 Validating environment variables...');
  await validateEnv(configService);

  logger.log('🔍 Checking database connection...');
  await checkDatabaseConnection(configService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = configService.get<number>('port') || 4000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
