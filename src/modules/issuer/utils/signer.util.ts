import * as ed from 'noble-ed25519';
import { createHash } from 'crypto';

export async function signCredential(
  credential: object,
  privateKeyHex: string,
): Promise<string> {
  if (!privateKeyHex || privateKeyHex.trim() === '') {
    throw new Error('Private key is required');
  }

  const trimmedKey = privateKeyHex.trim().toLowerCase();

  if (trimmedKey.length !== 64) {
    throw new Error(
      `Invalid private key length: expected 64 hex characters (32 bytes), got ${trimmedKey.length}`,
    );
  }

  if (!/^[0-9a-fA-F]+$/.test(trimmedKey)) {
    throw new Error(
      'Invalid private key format: must contain only hexadecimal characters (0-9, a-f, A-F)',
    );
  }

  try {
    const messageString = JSON.stringify(credential);
    const messageBytes = new TextEncoder().encode(messageString);
    
    let privateKeyBytes: Uint8Array;
    try {
      const buffer = Buffer.from(trimmedKey, 'hex');
      if (buffer.length !== 32) {
        throw new Error(
          `Invalid private key byte length: expected 32 bytes, got ${buffer.length} bytes from ${trimmedKey.length} hex characters`,
        );
      }
      privateKeyBytes = new Uint8Array(buffer);
    } catch (bufferError) {
      throw new Error(
        `Failed to convert private key hex to bytes: ${bufferError instanceof Error ? bufferError.message : String(bufferError)}. Key preview: ${trimmedKey.substring(0, 20)}...`,
      );
    }

    if (privateKeyBytes.length !== 32) {
      throw new Error(
        `Invalid private key byte length: expected 32 bytes, got ${privateKeyBytes.length}`,
      );
    }

    const signature = await ed.sign(messageBytes, privateKeyBytes);
    return Buffer.from(signature).toString('hex');
  } catch (error) {
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('hextobytes') || errorMsg.includes('invalid') || errorMsg.includes('unpadded')) {
        throw new Error(
          `Invalid private key format: The private key stored in the database appears to be corrupted. ` +
          `Key length: ${trimmedKey.length}, Key preview: ${trimmedKey.substring(0, 20)}... ` +
          `Please delete the issuer and create a new one to generate valid keys.`,
        );
      }
      throw error;
    }
    throw new Error(`Failed to sign credential: ${String(error)}`);
  }
}

export async function verifyCredential(
  credential: object,
  signature: string,
  publicKeyHex: string,
): Promise<boolean> {
  try {
    const messageString = JSON.stringify(credential);
    const messageBytes = new TextEncoder().encode(messageString);
    const sig = Uint8Array.from(Buffer.from(signature, 'hex'));
    const publicKey = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'));
    return await ed.verify(sig, messageBytes, publicKey);
  } catch {
    return false;
  }
}

export function hashCredential(credential: object): string {
  return createHash('sha256')
    .update(JSON.stringify(credential))
    .digest('hex');
}

