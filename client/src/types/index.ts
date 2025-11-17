export interface Issuer {
  id: string;
  name: string;
}

export interface Credential {
  id: string;
  credentialHash: string;
  issuerDid: string;
  issuerId: string;
  issuerName: string;
  issuedAt: string;
  expiry: string;
  status: 'active' | 'revoked' | 'expired';
  credential: {
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

export interface ProofData {
  credentialHash: string;
  issuerDID: string;
  proofHash: string;
  nullifier: string;
  signature: string;
}

export interface SubmissionResult {
  status: string;
  message: string;
  txHash?: string;
  timestamp: string;
  proofId: string;
  eligibleTrials: Array<{
    id: string;
    codeName: string;
    displayName: string;
  }>;
  matchedTrial: {
    id: string;
    codeName: string;
    displayName: string;
  };
}

export interface ProofHistory {
  credentialStatus: 'active' | 'revoked' | 'expired';
  issuerName: string;
  proofs: Array<{
    proofHash: string;
    credentialHash: string;
    status: 'verified' | 'rejected' | 'expired' | 'pending';
    txHash: string | null;
    verifiedAt: string | null;
    createdAt: string;
    eligibleTrials?: Array<{
      id: string;
      codeName: string;
      displayName: string;
    }>;
  }>;
}

export interface ProofStatus {
  proofHash: string;
  credentialHash: string;
  status: 'verified' | 'rejected' | 'expired' | 'pending';
  txHash: string | null;
  verifiedAt: string | null;
  issuerName: string;
  createdAt: string;
}

export interface IssuerFull {
  id: string;
  name: string;
  loginId?: string;
  did: string;
  publicKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface Trial {
  id: string;
  codeName: string;
  displayName: string;
  requirements: {
    minAge?: number;
    maxAge?: number;
    genders?: string[];
    bloodGroups?: string[];
    genotypes?: string[];
    conditions?: string[];
  };
  isActive?: boolean;
  createdAt: string;
}

export interface TrialCreateRequest {
  codeName: string;
  displayName: string;
  requirements: {
    minAge?: number;
    maxAge?: number;
    genders?: string[];
    bloodGroups?: string[];
    genotypes?: string[];
    conditions?: string[];
  };
}

export interface BulkTrialResponse {
  created: Array<{
    id: string;
    codeName: string;
    displayName: string;
  }>;
  errors: Array<{
    codeName: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface IssueCredentialRequest {
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  genotype: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'CC';
  conditions: string[];
  issuerId?: string;
  issuerName?: string;
  issuerLoginId?: string;
  patientNumber: string;
}

export interface IssueCredentialResponse {
  credential: {
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
  signature: string;
  credentialHash: string;
  issuerPublicKey: string;
  issuerDID: string;
  credentialId: string;
  issuerId: string;
  issuerName: string;
  patientNumber: string;
}

export interface CredentialListItem {
  id: string;
  credentialHash: string;
  issuedAt: string;
  expiry: string;
  issuerDid: string;
  issuerId: string;
  issuerName: string;
  patientNumber: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  updatedAt: string;
}

