import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import { Issuer } from './entities/issuer.entity';
import { IssueCredentialDto } from './dto/issue-credential.dto';
import { RevokeCredentialDto } from './dto/revoke-credential.dto';
import { CreateIssuerDto } from './dto/create-issuer.dto';
import { RetrieveCredentialsDto } from './dto/retrieve-credentials.dto';
import { signCredential, hashCredential } from './utils/signer.util';
import { calculateAge } from './utils/validator.util';
import { generateKeyPair } from './utils/key-generator.util';
import { CREDENTIAL_STATUS } from '../../common/constants';
import { CREDENTIAL_TYPES } from '../../common/constants';

@Injectable()
export class IssuerService {
  constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
    @InjectRepository(Issuer)
    private issuerRepository: Repository<Issuer>,
  ) {}

  async getMetadata(issuerId?: string) {
    if (issuerId) {
      const issuer = await this.issuerRepository.findOne({
        where: { id: issuerId, isActive: true },
      });
      if (!issuer) {
        throw new NotFoundException(`Issuer with ID ${issuerId} not found`);
      }

      return {
        issuerName: issuer.name,
        issuerDID: issuer.did,
        publicKey: issuer.publicKey,
        algorithm: 'Ed25519',
        credentialTypes: [
          'Name',
          CREDENTIAL_TYPES.AGE_RANGE_18_45,
          'Gender',
          'BloodGroup',
          'Genotype',
          'Condition',
        ],
      };
    } else {
      const issuers = await this.issuerRepository.find({
        where: { isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (issuers.length === 0) {
        throw new NotFoundException(
          'No active issuer found. Please register an issuer first using POST /issuer/register',
        );
      }

      return issuers.map((issuer) => ({
        issuerName: issuer.name,
        issuerDID: issuer.did,
        publicKey: issuer.publicKey,
        algorithm: 'Ed25519',
        credentialTypes: [
          'Name',
          CREDENTIAL_TYPES.AGE_RANGE_18_45,
          'Gender',
          'BloodGroup',
          'Genotype',
          'Condition',
        ],
      }));
    }
  }

  async createIssuer(dto: CreateIssuerDto) {
    const existingByName = await this.issuerRepository.findOne({
      where: { name: dto.name },
    });

    if (existingByName) {
      throw new BadRequestException('Issuer with this name already exists');
    }

    if (dto.did) {
      const existingByDid = await this.issuerRepository.findOne({
        where: { did: dto.did },
      });

      if (existingByDid) {
        throw new BadRequestException('Issuer with this DID already exists');
      }
    }

    let keyPair: { privateKey: string; publicKey: string };
    try {
      keyPair = await generateKeyPair();
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    const { privateKey, publicKey } = keyPair;

    if (!privateKey || privateKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(privateKey)) {
      throw new BadRequestException(
        `Invalid private key generated: length=${privateKey?.length || 0}, format invalid`,
      );
    }

    if (!publicKey || publicKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(publicKey)) {
      throw new BadRequestException(
        `Invalid public key generated: length=${publicKey?.length || 0}, format invalid`,
      );
    }

    const did = dto.did || `did:clinic:${Date.now()}`;

    const issuer = this.issuerRepository.create({
      name: dto.name,
      did,
      publicKey: publicKey.toLowerCase(),
      privateKey: privateKey.toLowerCase(),
      isActive: true,
    });

    await this.issuerRepository.save(issuer);

    return {
      id: issuer.id,
      name: issuer.name,
      did: issuer.did,
      publicKey: issuer.publicKey,
      isActive: issuer.isActive,
      createdAt: issuer.createdAt,
    };
  }

  async getAllIssuers() {
    const issuers = await this.issuerRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return issuers.map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
      did: issuer.did,
      publicKey: issuer.publicKey,
      isActive: issuer.isActive,
      createdAt: issuer.createdAt,
    }));
  }

  async getIssuerNames() {
    const issuers = await this.issuerRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return issuers.map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
    }));
  }

  async getIssuerById(id: string) {
    const issuer = await this.issuerRepository.findOne({
      where: { id },
    });

    if (!issuer) {
      throw new NotFoundException(`Issuer with ID ${id} not found`);
    }

    return {
      id: issuer.id,
      name: issuer.name,
      did: issuer.did,
      publicKey: issuer.publicKey,
      isActive: issuer.isActive,
      createdAt: issuer.createdAt,
      updatedAt: issuer.updatedAt,
    };
  }

  async issueCredential(dto: IssueCredentialDto) {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Name is required');
    }

    if (!dto.gender || dto.gender.trim() === '') {
      throw new BadRequestException('Gender is required');
    }

    if (!dto.bloodGroup || dto.bloodGroup.trim() === '') {
      throw new BadRequestException('Blood group is required');
    }

    if (!dto.genotype || dto.genotype.trim() === '') {
      throw new BadRequestException('Genotype is required');
    }

    if (!dto.conditions || dto.conditions.length === 0) {
      throw new BadRequestException('At least one condition is required');
    }

    let issuer: Issuer | null = null;

    if (dto.issuerId) {
      issuer = await this.issuerRepository.findOne({
        where: { id: dto.issuerId, isActive: true },
      });
      if (!issuer) {
        throw new NotFoundException(`Issuer with ID ${dto.issuerId} not found`);
      }
    } else {
      issuer = await this.issuerRepository.findOne({
        where: { isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (!issuer) {
        throw new BadRequestException(
          'No active issuer found. Please register an issuer first using POST /issuer/register',
        );
      }
    }

    const age = calculateAge(dto.dob);
    const issuedAt = new Date();
    const expiry = new Date(issuedAt);
    expiry.setMonth(expiry.getMonth() + 1);

    const credential = {
      issuer: issuer.did,
      claims: {
        name: dto.name,
        age: age,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        genotype: dto.genotype,
        conditions: dto.conditions,
      },
      issuedAt: issuedAt.toISOString(),
      expiry: expiry.toISOString(),
    };

    if (!issuer.privateKey || issuer.privateKey.trim() === '') {
      throw new BadRequestException(
        'Issuer private key is missing. Please delete and recreate the issuer to generate new keys.',
      );
    }

    const trimmedPrivateKey = issuer.privateKey.trim();
    
    if (trimmedPrivateKey.length !== 64) {
      throw new BadRequestException(
        `Invalid private key length: expected 64 hex characters, got ${trimmedPrivateKey.length}. Please delete and recreate the issuer.`,
      );
    }

    if (!/^[0-9a-fA-F]{64}$/.test(trimmedPrivateKey)) {
      throw new BadRequestException(
        `Invalid private key format: must be exactly 64 hexadecimal characters. Please delete and recreate the issuer.`,
      );
    }

    let signature: string;
    try {
      signature = await signCredential(credential, trimmedPrivateKey);
    } catch (error) {
      throw new BadRequestException(
        `Failed to sign credential: ${error instanceof Error ? error.message : 'Invalid private key format'}. The issuer's private key may be corrupted. Please delete and recreate the issuer.`,
      );
    }

    const credentialHash = hashCredential(credential);

    const credentialEntity = this.credentialRepository.create({
      credentialHash,
      credential,
      issuedAt,
      expiry,
      issuerDid: issuer.did,
      issuerId: issuer.id,
      patientNumber: dto.patientNumber,
      status: CREDENTIAL_STATUS.ACTIVE,
    });

    await this.credentialRepository.save(credentialEntity);

    return {
      credential,
      signature,
      credentialHash,
      issuerPublicKey: issuer.publicKey,
      issuerDID: issuer.did,
      credentialId: credentialEntity.id,
      issuerId: issuer.id,
      issuerName: issuer.name,
      patientNumber: dto.patientNumber,
    };
  }

  async getAllCredentials() {
    const credentials = await this.credentialRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (credentials.length === 0) {
      return [];
    }

    const issuerIds = [...new Set(credentials.map((c) => c.issuerId).filter(Boolean))];
    
    let issuerMap = new Map<string, string>();
    if (issuerIds.length > 0) {
      const issuers = await this.issuerRepository.find({
        where: issuerIds.map((id) => ({ id })),
      });
      issuerMap = new Map(issuers.map((issuer) => [issuer.id, issuer.name]));
    }

    return credentials.map((credential) => ({
      id: credential.id,
      credentialHash: credential.credentialHash,
      issuedAt: credential.issuedAt,
      expiry: credential.expiry,
      issuerDid: credential.issuerDid,
      issuerId: credential.issuerId,
      issuerName: issuerMap.get(credential.issuerId) || null,
      patientNumber: credential.patientNumber,
      status: credential.status,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    }));
  }

  async getCredentialsByIssuerAndPatientNumber(dto: RetrieveCredentialsDto) {
    const issuer = await this.issuerRepository.findOne({
      where: { name: dto.issuerName, isActive: true },
    });

    if (!issuer) {
      throw new NotFoundException(
        `Issuer with name "${dto.issuerName}" not found. Please check the issuer name and try again.`,
      );
    }

    const allCredentials = await this.credentialRepository.find({
      where: {
        issuerId: issuer.id,
        patientNumber: dto.patientNumber,
      },
      order: { createdAt: 'DESC' },
    });

    if (allCredentials.length === 0) {
      throw new NotFoundException(
        `Sorry, you are not a patient at ${issuer.name}. Please check your issuer name and patient number, or contact the clinic if you believe this is an error.`,
      );
    }

    const revokedCredentials = allCredentials.filter(
      (c) => c.status === CREDENTIAL_STATUS.REVOKED,
    );

    if (revokedCredentials.length > 0) {
      throw new BadRequestException(
        `Your credential has been revoked by ${issuer.name}. Please contact the clinic for more information.`,
      );
    }

    const credentials = allCredentials.filter(
      (c) => c.status === CREDENTIAL_STATUS.ACTIVE,
    );

    if (credentials.length === 0) {
      const expiredCredentials = allCredentials.filter(
        (c) => c.status === CREDENTIAL_STATUS.EXPIRED || c.expiry < new Date(),
      );

      if (expiredCredentials.length > 0) {
        throw new BadRequestException(
          `Your credential from ${issuer.name} has expired. Please contact the clinic to issue a new credential.`,
        );
      }

      throw new NotFoundException(
        `Sorry, you are not a patient at ${issuer.name}. Please check your issuer name and patient number, or contact the clinic if you believe this is an error.`,
      );
    }

    return credentials.map((credential) => ({
      id: credential.id,
      credentialHash: credential.credentialHash,
      credential: credential.credential || null,
      issuerDid: credential.issuerDid,
      issuerId: credential.issuerId,
      issuerName: issuer.name,
      issuedAt: credential.issuedAt,
      expiry: credential.expiry,
      status: credential.status,
      createdAt: credential.createdAt,
    }));
  }

  async getCredential(id: string) {
    const credential = await this.credentialRepository.findOne({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    return {
      id: credential.id,
      credentialHash: credential.credentialHash,
      issuedAt: credential.issuedAt,
      expiry: credential.expiry,
      issuerDid: credential.issuerDid,
      status: credential.status,
    };
  }

  async revokeCredential(dto: RevokeCredentialDto) {
    const credential = await this.credentialRepository.findOne({
      where: { id: dto.credentialId },
    });

    if (!credential) {
      throw new NotFoundException(
        `Credential with ID ${dto.credentialId} not found`,
      );
    }

    if (credential.status === CREDENTIAL_STATUS.REVOKED) {
      throw new BadRequestException('Credential is already revoked');
    }

    credential.status = CREDENTIAL_STATUS.REVOKED;
    await this.credentialRepository.save(credential);

    return {
      message: 'Credential revoked successfully',
      credentialId: credential.id,
      status: credential.status,
    };
  }
}

