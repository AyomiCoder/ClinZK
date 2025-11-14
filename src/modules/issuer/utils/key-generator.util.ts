import * as ed from 'noble-ed25519';

export async function generateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const privateKeyBytes = ed.utils.randomPrivateKey();
  const publicKeyBytes = await ed.getPublicKey(privateKeyBytes);

  const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
  const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

  if (privateKeyHex.length !== 64) {
    throw new Error(
      `Invalid private key length: expected 64 hex characters, got ${privateKeyHex.length}`,
    );
  }

  if (publicKeyHex.length !== 64) {
    throw new Error(
      `Invalid public key length: expected 64 hex characters, got ${publicKeyHex.length}`,
    );
  }

  return {
    privateKey: privateKeyHex,
    publicKey: publicKeyHex,
  };
}

