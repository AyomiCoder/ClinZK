import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProofService } from './proof.service';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { GenerateProofDto } from './dto/generate-proof.dto';

@Controller('proof')
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @Get('schema')
  getSchema() {
    return this.proofService.getSchema();
  }

  @Post('verify-local')
  @HttpCode(HttpStatus.OK)
  verifyCredential(@Body() dto: VerifyCredentialDto) {
    return this.proofService.verifyCredential(dto.credentialHash);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateProof(@Body() dto: GenerateProofDto) {
    return this.proofService.generateProof(dto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  submitProof(@Body() dto: SubmitProofDto) {
    return this.proofService.submitProof(dto);
  }

  @Get('status/:proofHash')
  getProofStatus(@Param('proofHash') proofHash: string) {
    return this.proofService.getProofStatus(proofHash);
  }

  @Get('history/:credentialHash')
  getProofHistory(@Param('credentialHash') credentialHash: string) {
    return this.proofService.getProofHistory(credentialHash);
  }
}

