# ClinZK Frontend

Frontend application for ClinZK - Privacy-Preserving Clinical Trial Eligibility Verification System.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:4000` (or configure via environment variables)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component with routing
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json
```

## Features

- **Credential Retrieval**: Retrieve patient credentials using clinic name and patient number
- **Proof Generation**: Generate zero-knowledge proofs from credentials
- **Proof Submission**: Submit proofs for automatic trial matching and verification
- **Proof History**: View complete history of proof submissions
- **Responsive Design**: Mobile-friendly interface

## Pages

1. **Home** (`/`) - Landing page with navigation
2. **Retrieve Credential** (`/retrieve`) - Retrieve patient credentials
3. **Generate Proof** (`/generate-proof`) - Generate and submit proofs
4. **Proof History** (`/history/:credentialHash`) - View proof submission history

## API Integration

The frontend uses the API client in `src/api/client.ts` to communicate with the backend. All API calls are centralized and handle errors consistently.

## Error Handling

Error messages are user-friendly and handled through the `errorHandler` utility in `src/utils/errorHandler.ts`.

## Local Storage

The app uses localStorage to:
- Save credential hash for easy access to history
- Remember clinic name and patient number

## Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Development Notes

- The app automatically matches credentials against all active trials (no trial selection needed)
- Credential status (active/revoked/expired) is displayed throughout the app
- Proof history works even for revoked credentials
- All API errors are handled with user-friendly messages
