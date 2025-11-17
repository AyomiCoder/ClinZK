import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrialRequirementsDto {
  @IsNumber()
  @IsOptional()
  minAge?: number;

  @IsNumber()
  @IsOptional()
  maxAge?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genders?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bloodGroups?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genotypes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conditions?: string[];
}

export class CreateTrialDto {
  @IsString()
  @IsNotEmpty()
  codeName: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TrialRequirementsDto)
  requirements: TrialRequirementsDto;
}

