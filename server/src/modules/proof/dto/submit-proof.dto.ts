import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitProofDto {
  @IsString()
  @IsNotEmpty()
  credentialHash: string;

  @IsString()
  @IsNotEmpty()
  proofHash: string;

  @IsString()
  @IsNotEmpty()
  nullifier: string;

  @IsString()
  @IsNotEmpty()
  issuerDID: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

