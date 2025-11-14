import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from './config/env.config';
import { getDatabaseConfig } from './config/db.config';
import { HealthModule } from './modules/health/health.module';
import { IssuerModule } from './modules/issuer/issuer.module';
import { ProofModule } from './modules/proof/proof.module';
import { TrialModule } from './modules/trial/trial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    HealthModule,
    IssuerModule,
    ProofModule,
    TrialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
