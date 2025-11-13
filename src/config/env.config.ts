export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  issuer: {
    privateKey: process.env.ISSUER_PRIVATE_KEY,
    publicKey: process.env.ISSUER_PUBLIC_KEY,
    did: process.env.ISSUER_DID as string,
  },
  nodeEnv: process.env.NODE_ENV as string,
});

