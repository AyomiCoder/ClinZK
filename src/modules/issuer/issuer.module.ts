import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuerController } from './issuer.controller';
import { IssuerService } from './issuer.service';
import { Credential } from './entities/credential.entity';
import { Issuer } from './entities/issuer.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([Credential, Issuer]), AdminModule],
  controllers: [IssuerController],
  providers: [IssuerService],
  exports: [IssuerService],
})
export class IssuerModule {}

