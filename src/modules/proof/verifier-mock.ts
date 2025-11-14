export async function mockVerifyProof(
  proofHash: string,
  nullifier: string,
  issuerDID: string,
  signature: string,
): Promise<{ isValid: boolean; txHash?: string; reason?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!proofHash || !nullifier || !issuerDID || !signature) {
    return {
      isValid: false,
      reason: 'Missing required proof components',
    };
  }

  if (proofHash.length < 32 || nullifier.length < 32) {
    return {
      isValid: false,
      reason: 'Invalid proof hash or nullifier format',
    };
  }

  const txHash = `0x${Buffer.from(proofHash + nullifier)
    .toString('hex')
    .substring(0, 64)}`;

  return {
    isValid: true,
    txHash,
  };
}

