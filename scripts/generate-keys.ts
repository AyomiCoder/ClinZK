import * as ed from 'noble-ed25519';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

async function generateKeys() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);
  
  const privateKeyHex = Buffer.from(privateKey).toString('hex');
  const publicKeyHex = Buffer.from(publicKey).toString('hex');
  
  console.log('Generated Ed25519 Keypair:');
  console.log('Private Key:', privateKeyHex);
  console.log('Public Key:', publicKeyHex);
  
  const envPath = join(process.cwd(), '.env');
  
  if (existsSync(envPath)) {
    let envContent = readFileSync(envPath, 'utf-8');
    
    if (!envContent.includes('ISSUER_PRIVATE_KEY=')) {
      envContent += '\nISSUER_PRIVATE_KEY=\n';
    }
    if (!envContent.includes('ISSUER_PUBLIC_KEY=')) {
      envContent += '\nISSUER_PUBLIC_KEY=\n';
    }
    
    envContent = envContent.replace(
      /ISSUER_PRIVATE_KEY=.*/,
      `ISSUER_PRIVATE_KEY=${privateKeyHex}`
    );
    envContent = envContent.replace(
      /ISSUER_PUBLIC_KEY=.*/,
      `ISSUER_PUBLIC_KEY=${publicKeyHex}`
    );
    
    writeFileSync(envPath, envContent);
    console.log('\n✅ Keys have been written to .env file');
  } else {
    console.log('\n⚠️  .env file not found. Please add these manually:');
    console.log(`ISSUER_PRIVATE_KEY=${privateKeyHex}`);
    console.log(`ISSUER_PUBLIC_KEY=${publicKeyHex}`);
  }
}

generateKeys().catch(console.error);

