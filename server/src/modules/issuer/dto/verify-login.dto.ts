import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyLoginDto {
  @IsString()
  @IsNotEmpty()
  issuerName: string;

  @IsString()
  @IsNotEmpty()
  issuerLoginId: string;
}

