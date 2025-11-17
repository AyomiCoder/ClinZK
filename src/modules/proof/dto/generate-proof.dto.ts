import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class GenerateProofDto {
  @IsString()
  @IsNotEmpty()
  credentialHash: string;

  @IsString()
  @IsNotEmpty()
  issuerDID: string;

  @IsObject()
  @IsOptional()
  credential?: {
    issuer: string;
    claims: {
      name: string;
      age: number;
      gender: string;
      bloodGroup: string;
      genotype: string;
      conditions: string[];
    };
    issuedAt: string;
    expiry: string;
  };
}

