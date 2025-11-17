import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProofController } from './proof.controller';
import { ProofService } from './proof.service';
import { Proof } from './entities/proof.entity';
import { Credential } from '../issuer/entities/credential.entity';
import { Issuer } from '../issuer/entities/issuer.entity';
import { Trial } from '../trial/entities/trial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proof, Credential, Issuer, Trial])],
  controllers: [ProofController],
  providers: [ProofService],
  exports: [ProofService],
})
export class ProofModule {}

