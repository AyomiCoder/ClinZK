import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { IssuerService } from './issuer.service';
import { IssueCredentialDto } from './dto/issue-credential.dto';
import { RevokeCredentialDto } from './dto/revoke-credential.dto';
import { CreateIssuerDto } from './dto/create-issuer.dto';
import { RetrieveCredentialsDto } from './dto/retrieve-credentials.dto';
import { VerifyLoginDto } from './dto/verify-login.dto';
import { AdminAccess } from '../admin/decorators/admin.decorator';

@Controller('issuer')
export class IssuerController {
  constructor(private readonly issuerService: IssuerService) {}

  @Get('metadata')
  @AdminAccess()
  getMetadata(@Query('issuerId') issuerId?: string) {
    return this.issuerService.getMetadata(issuerId);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @AdminAccess()
  async createIssuer(@Body() dto: CreateIssuerDto) {
    return this.issuerService.createIssuer(dto);
  }

  @Get('list')
  @AdminAccess()
  getAllIssuers() {
    return this.issuerService.getAllIssuers();
  }

  @Get('names')
  getIssuerNames() {
    return this.issuerService.getIssuerNames();
  }

  @Post('verify-login')
  @HttpCode(HttpStatus.OK)
  async verifyLoginId(@Body() dto: VerifyLoginDto) {
    return this.issuerService.verifyLoginId(dto.issuerName, dto.issuerLoginId);
  }

  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  async issueCredential(@Body() dto: IssueCredentialDto) {
    return this.issuerService.issueCredential(dto);
  }

  @Get('credentials')
  getAllCredentials(@Query('issuerName') issuerName?: string) {
    return this.issuerService.getAllCredentials(issuerName);
  }

  @Post('credentials/retrieve')
  getCredentialsByIssuerAndPatientNumber(@Body() dto: RetrieveCredentialsDto) {
    return this.issuerService.getCredentialsByIssuerAndPatientNumber(dto);
  }

  @Get('credentials/:id')
  getCredential(@Param('id') id: string) {
    return this.issuerService.getCredential(id);
  }

  @Get(':id')
  @AdminAccess()
  getIssuerById(@Param('id') id: string) {
    return this.issuerService.getIssuerById(id);
  }

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  revokeCredential(@Body() dto: RevokeCredentialDto) {
    return this.issuerService.revokeCredential(dto);
  }
}

