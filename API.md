# ClinZK API Documentation

## Base URL
```
http://localhost:4000
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T21:10:26.000Z"
}
```

**Status Code:** `200 OK`

---

### Issuer Management Endpoints

#### POST /issuer/register
Register a new issuer. Automatically generates Ed25519 keypair.

**Request Body:**
```json
{
  "name": "City General Hospital",
  "did": "did:clinic:002"
}
```

**Validation Rules:**
- `name`: Required, must be unique
- `did`: Optional, auto-generated if not provided (format: `did:clinic:timestamp`)

**Success Response (201 Created):**
```json
{
  "id": "uuid-here",
  "name": "City General Hospital",
  "did": "did:clinic:002",
  "publicKey": "a1b2c3d4e5f6...",
  "isActive": true,
  "createdAt": "2025-11-13T21:10:26.000Z"
}
```

**Error Response:**

**400 Bad Request** - Duplicate issuer:
```json
{
  "statusCode": 400,
  "message": "Issuer with this name or DID already exists",
  "error": "Bad Request"
}
```

---

#### GET /issuer/list
Get all active issuers.

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "City General Hospital",
    "did": "did:clinic:002",
    "publicKey": "a1b2c3d4e5f6...",
    "isActive": true,
    "createdAt": "2025-11-13T21:10:26.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Regional Medical Center",
    "did": "did:clinic:003",
    "publicKey": "f6e5d4c3b2a1...",
    "isActive": true,
    "createdAt": "2025-11-13T20:15:00.000Z"
  }
]
```

---

#### GET /issuer/names
Get all active issuer names and IDs. This is a simplified endpoint for frontend dropdowns/select lists.

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "City General Hospital"
  },
  {
    "id": "uuid-2",
    "name": "Regional Medical Center"
  }
]
```

**Status Code:** `200 OK`

**Note:** Returns issuers sorted alphabetically by name. Only returns active issuers.

---

#### GET /issuer/:id
Get issuer details by ID.

**Path Parameters:**
- `id`: UUID of the issuer

**Success Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "City General Hospital",
  "did": "did:clinic:002",
  "publicKey": "a1b2c3d4e5f6...",
  "isActive": true,
  "createdAt": "2025-11-13T21:10:26.000Z",
  "updatedAt": "2025-11-13T21:10:26.000Z"
}
```

**Error Response:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Issuer with ID uuid-here not found",
  "error": "Not Found"
}
```

---

#### GET /issuer/metadata
Get issuer public information including public key and credential types.

**Query Parameters:**
- `issuerId` (optional): UUID of specific issuer. If not provided, returns all active issuers.

**Note:** At least one issuer must be registered before this endpoint can be used. Use `POST /issuer/register` to create an issuer first.

**Response (with issuerId - single issuer):**
```json
{
  "issuerName": "Clinic Trial Authority",
  "issuerDID": "did:clinic:001",
  "publicKey": "66070dc2f68b895aa1a501bd7af4c9f18aff4306dcab510d931e98892455a182",
  "algorithm": "Ed25519",
  "credentialTypes": [
    "Name",
    "Age",
    "Gender",
    "BloodGroup",
    "Genotype",
    "Conditions"
  ]
}
```

**Response (without issuerId - all issuers):**
```json
[
  {
    "issuerName": "City General Hospital",
    "issuerDID": "did:clinic:002",
    "publicKey": "a1b2c3d4e5f6...",
    "algorithm": "Ed25519",
    "credentialTypes": [
      "Name",
      "AgeRange18to45",
      "Gender",
      "BloodGroup",
      "Genotype",
      "Condition"
    ]
  },
  {
    "issuerName": "Regional Medical Center",
    "issuerDID": "did:clinic:003",
    "publicKey": "f6e5d4c3b2a1...",
    "algorithm": "Ed25519",
    "credentialTypes": [
      "Name",
      "AgeRange18to45",
      "Gender",
      "BloodGroup",
      "Genotype",
      "Condition"
    ]
  }
]
```

**Status Code:** `200 OK`

**Error Responses:**

**404 Not Found** - No issuer found (when no issuerId provided):
```json
{
  "statusCode": 404,
  "message": "No active issuer found. Please register an issuer first using POST /issuer/register",
  "error": "Not Found"
}
```

**404 Not Found** - Specific issuer not found (when issuerId provided):
```json
{
  "statusCode": 404,
  "message": "Issuer with ID uuid-here not found",
  "error": "Not Found"
}
```

---

#### POST /issuer/issue
Issue a signed credential to a participant. No age restrictions - credentials can be issued to anyone, including children.

**Request Body:**
```json
{
  "name": "John Doe",
  "dob": "1995-06-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "genotype": "AA",
  "conditions": ["Hypertension", "Diabetes"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-12345"
}
```

**Example Request Bodies for Testing:**

**✅ CORRECT - Will Match Trials:**

1. **Matches BLOOD_BANK trial** (Age 30, O- blood, AS genotype, Anemia condition):
```json
{
  "name": "Sarah Johnson",
  "dob": "1994-03-20",
  "gender": "Female",
  "bloodGroup": "O-",
  "genotype": "AS",
  "conditions": ["Anemia"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-001"
}
```

2. **Matches DIABETES_STUDY trial** (Age 35, Diabetes condition):
```json
{
  "name": "Michael Chen",
  "dob": "1989-07-10",
  "gender": "Male",
  "bloodGroup": "A+",
  "genotype": "AA",
  "conditions": ["Diabetes"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-002"
}
```

3. **Matches HYPERTENSION_MULTI trial** (Age 45, Hypertension condition):
```json
{
  "name": "David Thompson",
  "dob": "1979-05-18",
  "gender": "Male",
  "bloodGroup": "B+",
  "genotype": "AA",
  "conditions": ["Hypertension"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-003"
}
```

**❌ INCORRECT - Will NOT Match Any Trial:**

1. **Wrong condition for age** (Age 15, has condition but too young and wrong condition):
```json
{
  "name": "Alex Martinez",
  "dob": "2009-09-15",
  "gender": "Male",
  "bloodGroup": "A+",
  "genotype": "AA",
  "conditions": ["Diabetes"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-004"
}
```

2. **Too old and wrong condition** (Age 80, condition doesn't match any trial):
```json
{
  "name": "Robert Brown",
  "dob": "1944-01-30",
  "gender": "Male",
  "bloodGroup": "O+",
  "genotype": "AA",
  "conditions": ["Arthritis"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-005"
}
```

3. **Wrong condition, blood type, and genotype combination** (Age 20, condition doesn't match any trial requirements):
```json
{
  "name": "Lisa Anderson",
  "dob": "2004-12-22",
  "gender": "Female",
  "bloodGroup": "B+",
  "genotype": "AC",
  "conditions": ["Asthma"],
  "issuerId": "uuid-of-issuer",
  "patientNumber": "PAT-006"
}
```

**Note:** 
- `issuerId` is optional. If not provided, uses the first active issuer.
- `patientNumber` is required - this is the unique patient identifier assigned by the clinic/issuer.
- At least one issuer must be registered before issuing credentials. Use `POST /issuer/register` to create an issuer first.
- **No age restrictions** - credentials can be issued to anyone regardless of age
- **Multiple conditions supported** - provide an array of medical conditions

**Validation Rules:**
- `name`: Must be a non-empty string
- `dob`: Must be a valid date string in YYYY-MM-DD format
- `gender`: Must be one of: "Male", "Female", "Other"
- `bloodGroup`: Must be one of: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
- `genotype`: Must be one of: "AA", "AS", "SS", "AC", "SC", "CC"
- `conditions`: **Required** - Must be a non-empty array with at least one condition string (e.g., ["Hypertension", "Diabetes", "Asthma"])
- `patientNumber`: Must be a non-empty string (unique identifier assigned by the clinic)

**Success Response (201 Created):**
```json
{
  "credential": {
    "issuer": "did:clinic:001",
    "claims": {
      "name": "John Doe",
      "age": 30,
      "gender": "Male",
      "bloodGroup": "O+",
      "genotype": "AA",
      "conditions": ["Hypertension", "Diabetes"]
    },
    "issuedAt": "2025-11-13T21:10:26.000Z",
    "expiry": "2025-12-13T21:10:26.000Z"
  },
  "signature": "d13b2f8a9c4e5f6...",
  "credentialHash": "sha256-hash-of-credential",
  "issuerPublicKey": "66070dc2f68b895aa1a501bd7af4c9f18aff4306dcab510d931e98892455a182",
  "issuerDID": "did:clinic:001",
  "credentialId": "uuid-here",
  "issuerId": "uuid-of-issuer",
  "issuerName": "City General Hospital",
  "patientNumber": "PAT-12345"
}
```

**Note:** 
- Save the `issuerName` and `patientNumber` to retrieve your credentials later using `POST /issuer/credentials/retrieve`
- The `credentialHash` and `issuerDID` are needed for proof generation and submission
- Age is calculated from DOB and stored as a number in the credential
- Eligibility validation happens during proof submission based on trial requirements

**Error Responses:**

**400 Bad Request** - No issuer available:
```json
{
  "statusCode": 400,
  "message": "No active issuer found. Please register an issuer first using POST /issuer/register",
  "error": "Bad Request"
}
```

**400 Bad Request** - Missing required field:
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

**400 Bad Request** - Invalid conditions:
```json
{
  "statusCode": 400,
  "message": "At least one condition is required",
  "error": "Bad Request"
}
```

**400 Bad Request** - Invalid enum value:
```json
{
  "statusCode": 400,
  "message": [
    "gender must be one of the following values: Male, Female, Other"
  ],
  "error": "Bad Request"
}
```

---

#### GET /issuer/credentials
Get all credentials metadata.

**Response:**
```json
[
  {
    "id": "uuid-1",
    "credentialHash": "sha256-hash-1",
    "issuedAt": "2025-11-13T21:10:26.000Z",
    "expiry": "2025-12-13T21:10:26.000Z",
    "issuerDid": "did:clinic:001",
    "issuerId": "uuid-of-issuer",
    "issuerName": "City General Hospital",
    "patientNumber": "PAT-12345",
    "status": "active",
    "createdAt": "2025-11-13T21:10:26.000Z",
    "updatedAt": "2025-11-13T21:10:26.000Z"
  },
  {
    "id": "uuid-2",
    "credentialHash": "sha256-hash-2",
    "issuedAt": "2025-11-13T20:15:00.000Z",
    "expiry": "2025-12-13T20:15:00.000Z",
    "issuerDid": "did:clinic:002",
    "issuerId": "uuid-of-issuer-2",
    "issuerName": "Regional Medical Center",
    "patientNumber": "PAT-67890",
    "status": "revoked",
    "createdAt": "2025-11-13T20:15:00.000Z",
    "updatedAt": "2025-11-13T22:30:00.000Z"
  }
]
```

**Status Code:** `200 OK`

**Note:** Returns an empty array `[]` if no credentials exist. Use `POST /issuer/credentials/retrieve` to get credentials for a specific patient.

---

#### POST /issuer/credentials/retrieve
Retrieve credentials using issuer name and patient number. This is the privacy-preserving way for participants to get their credentials without revealing personal details.

**Request Body:**
```json
{
  "issuerName": "City General Hospital",
  "patientNumber": "PAT-12345"
}
```

**Validation Rules:**
- `issuerName`: Must be a non-empty string matching the exact name of an active issuer (case-sensitive)
- `patientNumber`: Must be a non-empty string (the patient number assigned by the clinic)

**Success Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "credentialHash": "sha256-hash-1",
    "credential": {
      "issuer": "did:clinic:001",
      "claims": {
        "name": "John Doe",
        "age": 30,
        "gender": "Male",
        "bloodGroup": "O+",
        "genotype": "AA",
        "conditions": ["Hypertension", "Diabetes"]
      },
      "issuedAt": "2025-11-13T21:10:26.000Z",
      "expiry": "2025-12-13T21:10:26.000Z"
    },
    "issuerDid": "did:clinic:001",
    "issuerId": "uuid-of-issuer",
    "issuerName": "City General Hospital",
    "issuedAt": "2025-11-13T21:10:26.000Z",
    "expiry": "2025-12-13T21:10:26.000Z",
    "status": "active",
    "createdAt": "2025-11-13T21:10:26.000Z",
    "updatedAt": "2025-11-13T21:10:26.000Z"
  }
]
```

**Note:** 
- The full `credential` object is returned, which can be used directly for proof generation
- Only active credentials are returned
- The credential object includes all claims needed for proof generation
- Trials are managed internally and automatically matched during proof submission

**Error Response:**

**404 Not Found** - Issuer not found:
```json
{
  "statusCode": 404,
  "message": "Issuer with name \"City General Hospital\" not found. Please check the issuer name and try again.",
  "error": "Not Found"
}
```

**404 Not Found** - No credentials found (patient not registered):
```json
{
  "statusCode": 404,
  "message": "Sorry, you are not a patient at City General Hospital. Please check your issuer name and patient number, or contact the clinic if you believe this is an error.",
  "error": "Not Found"
}
```

**400 Bad Request** - Credential revoked:
```json
{
  "statusCode": 400,
  "message": "Your credential has been revoked by City General Hospital. Please contact the clinic for more information.",
  "error": "Bad Request"
}
```

**400 Bad Request** - Credential expired:
```json
{
  "statusCode": 400,
  "message": "Your credential from City General Hospital has expired. Please contact the clinic to issue a new credential.",
  "error": "Bad Request"
}
```

**Note:** 
- Users select their clinic/issuer from the list (use `GET /issuer/list` to get all issuers)
- Users enter their patient number (assigned by the clinic when they register)
- No personal information (name, DOB, etc.) is required to retrieve credentials
- Returns a 404 error with a clear message if no credentials are found for the provided issuer and patient number
- This approach is more privacy-preserving as it doesn't require revealing personal details
- Each clinic can have multiple patients, differentiated by their unique patient numbers

---

#### GET /issuer/credentials/:id
Get metadata for a specific credential by ID.

**Path Parameters:**
- `id`: UUID of the credential

**Success Response (200 OK):**
```json
{
  "id": "uuid-here",
  "credentialHash": "sha256-hash",
  "issuedAt": "2025-11-13T21:10:26.000Z",
  "expiry": "2025-12-13T21:10:26.000Z",
  "issuerDid": "did:clinic:001",
  "status": "active"
}
```

**Error Response:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Credential with ID uuid-here not found",
  "error": "Not Found"
}
```

---

#### POST /issuer/revoke
Revoke an issued credential.

**Request Body:**
```json
{
  "credentialId": "uuid-here"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Credential revoked successfully",
  "credentialId": "uuid-here",
  "status": "revoked"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Credential with ID uuid-here not found",
  "error": "Not Found"
}
```

**400 Bad Request** - Already revoked:
```json
{
  "statusCode": 400,
  "message": "Credential is already revoked",
  "error": "Bad Request"
}
```

---

### Proof Endpoints

#### GET /proof/schema
Get the proof schema that defines what claims are required and their constraints.

**Response:**
```json
{
  "requiredClaims": [
    "name",
    "age",
    "gender",
    "bloodGroup",
    "genotype",
    "conditions"
  ],
  "constraints": {
    "age": "any",
    "conditions": "at least one required"
  },
  "signatureAlgorithm": "Ed25519"
}
```

**Status Code:** `200 OK`

**Note:** 
- `age` is stored as a number (calculated from DOB)
- `conditions` is an array of strings (supports multiple conditions)
- Eligibility validation happens during proof submission based on trial requirements

---

#### POST /proof/generate
Generate a ZK proof from a credential. This endpoint validates the credential and generates `proofHash`, `nullifier`, and `signature` needed for proof submission. This replaces the need for `/proof/verify-local` as validation happens here.

**Request Body:**
```json
{
  "credentialHash": "sha256-hash-of-credential",
  "issuerDID": "did:clinic:001",
  "credential": {
    "issuer": "did:clinic:001",
    "claims": {
      "name": "John Doe",
      "age": 30,
      "gender": "Male",
      "bloodGroup": "O+",
      "genotype": "AA",
      "conditions": ["Hypertension", "Diabetes"]
    },
    "issuedAt": "2025-11-13T21:10:26.000Z",
    "expiry": "2025-12-13T21:10:26.000Z"
  }
}
```

**Note:** 
- The `credential` field is optional. If not provided, it will be retrieved from the database using the `credentialHash`
- If you retrieved the credential via `POST /issuer/credentials/retrieve`, you already have the credential object and can include it
- This endpoint validates the credential (active, not expired) before generating the proof

**Success Response (200 OK):**
```json
{
  "credentialHash": "sha256-hash-of-credential",
  "issuerDID": "did:clinic:001",
  "proofHash": "abc123def456...",
  "nullifier": "xyz789uvw012...",
  "signature": "sig123..."
}
```

**Error Responses:**

**404 Not Found** - Credential not found:
```json
{
  "statusCode": 404,
  "message": "Credential with hash sha256-hash-of-credential not found",
  "error": "Not Found"
}
```

**400 Bad Request** - Credential not active or expired:
```json
{
  "statusCode": 400,
  "message": "Credential is revoked. Only active credentials can be used to generate proofs.",
  "error": "Bad Request"
}
```

**How Proof Generation Works:**
1. Validates credential exists, is active, and hasn't expired
2. **Nullifier**: Generated from `credentialHash` + timestamp + random value (prevents double-spending)
3. **Proof Hash**: SHA-256 hash of the credential + nullifier + timestamp
4. **Signature**: SHA-256 hash of `proofHash` + `nullifier` + `issuerDID`

**Note:**
- This endpoint validates the credential and generates the proof components
- The `credential` object is optional - if not provided, it's retrieved from the database
- For production, the frontend would generate proofs client-side using a ZK proof library (e.g., Circom, SnarkJS)
- This endpoint is provided as a helper for MVP/demo purposes

---

#### POST /proof/submit
Submit a ZK proof for verification. The backend automatically validates the credential against all active trial requirements, then verifies the proof (using mock verifier) and stores it as a ticket.

**Flow:**
1. Validates that the credential exists and is active
2. Checks that the credential hasn't expired
3. Verifies the issuer DID matches
4. **Automatically validates credential against all active trial requirements** (age, gender, blood group, genotype, conditions)
5. If eligible for at least one trial, validates the proof format and verifies it
6. Creates a ticket record linked to the first matching trial

**Request Body:**
```json
{
  "credentialHash": "sha256-hash-of-credential",
  "proofHash": "abc123def456...",
  "nullifier": "xyz789uvw012...",
  "issuerDID": "did:clinic:001",
  "signature": "sig123..."
}
```

**Note:** 
- No `trialId` is required - the system automatically matches credentials against all active trials
- Trials are managed internally and users don't need to see or select them
- The system validates eligibility against all trials and returns which trial(s) the user is eligible for

**Where Frontend Gets These Values:**

**Option 1: Using Helper Endpoint (Recommended for MVP)**
- `credentialHash`: From `POST /issuer/issue` response → `credentialHash` field
- `issuerDID`: From `POST /issuer/issue` response → `issuerDID` field
- `proofHash`, `nullifier`, `signature`: From `POST /proof/generate` response

**Option 2: Client-Side Generation (Production)**
- `credentialHash`: From `POST /issuer/issue` response → `credentialHash` field
- `issuerDID`: From `POST /issuer/issue` response → `issuerDID` field
- `proofHash`, `nullifier`, `signature`: Generated client-side using a ZK proof library (e.g., Circom, SnarkJS)

**Frontend Flow (Using Helper Endpoint):**
1. Retrieve credential via `POST /issuer/credentials/retrieve` with `issuerName` and `patientNumber` → receives `credentialHash`, `issuerDID`, full `credential` object
2. Call `POST /proof/generate` with `credentialHash`, `issuerDID`, and optionally `credential` → receives `proofHash`, `nullifier`, `signature` (validation happens here)
3. Submit proof via `POST /proof/submit` with all required fields (no trial selection needed)
4. System automatically validates against all active trials and returns eligible trials

**Frontend Flow (Client-Side Generation):**
1. Retrieve credential via `POST /issuer/credentials/retrieve` with `issuerName` and `patientNumber` → receives `credentialHash`, `issuerDID`, full `credential` object
2. Generate ZK proof client-side using a ZK proof library → produces `proofHash`, `nullifier`, `signature`
3. Submit proof via `POST /proof/submit` with all required fields (no trial selection needed)
4. System automatically validates against all active trials and returns eligible trials

**Validation Rules:**
- `credentialHash`: Must be a non-empty string (SHA-256 hash of the credential from `/issuer/issue`)
- `proofHash`: Must be a non-empty string (SHA-256 hash of the proof)
- `nullifier`: Must be a non-empty string (unique identifier to prevent double-spending)
- `issuerDID`: Must be a valid issuer DID that matches the credential's issuer
- `signature`: Must be a non-empty string (signature of the proof bundle)

**Success Response (201 Created):**
```json
{
  "status": "verified",
  "message": "You're eligible",
  "txHash": "0x1234567890abcdef...",
  "timestamp": "2025-11-13T21:10:26.000Z",
  "proofId": "uuid-here",
  "eligibleTrials": [
    {
      "id": "trial-uuid-1",
      "codeName": "BLOOD_BANK",
      "displayName": "Blood Bank Trial"
    },
    {
      "id": "trial-uuid-2",
      "codeName": "DIABETES_STUDY",
      "displayName": "Diabetes Research Study"
    }
  ],
  "matchedTrial": {
    "id": "trial-uuid-1",
    "codeName": "BLOOD_BANK",
    "displayName": "Blood Bank Trial"
  }
}
```

**Note:**
- `eligibleTrials` contains all trials the credential matches
- `matchedTrial` is the first eligible trial (used for ticket linking)
- If eligible for multiple trials, all are returned but the first one is used for the ticket

**Error Responses:**

**404 Not Found** - Credential not found:
```json
{
  "statusCode": 404,
  "message": "Credential with hash sha256-hash-of-credential not found",
  "error": "Not Found"
}
```

**400 Bad Request** - Credential not active:
```json
{
  "statusCode": 400,
  "message": "Credential is revoked. Only active credentials can be used to generate proofs.",
  "error": "Bad Request"
}
```

**400 Bad Request** - Credential expired:
```json
{
  "statusCode": 400,
  "message": "Credential has expired",
  "error": "Bad Request"
}
```

**Note:** Expired credential attempts are logged in proof history with `status: "expired"` so patients can see all their submission attempts.

**400 Bad Request** - Issuer mismatch:
```json
{
  "statusCode": 400,
  "message": "Issuer DID in proof does not match the credential issuer",
  "error": "Bad Request"
}
```

**400 Bad Request** - Duplicate proof:
```json
{
  "statusCode": 400,
  "message": "Proof with this hash or nullifier already exists",
  "error": "Bad Request"
}
```

**400 Bad Request** - Not eligible for any trial:
```json
{
  "statusCode": 400,
  "message": "You are not eligible for any active clinical trials. Blood Bank Trial: Age 20 is below the minimum required age of 25; Diabetes Study: None of the required conditions (Diabetes) are present in the credential",
  "error": "Bad Request"
}
```

**400 Bad Request** - No trials available:
```json
{
  "statusCode": 400,
  "message": "No active trials available. Please contact the administrator.",
  "error": "Bad Request"
}
```

**400 Bad Request** - Verification failed:
```json
{
  "statusCode": 400,
  "message": "Invalid proof hash or nullifier format",
  "error": "Bad Request"
}
```

**400 Bad Request** - 6-week cooldown period:
```json
{
  "statusCode": 400,
  "message": "You cannot submit another proof yet. Clinical trials don't happen often. Please wait 15 more days before submitting again. The 6-week cooldown period applies whether you were eligible or not.",
  "error": "Bad Request"
}
```

**Note:** 
- The credential must be obtained first via `POST /issuer/issue` to get the `credentialHash`
- The credential is automatically validated against all active trial requirements before proof verification
- Eligibility is checked against all trials - if the credential matches any trial, the proof is verified
- Trials are managed internally and users don't need to see or select them
- The system automatically matches credentials to eligible trials
- The nullifier ensures each proof can only be used once (prevents double-spending)
- **6-Week Cooldown**: Patients can only submit a proof once every 6 weeks (42 days) per credential. This applies whether they were eligible or not, as clinical trials don't happen often. If they try to submit again within 6 weeks, they'll receive an error message with the number of days remaining.
- Proofs are verified using a mock verifier (for hackathon MVP)
- Verified proofs are stored in the database as tickets for analytics and history
- Use `GET /proof/history/:credentialHash` to view all proof submissions for a credential

---

#### GET /proof/status/:proofHash
Get the verification status of a submitted proof.

**Path Parameters:**
- `proofHash`: SHA-256 hash of the proof

**Success Response (200 OK):**
```json
{
  "proofHash": "abc123def456...",
  "credentialHash": "sha256-hash-of-credential...",
  "status": "verified",
  "txHash": "0x1234567890abcdef...",
  "verifiedAt": "2025-11-13T21:10:26.000Z",
  "issuerName": "City General Hospital",
  "createdAt": "2025-11-13T21:10:26.000Z"
}
```

**Example Response - Rejected:**
```json
{
  "proofHash": "c247b9f1df8697a7046755ca2501b08feebf0da4b698802a4a7608e0e2407918",
  "credentialHash": "sha256-hash-of-credential...",
  "status": "rejected",
  "txHash": null,
  "verifiedAt": null,
  "issuerName": "City General Hospital",
  "createdAt": "2025-11-14T10:40:44.462Z"
}
```

**Example Response - Verified:**
```json
{
  "proofHash": "53496ecba0b2399646022edf52c060eab47fa9a836cdf112b391390ce1920f3a",
  "credentialHash": "sha256-hash-of-credential...",
  "status": "verified",
  "txHash": "0x3533343936656362613062323339393634363032326564663532633036306561",
  "verifiedAt": "2025-11-14T10:38:37.075Z",
  "issuerName": "City General Hospital",
  "createdAt": "2025-11-14T10:38:37.080Z"
}
```

**Error Response:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Proof with hash abc123def456... not found",
  "error": "Not Found"
}
```

**Note:** 
- Status can be `pending`, `verified`, `rejected`, or `expired`
- The `issuerName` field is included to serve as proof history, showing which issuer/hospital issued the credential used for this proof
- This endpoint can be used to view the history of all submitted proofs

---

#### GET /proof/history/:credentialHash
Get the complete proof submission history for a specific credential. Patients can use their `credentialHash` to view all their proof submissions without authentication.

**Path Parameters:**
- `credentialHash`: SHA-256 hash of the credential (obtained when the credential was issued)

**Success Response (200 OK):**
```json
{
  "credentialStatus": "active",
  "issuerName": "City General Hospital",
  "proofs": [
    {
      "proofHash": "53496ecba0b2399646022edf52c060eab47fa9a836cdf112b391390ce1920f3a",
      "credentialHash": "sha256-hash-of-credential...",
      "status": "verified",
      "txHash": "0x3533343936656362613062323339393634363032326564663532633036306561",
      "verifiedAt": "2025-11-14T10:38:37.075Z",
      "createdAt": "2025-11-14T10:38:37.080Z"
    },
    {
      "proofHash": "c247b9f1df8697a7046755ca2501b08feebf0da4b698802a4a7608e0e2407918",
      "credentialHash": "sha256-hash-of-credential...",
      "status": "rejected",
      "txHash": null,
      "verifiedAt": null,
      "createdAt": "2025-11-14T10:40:44.462Z"
    }
  ]
}
```

**Example Response - Revoked Credential:**
```json
{
  "credentialStatus": "revoked",
  "issuerName": "City General Hospital",
  "proofs": [
    {
      "proofHash": "53496ecba0b2399646022edf52c060eab47fa9a836cdf112b391390ce1920f3a",
      "credentialHash": "sha256-hash-of-credential...",
      "status": "verified",
      "txHash": "0x3533343936656362613062323339393634363032326564663532633036306561",
      "verifiedAt": "2025-11-14T10:38:37.075Z",
      "createdAt": "2025-11-14T10:38:37.080Z"
    }
  ]
}
```

**Error Response:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Credential with hash sha256-hash-of-credential... not found",
  "error": "Not Found"
}
```

**Note:** 
- Returns an object with `credentialStatus`, `issuerName`, and `proofs` array
- `credentialStatus` shows the current status of the credential: `active`, `revoked`, or `expired`
- Returns an empty `proofs` array `[]` if no proofs have been submitted for this credential
- Proofs are returned in descending order (most recent first)
- Patients can use their `credentialHash` from when they retrieved their credential to view their complete proof history
- **Revoked credentials**: Even if a credential is revoked, you can still view the history using the credentialHash. The `credentialStatus` will show `"revoked"` in the response. However, revoked credentials cannot be used to generate new proofs or retrieve the credential itself.
- This serves as a history/ticket system without requiring authentication

---

### Trial Management Endpoints

#### POST /trial/create
Create a new clinical trial with specific eligibility requirements.

**Request Body:**
```json
{
  "codeName": "BLOOD_BANK",
  "displayName": "Blood Bank Trial",
  "requirements": {
    "minAge": 25,
    "maxAge": 65,
    "genders": ["Male", "Female"],
    "bloodGroups": ["O+", "O-"],
    "genotypes": ["AS", "SS"],
    "conditions": ["Hypertension"]
  }
}
```

**Validation Rules:**
- `codeName`: Required, must be unique (e.g., "BLOOD_BANK", "DIABETES_STUDY")
- `displayName`: Required, human-readable name (e.g., "Blood Bank Trial")
- `requirements`: Object with optional fields:
  - `minAge`: Minimum age (number, optional)
  - `maxAge`: Maximum age (number, optional)
  - `genders`: Array of allowed genders (optional)
  - `bloodGroups`: Array of allowed blood groups (optional)
  - `genotypes`: Array of allowed genotypes (optional)
  - `conditions`: Array of required conditions (at least one must match, optional)

**Success Response (201 Created):**
```json
{
  "id": "trial-uuid-here",
  "codeName": "BLOOD_BANK",
  "displayName": "Blood Bank Trial",
  "requirements": {
    "minAge": 25,
    "maxAge": 65,
    "genders": ["Male", "Female"],
    "bloodGroups": ["O+", "O-"],
    "genotypes": ["AS", "SS"],
    "conditions": ["Hypertension"]
  },
  "isActive": true,
  "createdAt": "2025-11-13T21:10:26.000Z"
}
```

**Error Response:**

**400 Bad Request** - Duplicate code name:
```json
{
  "statusCode": 400,
  "message": "Trial with code name BLOOD_BANK already exists",
  "error": "Bad Request"
}
```

---

#### POST /trial/create-bulk
Create multiple trials at once. Useful for setting up multiple trials in bulk.

**Request Body:**
```json
{
  "trials": [
    {
      "codeName": "BLOOD_BANK",
      "displayName": "Blood Bank Trial",
      "requirements": {
        "minAge": 25,
        "bloodGroups": ["O+", "O-"],
        "genotypes": ["AS"],
        "conditions": ["Anemia", "Blood Disorder"]
      }
    },
    {
      "codeName": "DIABETES_STUDY",
      "displayName": "Diabetes Research Study",
      "requirements": {
        "minAge": 18,
        "maxAge": 60,
        "conditions": ["Diabetes"]
      }
    },
    {
      "codeName": "PEDIATRIC_CARDIAC",
      "displayName": "Pediatric Cardiac Study",
      "requirements": {
        "maxAge": 12,
        "conditions": ["Heart Disease", "Congenital Heart Defect"]
      }
    },
    {
      "codeName": "UNIVERSAL_DONOR",
      "displayName": "Universal Donor Research",
      "requirements": {
        "minAge": 18,
        "maxAge": 65,
        "bloodGroups": ["O-"],
        "genders": ["Male", "Female"],
        "conditions": ["Blood Donation", "Universal Donor"]
      }
    },
    {
      "codeName": "SICKLE_CELL_TREATMENT",
      "displayName": "Sickle Cell Treatment Trial",
      "requirements": {
        "minAge": 16,
        "genotypes": ["SS", "SC"],
        "conditions": ["Sickle Cell Disease"]
      }
    },
    {
      "codeName": "HYPERTENSION_MULTI",
      "displayName": "Hypertension Multi-Condition Study",
      "requirements": {
        "minAge": 30,
        "maxAge": 70,
        "conditions": ["Hypertension", "High Blood Pressure"],
        "genders": ["Male", "Female"]
      }
    },
    {
      "codeName": "RARE_BLOOD_TYPES",
      "displayName": "Rare Blood Types Research",
      "requirements": {
        "minAge": 21,
        "bloodGroups": ["AB+", "AB-", "B-"],
        "genotypes": ["AA", "AS"],
        "conditions": ["Rare Blood Type", "Blood Disorder"]
      }
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "created": [
    {
      "id": "trial-uuid-1",
      "codeName": "BLOOD_BANK",
      "displayName": "Blood Bank Trial"
    },
    {
      "id": "trial-uuid-2",
      "codeName": "DIABETES_STUDY",
      "displayName": "Diabetes Research Study"
    }
  ],
  "errors": [],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

**Error Response (partial success):**
```json
{
  "created": [
    {
      "id": "trial-uuid-1",
      "codeName": "BLOOD_BANK",
      "displayName": "Blood Bank Trial"
    }
  ],
  "errors": [
    {
      "codeName": "DIABETES_STUDY",
      "error": "Trial with this code name already exists"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

---

#### GET /trial/list
Get all active trials with their requirements.

**Response:**
```json
[
  {
    "id": "trial-uuid-1",
    "codeName": "BLOOD_BANK",
    "displayName": "Blood Bank Trial",
    "requirements": {
      "minAge": 25,
      "maxAge": 65,
      "genders": ["Male", "Female"],
      "bloodGroups": ["O+", "O-"],
      "genotypes": ["AS", "SS"],
      "conditions": ["Hypertension"]
    },
    "createdAt": "2025-11-13T21:10:26.000Z"
  },
  {
    "id": "trial-uuid-2",
    "codeName": "DIABETES_STUDY",
    "displayName": "Diabetes Research Study",
    "requirements": {
      "minAge": 18,
      "maxAge": 60,
      "conditions": ["Diabetes"]
    },
    "createdAt": "2025-11-13T20:15:00.000Z"
  }
]
```

**Status Code:** `200 OK`

**Note:** Returns only active trials, sorted alphabetically by display name.

---

#### GET /trial/names
Get all active trial names and IDs. Simplified endpoint for frontend dropdowns.

**Response:**
```json
[
  {
    "id": "trial-uuid-1",
    "codeName": "BLOOD_BANK",
    "displayName": "Blood Bank Trial"
  },
  {
    "id": "trial-uuid-2",
    "codeName": "DIABETES_STUDY",
    "displayName": "Diabetes Research Study"
  }
]
```

**Status Code:** `200 OK`

**Note:** Returns trials sorted alphabetically by display name. Only returns active trials.

---

#### GET /trial/:id
Get specific trial details by ID.

**Path Parameters:**
- `id`: UUID of the trial

**Success Response (200 OK):**
```json
{
  "id": "trial-uuid-here",
  "codeName": "BLOOD_BANK",
  "displayName": "Blood Bank Trial",
  "requirements": {
    "minAge": 25,
    "maxAge": 65,
    "genders": ["Male", "Female"],
    "bloodGroups": ["O+", "O-"],
    "genotypes": ["AS", "SS"],
    "conditions": ["Hypertension"]
  },
  "isActive": true,
  "createdAt": "2025-11-13T21:10:26.000Z",
  "updatedAt": "2025-11-13T21:10:26.000Z"
}
```

**Error Response:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Trial with ID trial-uuid-here not found",
  "error": "Not Found"
}
```

---
