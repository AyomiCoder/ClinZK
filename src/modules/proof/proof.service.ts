import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proof } from './entities/proof.entity';
import { Credential } from '../issuer/entities/credential.entity';
import { Issuer } from '../issuer/entities/issuer.entity';
import { Trial } from '../trial/entities/trial.entity';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { GenerateProofDto } from './dto/generate-proof.dto';
import { mockVerifyProof } from './verifier-mock';
import { generateProofFromCredential } from './utils/proof-generator.util';
import { validateTrialEligibility } from '../issuer/utils/validator.util';
import { PROOF_STATUS } from '../../common/constants';
import { CREDENTIAL_STATUS } from '../../common/constants';

@Injectable()
export class ProofService {
  constructor(
    @InjectRepository(Proof)
    private proofRepository: Repository<Proof>,
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
    @InjectRepository(Issuer)
    private issuerRepository: Repository<Issuer>,
    @InjectRepository(Trial)
    private trialRepository: Repository<Trial>,
  ) {}

  getSchema() {
    return {
      requiredClaims: [
        'name',
        'age',
        'gender',
        'bloodGroup',
        'genotype',
        'conditions',
      ],
      constraints: {
        age: 'any',
        conditions: 'at least one required',
      },
      signatureAlgorithm: 'Ed25519',
    };
  }

  async submitProof(dto: SubmitProofDto) {
    const credentialEntity = await this.credentialRepository.findOne({
      where: { credentialHash: dto.credentialHash },
    });

    if (!credentialEntity) {
      throw new NotFoundException(
        `Credential with hash ${dto.credentialHash} not found`,
      );
    }

    if (credentialEntity.status !== CREDENTIAL_STATUS.ACTIVE) {
      throw new BadRequestException(
        `Credential is ${credentialEntity.status}. Only active credentials can be used to generate proofs.`,
      );
    }

    const now = new Date();
    if (credentialEntity.expiry < now) {
      const proofEntity = this.proofRepository.create({
        proofHash: dto.proofHash,
        nullifier: dto.nullifier,
        issuerDid: dto.issuerDID,
        credentialHash: dto.credentialHash,
        status: PROOF_STATUS.EXPIRED,
      });

      await this.proofRepository.save(proofEntity);

      throw new BadRequestException('Credential has expired');
    }

    const lastProof = await this.proofRepository.findOne({
      where: { credentialHash: dto.credentialHash },
      order: { createdAt: 'DESC' },
    });

    if (lastProof) {
      const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
      if (lastProof.createdAt > sixWeeksAgo) {
        const daysRemaining = Math.ceil(
          (lastProof.createdAt.getTime() + 42 * 24 * 60 * 60 * 1000 - now.getTime()) /
            (24 * 60 * 60 * 1000),
        );
        throw new BadRequestException(
          `You cannot submit another proof yet. Clinical trials don't happen often. Please wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''} before submitting again. The 6-week cooldown period applies whether you were eligible or not.`,
        );
      }
    }

    if (credentialEntity.issuerDid !== dto.issuerDID) {
      throw new BadRequestException(
        'Issuer DID in proof does not match the credential issuer',
      );
    }

    if (!credentialEntity.credential) {
      throw new BadRequestException(
        'Credential object is missing. Cannot validate against trial requirements.',
      );
    }

    const allTrials = await this.trialRepository.find({
      where: { isActive: true },
    });

    if (allTrials.length === 0) {
      throw new BadRequestException(
        'No active trials available. Please contact the administrator.',
      );
    }

    const eligibleTrials: Array<{ id: string; codeName: string; displayName: string }> = [];
    const ineligibleReasons: Array<{ trialId: string; trialName: string; reason: string }> = [];

    for (const trial of allTrials) {
      const eligibility = validateTrialEligibility(
        credentialEntity.credential.claims.age,
        credentialEntity.credential.claims.gender,
        credentialEntity.credential.claims.bloodGroup,
        credentialEntity.credential.claims.genotype,
        credentialEntity.credential.claims.conditions,
        trial.requirements,
      );

      if (eligibility.isValid) {
        eligibleTrials.push({
          id: trial.id,
          codeName: trial.codeName,
          displayName: trial.displayName,
        });
      } else {
        ineligibleReasons.push({
          trialId: trial.id,
          trialName: trial.displayName,
          reason: eligibility.reason || 'Not eligible',
        });
      }
    }

    if (eligibleTrials.length === 0) {
      const proofEntity = this.proofRepository.create({
        proofHash: dto.proofHash,
        nullifier: dto.nullifier,
        issuerDid: dto.issuerDID,
        credentialHash: dto.credentialHash,
        status: PROOF_STATUS.REJECTED,
      });

      await this.proofRepository.save(proofEntity);

      throw new BadRequestException(
        'You are not eligible for any active clinical trials. ' +
          ineligibleReasons.map((r) => `${r.trialName}: ${r.reason}`).join('; '),
      );
    }

    const existingProof = await this.proofRepository.findOne({
      where: [{ proofHash: dto.proofHash }, { nullifier: dto.nullifier }],
    });

    if (existingProof) {
      throw new BadRequestException(
        'Proof with this hash or nullifier already exists',
      );
    }

    const verificationResult = await mockVerifyProof(
      dto.proofHash,
      dto.nullifier,
      dto.issuerDID,
      dto.signature,
    );

    if (!verificationResult.isValid) {
      const proofEntity = this.proofRepository.create({
        proofHash: dto.proofHash,
        nullifier: dto.nullifier,
        issuerDid: dto.issuerDID,
        credentialHash: dto.credentialHash,
        status: PROOF_STATUS.REJECTED,
      });

      await this.proofRepository.save(proofEntity);

      throw new BadRequestException(
        verificationResult.reason || 'Proof verification failed',
      );
    }

    const verifiedAt = new Date();
    const primaryTrial = eligibleTrials[0];

    const proofEntity = this.proofRepository.create({
      proofHash: dto.proofHash,
      nullifier: dto.nullifier,
      issuerDid: dto.issuerDID,
      credentialHash: dto.credentialHash,
      trialId: primaryTrial.id,
      status: PROOF_STATUS.VERIFIED,
      txHash: verificationResult.txHash,
      verifiedAt,
    });

    await this.proofRepository.save(proofEntity);

    return {
      status: PROOF_STATUS.VERIFIED,
      message: "You're eligible",
      txHash: verificationResult.txHash,
      timestamp: verifiedAt.toISOString(),
      proofId: proofEntity.id,
      eligibleTrials: eligibleTrials,
      matchedTrial: {
        id: primaryTrial.id,
        codeName: primaryTrial.codeName,
        displayName: primaryTrial.displayName,
      },
    };
  }

  async getProofStatus(proofHash: string) {
    const proof = await this.proofRepository.findOne({
      where: { proofHash },
    });

    if (!proof) {
      throw new NotFoundException(`Proof with hash ${proofHash} not found`);
    }

    let issuerName: string | null = null;
    if (proof.credentialHash) {
      const credential = await this.credentialRepository.findOne({
        where: { credentialHash: proof.credentialHash },
      });

      if (credential && credential.issuerId) {
        const issuer = await this.issuerRepository.findOne({
          where: { id: credential.issuerId },
        });
        issuerName = issuer?.name || null;
      }
    }

    return {
      proofHash: proof.proofHash,
      credentialHash: proof.credentialHash,
      status: proof.status,
      txHash: proof.txHash,
      verifiedAt: proof.verifiedAt,
      issuerName: issuerName,
      createdAt: proof.createdAt,
    };
  }

  async getProofHistory(credentialHash: string) {
    const credential = await this.credentialRepository.findOne({
      where: { credentialHash },
    });

    if (!credential) {
      throw new NotFoundException(
        `Credential with hash ${credentialHash} not found`,
      );
    }

    const proofs = await this.proofRepository.find({
      where: { credentialHash },
      order: { createdAt: 'DESC' },
    });

    const issuer = credential.issuerId
      ? await this.issuerRepository.findOne({
          where: { id: credential.issuerId },
        })
      : null;

    const issuerName = issuer?.name || null;

    return {
      credentialStatus: credential.status,
      issuerName: issuerName,
      proofs: proofs.map((proof) => ({
        proofHash: proof.proofHash,
        credentialHash: proof.credentialHash,
        status: proof.status,
        txHash: proof.txHash,
        verifiedAt: proof.verifiedAt,
        createdAt: proof.createdAt,
      })),
    };
  }

  async verifyCredential(credentialHash: string) {
    const credential = await this.credentialRepository.findOne({
      where: { credentialHash },
    });

    if (!credential) {
      return {
        isValid: false,
        reason: 'Credential not found',
      };
    }

    if (credential.status !== CREDENTIAL_STATUS.ACTIVE) {
      return {
        isValid: false,
        reason: `Credential is ${credential.status}. Only active credentials can be used.`,
      };
    }

    const now = new Date();
    if (credential.expiry < now) {
      return {
        isValid: false,
        reason: 'Credential has expired',
      };
    }

    return {
      isValid: true,
      message: 'Credential is valid. You qualify to generate a proof.',
      issuerDID: credential.issuerDid,
      expiry: credential.expiry,
    };
  }

  async verifyLocal(dto: SubmitProofDto) {
    const verificationResult = await mockVerifyProof(
      dto.proofHash,
      dto.nullifier,
      dto.issuerDID,
      dto.signature,
    );

    return {
      isValid: verificationResult.isValid,
      txHash: verificationResult.txHash,
      reason: verificationResult.reason,
    };
  }

  async generateProof(dto: GenerateProofDto) {
    const credentialEntity = await this.credentialRepository.findOne({
      where: { credentialHash: dto.credentialHash },
    });

    if (!credentialEntity) {
      throw new NotFoundException(
        `Credential with hash ${dto.credentialHash} not found`,
      );
    }

    if (credentialEntity.status !== CREDENTIAL_STATUS.ACTIVE) {
      throw new BadRequestException(
        `Credential is ${credentialEntity.status}. Only active credentials can be used to generate proofs.`,
      );
    }

    const now = new Date();
    if (credentialEntity.expiry < now) {
      throw new BadRequestException('Credential has expired');
    }

    if (credentialEntity.issuerDid !== dto.issuerDID) {
      throw new BadRequestException(
        'Issuer DID does not match the credential issuer',
      );
    }

    const credential = credentialEntity.credential || dto.credential;

    if (!credential) {
      throw new BadRequestException(
        'Credential object is required. Please provide it in the request body or ensure it was stored when the credential was issued.',
      );
    }

    const proof = generateProofFromCredential(
      credential,
      dto.credentialHash,
      dto.issuerDID,
    );

    return {
      credentialHash: dto.credentialHash,
      issuerDID: dto.issuerDID,
      proofHash: proof.proofHash,
      nullifier: proof.nullifier,
      signature: proof.signature,
    };
  }
}

