import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIssuerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  did?: string;
}

