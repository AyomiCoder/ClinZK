import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
const nodeEnv = configService.get<string>('NODE_ENV');
const isProduction = nodeEnv === 'production';

export default new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

