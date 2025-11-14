import { IsString, IsNotEmpty } from 'class-validator';

export class RetrieveCredentialsDto {
  @IsString()
  @IsNotEmpty()
  issuerName: string;

  @IsString()
  @IsNotEmpty()
  patientNumber: string;
}

