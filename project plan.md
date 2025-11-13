

🧩 Backend Development Plan — Clinical Trial Eligibility Ticket (NestJS API)

Overview

This backend powers the entire privacy-preserving eligibility flow for clinical trials.
It acts as the Issuer, Proof Verifier Proxy, Participant history store, and Sponsor analytics engine, all within the scope of a hackathon MVP.

Goal:
Let participants prove eligibility without revealing private data, while sponsors and issuers can trust cryptographic proofs — not raw attributes.

⸻

🧠 Core Concept Recap

Participants:
	•	Get a signed credential from the Issuer (clinic).
	•	Locally generate a Zero-Knowledge (ZK) proof from that credential.
	•	Submit that proof to a Verifier smart contract (or mock verifier API).
	•	View proof history (tickets) and their current statuses.

Issuers:
	•	Issue, revoke, and log credentials.
	•	Rotate signing keys (Ed25519).
	•	Never store raw PII — only hashes.

Sponsors:
	•	View verification events, counters, and charts (aggregated only).

⸻

⚙️ Architecture Overview

┌──────────────────────────────┐
│ Participant Frontend         │
│  - Request Credential        │
│  - Generate Proof Locally    │
│  - Submit Proof              │
│  - View Ticket History       │
└──────────────┬───────────────┘
               │
        REST API (HTTPS)
               │
┌──────────────────────────────┐
│ NestJS Backend               │
│  - /auth (optional)          │
│  - /issuer (credential flow) │
│  - /proof (submit/verify)    │
│  - /tickets (history)        │
│  - /sponsor (analytics)      │
│  - /admin (issuer panel)     │
└──────────────┬───────────────┘
               │
        PostgreSQL DB
               │
     ┌─────────────────┐
     │ Smart Contract  │
     │ Verifier (mock) │
     └─────────────────┘


⸻

🗂 Folder Structure

src/
 ├── main.ts
 ├── app.module.ts
 ├── config/
 │    ├── db.config.ts
 │    ├── crypto.config.ts
 │    └── env.config.ts
 ├── modules/
 │    ├── issuer/
 │    │   ├── issuer.controller.ts
 │    │   ├── issuer.service.ts
 │    │   ├── issuer.module.ts
 │    │   ├── dto/
 │    │   │   ├── issue-credential.dto.ts
 │    │   │   └── revoke-credential.dto.ts
 │    │   ├── entities/credential.entity.ts
 │    │   ├── utils/signer.util.ts
 │    │   ├── utils/validator.util.ts
 │    │   └── keys/
 │    │       └── ed25519.keys.ts
 │    ├── proof/
 │    │   ├── proof.controller.ts
 │    │   ├── proof.service.ts
 │    │   ├── dto/submit-proof.dto.ts
 │    │   ├── entities/proof.entity.ts
 │    │   └── verifier-mock.ts
 │    ├── ticket/
 │    │   ├── ticket.controller.ts
 │    │   ├── ticket.service.ts
 │    │   ├── entities/ticket.entity.ts
 │    ├── sponsor/
 │    │   ├── sponsor.controller.ts
 │    │   ├── sponsor.service.ts
 │    │   ├── entities/event.entity.ts
 │    ├── admin/
 │    │   ├── admin.controller.ts
 │    │   ├── admin.service.ts
 │    ├── health/
 │    │   └── health.controller.ts
 ├── common/
 │    ├── filters/
 │    ├── interceptors/
 │    ├── decorators/
 │    └── constants.ts
 └── database/
      ├── migrations/
      └── typeorm.config.ts


⸻

💡 Backend Modules (mapped to UI screens)

1️⃣ Welcome / Onboarding

No direct API needed — static screen explaining system.
However, backend serves:
	•	/health for status
	•	/issuer/metadata for public key & issuer info (used for trust cues)

Endpoint:
GET /issuer/metadata
Response:

{
  "issuerName": "Clinic Trial Authority",
  "issuerDID": "did:clinic:001",
  "publicKey": "b329f4...",
  "algorithm": "Ed25519",
  "credentialTypes": ["AgeRange18to45", "ConditionHypertension"]
}


⸻

2️⃣ Request Credential (Issuer handoff)

Purpose: Participant requests a signed credential based on their eligibility data.

Endpoints

Method	Route	Description
POST	/issuer/issue	Issues a credential if participant meets criteria
GET	/issuer/credentials/:id	Fetch metadata of an issued credential
POST	/issuer/revoke	Revokes a credential (admin only)

DTO Example:

export class IssueCredentialDto {
  dob: string; // YYYY-MM-DD
  hasCondition: boolean;
}

Flow
	1.	Backend validates eligibility (18–45 + hasCondition = true).
	2.	If valid → generates signed credential:

{
  "issuer": "did:clinic:001",
  "claims": { "ageRange": "18-45", "condition": true },
  "issuedAt": "2025-11-13T09:00:00Z",
  "expiry": "2025-12-13T09:00:00Z"
}


	3.	Signs payload with Ed25519 private key.
	4.	Stores hashed credential in Postgres (credential.entity.ts).
	5.	Returns signed credential to frontend.

Response:

{
  "credential": { ... },
  "signature": "d13b2f...",
  "issuerPublicKey": "b329f4..."
}


⸻

3️⃣ Generate Proof

Although proof generation happens client-side, backend must expose:
	•	/proof/schema → returns circuit schema for proof builder.
	•	/proof/verify-local → optional endpoint to simulate proof verification (mock for dev/demo).

Endpoints

Method	Route	Description
GET	/proof/schema	Returns structure of expected proof
POST	/proof/verify-local	Mock verifier for testing (no chain)

Example /proof/schema response

{
  "requiredClaims": ["ageRange", "condition"],
  "constraints": {
    "ageRange": "18-45",
    "condition": true
  },
  "signatureAlgorithm": "Ed25519"
}


⸻

4️⃣ Submit Ticket (Proof submission)

When user presses “Submit ticket”, frontend sends generated proof.

Endpoints

Method	Route	Description
POST	/proof/submit	Submits a ZK proof for on-chain or mock verification
GET	/proof/status/:proofHash	Returns verification result

DTO Example:

export class SubmitProofDto {
  proofHash: string;
  nullifier: string;
  issuerDID: string;
  signature: string; // of proof bundle
}

Flow:
	1.	Backend receives proof bundle.
	2.	Calls on-chain verifier (or mock verifier) to validate proof.
	3.	Logs event in proof.entity.ts and emits WebSocket update for Sponsor dashboard.
	4.	Returns result to participant:

{
  "status": "verified",
  "txHash": "0x123...",
  "timestamp": "2025-11-13T09:15:00Z"
}



⸻

5️⃣ Participant Ticket / History

Stores participant proof submissions (no PII).

Endpoints

Method	Route	Description
GET	/tickets/:participantId	Fetches list of user’s proofs & statuses
GET	/tickets/:id	Fetches details of one proof
POST	/tickets/save	Optional local proof save/upload

Example Response:

[
  {
    "proofId": "pfx-239d7a",
    "status": "verified",
    "timestamp": "2025-11-13T09:15:00Z",
    "expiry": "2025-12-13T09:00:00Z"
  },
  {
    "proofId": "pfx-93a1f0",
    "status": "rejected",
    "timestamp": "2025-11-13T10:20:00Z"
  }
]


⸻

6️⃣ Sponsor / Verifier Dashboard

Shows aggregate data of verified proofs.

Endpoints

Method	Route	Description
GET	/sponsor/stats	Returns overall counts
GET	/sponsor/recent	Returns recent verification events
GET	/sponsor/export	Exports proof metadata CSV

Example /sponsor/stats Response:

{
  "totalVerified": 182,
  "verifiedToday": 47,
  "issuers": ["did:clinic:001", "did:clinic:002"],
  "chartData": [
    { "hour": "09:00", "verified": 8 },
    { "hour": "10:00", "verified": 12 }
  ]
}


⸻

7️⃣ Issuer Admin Panel

Used by clinic staff during hackathon demo.

Endpoints

Method	Route	Description
GET	/admin/credentials	List all issued credentials
POST	/admin/issue	Issue new credential manually
POST	/admin/revoke	Revoke credential
GET	/admin/keys	Show current public key, expiry, and rotation info
POST	/admin/rotate-keys	Generate new keypair and invalidate old one


⸻

🗄 Database Schema Summary

Table	Key Columns	Description
credentials	id, credentialHash, issuedAt, expiry, issuerDid, status	Stores issued credential metadata
proofs	id, proofHash, nullifier, status, txHash, verifiedAt	Stores proof submissions
tickets	id, participantId, proofId, status, createdAt	Participant proof history
events	id, proofHash, issuerDid, timestamp	Aggregated logs for Sponsor dashboard


⸻

🔐 Cryptography & Security
	•	Algorithm: EdDSA (Ed25519)
	•	Library: noble-ed25519 or libsodium-wrappers
	•	Private Key Storage: Loaded from .env (no file-based keys)
	•	Credential Signing:

const message = JSON.stringify(credential);
const signature = await ed.sign(message, privateKey);


	•	Verification:

const valid = await ed.verify(signature, message, publicKey);



⸻

🔄 API Integration Flow Summary (per screen)

UI Screen	API Calls	Backend Responsibilities
Welcome	GET /issuer/metadata	Display issuer DID, public key
Request Credential	POST /issuer/issue	Validate, sign, return credential
Generate Proof	GET /proof/schema	Provide constraints schema
Submit Ticket	POST /proof/submit	Verify proof, log event, return status
Ticket History	GET /tickets/:participantId	Return all proof results
Sponsor Dashboard	/sponsor/stats, /sponsor/recent	Aggregate metrics, charts
Issuer Admin Panel	/admin/* routes	Credential management & key rotation


⸻

🧰 Dependencies

Category	Packages
Framework	@nestjs/core, @nestjs/common, @nestjs/typeorm
Database	pg, typeorm
Crypto	noble-ed25519
Validation	class-validator, class-transformer
Config	@nestjs/config
Utils	uuid, dotenv
Testing	jest, supertest
Dev tools	ts-node, eslint, prettier


⸻

🧪 Development Phases (Hackathon Plan)

Day 1

✅ Project setup, TypeORM, .env, /health, /issuer/metadata
✅ Create issuer module, issue & revoke endpoints
✅ Generate Ed25519 keypair in issuer.keys.ts

Day 2

✅ Implement /proof/submit, /proof/schema
✅ Log proofs, store tickets, mock verifier
✅ Create sponsor endpoints for analytics
✅ Integrate WebSocket events for live dashboard

Day 3

✅ Add /admin panel APIs (manual issue, revoke, rotate keys)
✅ Final polish: error handling, expiry checks, unit tests
✅ Deploy to Render or Railway
✅ Connect to frontend

⸻

📜 Example .env

PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/clinicaltrialdb
ISSUER_PRIVATE_KEY=beefdead123...
ISSUER_PUBLIC_KEY=cafe789...
ISSUER_DID=did:clinic:001
NODE_ENV=development


