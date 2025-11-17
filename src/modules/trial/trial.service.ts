import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trial } from './entities/trial.entity';
import { CreateTrialDto } from './dto/create-trial.dto';
import { CreateTrialsBulkDto } from './dto/create-trials-bulk.dto';

@Injectable()
export class TrialService {
  constructor(
    @InjectRepository(Trial)
    private trialRepository: Repository<Trial>,
  ) {}

  async createTrial(dto: CreateTrialDto) {
    const existing = await this.trialRepository.findOne({
      where: { codeName: dto.codeName },
    });

    if (existing) {
      throw new BadRequestException(
        `Trial with code name ${dto.codeName} already exists`,
      );
    }

    const trial = this.trialRepository.create({
      codeName: dto.codeName,
      displayName: dto.displayName,
      requirements: dto.requirements,
      isActive: true,
    });

    await this.trialRepository.save(trial);

    return {
      id: trial.id,
      codeName: trial.codeName,
      displayName: trial.displayName,
      requirements: trial.requirements,
      isActive: trial.isActive,
      createdAt: trial.createdAt,
    };
  }

  async createTrialsBulk(dto: CreateTrialsBulkDto) {
    const results: Array<{ id: string; codeName: string; displayName: string }> = [];
    const errors: Array<{ codeName: string; error: string }> = [];

    for (const trialDto of dto.trials) {
      try {
        const existing = await this.trialRepository.findOne({
          where: { codeName: trialDto.codeName },
        });

        if (existing) {
          errors.push({
            codeName: trialDto.codeName,
            error: 'Trial with this code name already exists',
          });
          continue;
        }

        const trial = this.trialRepository.create({
          codeName: trialDto.codeName,
          displayName: trialDto.displayName,
          requirements: trialDto.requirements,
          isActive: true,
        });

        await this.trialRepository.save(trial);

        results.push({
          id: trial.id,
          codeName: trial.codeName,
          displayName: trial.displayName,
        });
      } catch (error) {
        errors.push({
          codeName: trialDto.codeName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      created: results,
      errors: errors,
      summary: {
        total: dto.trials.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  async getAllTrials() {
    const trials = await this.trialRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });

    return trials.map((trial) => ({
      id: trial.id,
      codeName: trial.codeName,
      displayName: trial.displayName,
      requirements: trial.requirements,
      createdAt: trial.createdAt,
    }));
  }

  async getTrialById(id: string) {
    const trial = await this.trialRepository.findOne({
      where: { id },
    });

    if (!trial) {
      throw new NotFoundException(`Trial with ID ${id} not found`);
    }

    return {
      id: trial.id,
      codeName: trial.codeName,
      displayName: trial.displayName,
      requirements: trial.requirements,
      isActive: trial.isActive,
      createdAt: trial.createdAt,
      updatedAt: trial.updatedAt,
    };
  }

  async getTrialNames() {
    const trials = await this.trialRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });

    return trials.map((trial) => ({
      id: trial.id,
      codeName: trial.codeName,
      displayName: trial.displayName,
    }));
  }
}

