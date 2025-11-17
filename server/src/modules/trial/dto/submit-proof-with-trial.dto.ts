import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class SubmitProofWithTrialDto {
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

  @IsUUID()
  @IsNotEmpty()
  trialId: string;
}

