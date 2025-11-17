# ClinZK

A privacy-preserving clinical trial eligibility verification system using Zero-Knowledge Proofs (ZK Proofs). ClinZK allows patients to prove their eligibility for clinical trials without revealing sensitive personal information.

## Features

- **Zero-Knowledge Proofs**: Privacy-preserving credential verification
- **Clinic Management**: Secure clinic registration with login IDs
- **Credential Issuance**: Issue digital credentials to patients
- **Trial Management**: Create and manage clinical trial eligibility requirements
- **Proof Submission**: Submit and verify eligibility proofs
- **Proof History**: Track all proof submissions for a credential
- **Admin Access**: Secure admin system with database-managed access hashes

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ClinZK
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/clinzkdb
```

### 4. Set Up PostgreSQL Database

Create a PostgreSQL database:

```bash
# Using psql
createdb clinzkdb

# Or using SQL
psql -U postgres
CREATE DATABASE clinzkdb;
```

### 5. Run Database Migrations

Migrations run automatically on server startup. The application will:
- Automatically sync entity schemas (`synchronize: true`)
- Run any pending migrations via `MigrationService`

### 6. Start the Development Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

## API Documentation

Full API documentation is available in [API.md](./API.md).

### Quick Start Endpoints

- **Health Check**: `GET http://localhost:4000/health`
- **Generate Admin Hash**: `POST http://localhost:4000/admin/generate-hash`
- **Register Issuer**: `POST http://localhost:4000/issuer/register` (requires admin access)
- **Issue Credential**: `POST http://localhost:4000/issuer/issue`
- **Submit Proof**: `POST http://localhost:4000/proof/submit`

## Project Structure

```
ClinZK/
├── src/
│   ├── modules/
│   │   ├── admin/          # Admin access management
│   │   ├── health/         # Health check endpoints
│   │   ├── issuer/         # Credential issuance
│   │   ├── proof/           # Proof generation and verification
│   │   └── trial/           # Trial management
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── migration.service.ts
│   ├── config/             # Configuration files
│   └── common/             # Shared constants
├── API.md                   # Complete API documentation
└── package.json
```

## Key Features Explained

### Automatic Database Sync

The application automatically:
- Syncs entity schemas on startup (`synchronize: true`)
- Runs pending migrations via `MigrationService`
- No manual migration commands needed

### Clinic Login ID System

- Each clinic gets a unique login ID when registered (e.g., `CITY-A1B2C3D4`)
- Login ID is required for credential issuance
- Prevents unauthorized credential issuance

### Proof History

- View all proof submissions for a credential
- Includes eligible trials for each proof
- Shows credential status (active, revoked, expired)

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Building
npm run build              # Build for production

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # Run ESLint
npm run format              # Format code with Prettier
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `4000` |
| `NODE_ENV` | Environment (development/production) | No | `development` |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | - |

## Database

The application uses PostgreSQL with TypeORM. Key tables:

- `issuers` - Clinic/issuer information
- `credentials` - Patient credentials
- `proofs` - Proof submissions
- `trials` - Clinical trial definitions
- `admin_hashes` - Admin access hashes

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U username -d clinzkdb
```

### Migration Issues

Migrations run automatically on startup. If you encounter issues:

1. Check database connection
2. Verify `DATABASE_URL` in `.env`
3. Check application logs for migration errors

### Port Already in Use

```bash
# Change PORT in .env file
PORT=4001
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure `DATABASE_URL` points to production database
3. Build the application: `npm run build`
4. Start with: `npm run start:prod`

## License

UNLICENSED

## Support

For API documentation, see [API.md](./API.md).
