import {
  IsString,
  IsDateString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class IssueCredentialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsDateString()
  dob: string;

  @IsString()
  @IsIn(['Male', 'Female', 'Other'])
  gender: string;

  @IsString()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup: string;

  @IsString()
  @IsIn(['AA', 'AS', 'SS', 'AC', 'SC', 'CC'])
  genotype: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayMinSize(1, { message: 'At least one condition is required' })
  conditions: string[];

  @IsString()
  @IsNotEmpty()
  issuerName: string;

  @IsString()
  @IsNotEmpty()
  issuerLoginId: string;

  @IsString()
  @IsNotEmpty()
  patientNumber: string;
}
