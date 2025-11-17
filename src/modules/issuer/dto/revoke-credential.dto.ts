import { IsString } from 'class-validator';

export class RevokeCredentialDto {
  @IsString()
  credentialId: string;
}

