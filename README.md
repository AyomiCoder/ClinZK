# ClinZK Monorepo

This is a monorepo containing both the client and server applications for ClinZK.

## Structure

```
.
├── client/          # React frontend application
├── server/          # NestJS backend application
└── package.json     # Root package.json with workspace configuration
```

## Setup

1. Install all dependencies (from root):
```bash
npm install
```

This will install dependencies for both client and server workspaces.

## Development

### Client
```bash
# Run client in development mode
npm run dev:client
# or
npm run dev --workspace=client
```

### Server
```bash
# Run server in development mode (with watch)
npm run start:server:dev
# or
npm run start:dev --workspace=server
```

## Building

### Build Server
```bash
# Build the server
npm run build:server
# or
npm run build --workspace=server
```

### Build Client
```bash
# Build the client
npm run build:client
# or
npm run build --workspace=client
```

### Build Both
```bash
# Build both client and server
npm run build
```

## Production / Deployment

### Build and Start Server (Production)
```bash
# 1. Build the server
npm run build:server
# or
npm run build --workspace=server

# 2. Start the server in production mode
npm run start:server
# or
npm run start:prod --workspace=server
```

### Build and Start Client (Production)
```bash
# 1. Build the client (creates static files in client/dist/)
npm run build:client
# or
npm run build --workspace=client

# 2. Start the client preview server (for testing production build)
npm run start:client
# or
npm run preview --workspace=client
```

**Note:** 
- For the server, make sure to build first using `npm run build:server` before starting in production mode.
- For the client, the build creates static files in `client/dist/`. The `start:client` command uses Vite's preview server for testing. In actual production deployments, you would typically serve the `client/dist/` folder using a static file server like nginx, or deploy to platforms like Vercel, Netlify, etc.

## Available Commands

### Root Level Commands
- `npm install` - Install all dependencies for all workspaces
- `npm run build` - Build both client and server
- `npm run build:client` - Build only the client
- `npm run build:server` - Build only the server
- `npm run start:server` - Start server in production mode
- `npm run start:server:dev` - Start server in development mode
- `npm run start:client` - Start client preview server (for production build)
- `npm run dev:client` - Start client in development mode
- `npm run lint` - Lint both client and server

### Server Workspace Commands
Run from root with `--workspace=server` or `-w server`:
- `npm run build -w server` - Build server
- `npm run start:prod -w server` - Start server in production
- `npm run start:dev -w server` - Start server in development
- `npm run start:debug -w server` - Start server in debug mode
- `npm run test -w server` - Run server tests
- `npm run lint -w server` - Lint server code

### Client Workspace Commands
Run from root with `--workspace=client` or `-w client`:
- `npm run build -w client` - Build client (outputs to `client/dist/`)
- `npm run dev -w client` - Start client in development mode
- `npm run preview -w client` - Preview production build (serves `client/dist/`)
- `npm run lint -w client` - Lint client code

## Important Notes

1. **Dependencies**: All dependencies are managed at the root level. Run `npm install` from the root directory.

2. **Server Build**: The server build command is now simply `nest build` (dependencies are installed at root level).

3. **Server Start (Production)**: After building, use `npm run start:server` or `npm run start:prod -w server` to start the production server.

4. **Workspace Syntax**: You can use either `--workspace=<name>` or the shorter `-w <name>` flag when running commands.

