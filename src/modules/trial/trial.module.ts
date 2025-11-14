import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';
import { Trial } from './entities/trial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trial])],
  controllers: [TrialController],
  providers: [TrialService],
  exports: [TrialService],
})
export class TrialModule {}

