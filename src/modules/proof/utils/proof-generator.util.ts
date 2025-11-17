import { createHash } from 'crypto';

export interface CredentialData {
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
}

export function generateNullifier(credentialHash: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  const input = `${credentialHash}-${time}-${Math.random()}`;
  return createHash('sha256').update(input).digest('hex');
}

export function generateProofHash(
  credential: CredentialData,
  nullifier: string,
): string {
  const proofData = {
    credential: credential,
    nullifier: nullifier,
    timestamp: new Date().toISOString(),
  };
  return createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex');
}

export function generateProofSignature(
  proofHash: string,
  nullifier: string,
  issuerDID: string,
): string {
  const message = `${proofHash}-${nullifier}-${issuerDID}`;
  return createHash('sha256').update(message).digest('hex');
}

export function generateProofFromCredential(
  credential: CredentialData,
  credentialHash: string,
  issuerDID: string,
): {
  proofHash: string;
  nullifier: string;
  signature: string;
} {
  const nullifier = generateNullifier(credentialHash);
  const proofHash = generateProofHash(credential, nullifier);
  const signature = generateProofSignature(proofHash, nullifier, issuerDID);

  return {
    proofHash,
    nullifier,
    signature,
  };
}

