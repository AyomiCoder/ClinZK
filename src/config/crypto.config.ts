import { ConfigService } from '@nestjs/config';

export const getCryptoConfig = (configService: ConfigService) => ({
  privateKey: configService.get<string>('issuer.privateKey'),
  publicKey: configService.get<string>('issuer.publicKey'),
});

