import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTrialDto } from './create-trial.dto';

export class CreateTrialsBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrialDto)
  trials: CreateTrialDto[];
}

