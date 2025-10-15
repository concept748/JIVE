# JIVE

A real-time dashboard for monitoring and managing BMAD (Business Manager Agent Director) multi-agent development workflows.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher

Check your versions:

```bash
node --version  # Should be v18.0.0+
pnpm --version  # Should be 8.0.0+
```

## Installation

1. Clone the repository and navigate to the project directory:

```bash
cd JIVE
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local development configuration.

## Development Commands

### Start Development Server

```bash
pnpm dev
```

Opens [http://localhost:3000](http://localhost:3000) in your browser. The page auto-updates as you edit files.

### Linting and Formatting

```bash
pnpm lint        # Run ESLint
pnpm format      # Format code with Prettier
pnpm type-check  # TypeScript compilation check
```

### Build for Production

```bash
pnpm build       # Create production build
pnpm start       # Run production build locally
```

## Project Structure

```
jive/
├── app/                    # Next.js App Router pages & API routes
├── components/             # React components
│   └── ui/                 # shadcn/ui components (auto-generated)
├── lib/                    # Backend services & utilities
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema (placeholder)
├── public/                 # Static assets
├── tests/                  # All tests
├── docs/                   # Project documentation
├── .env.example            # Environment template
├── eslint.config.mjs       # ESLint config (flat config format)
├── .prettierrc             # Prettier config
├── next.config.js          # Next.js config
├── tsconfig.json           # TypeScript config (strict mode)
├── railway.json            # Railway deployment config
└── package.json            # Dependencies and scripts
```

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development (strict mode)
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **pnpm** - Fast, disk-efficient package manager

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Application

- `NODE_ENV` - Environment (development, production)

### Next.js Public (exposed to browser)

- `NEXT_PUBLIC_WS_URL` - WebSocket server URL
- `NEXT_PUBLIC_MCP_URL` - MCP service URL

### Database (Railway injects in production)

- `DATABASE_URL` - PostgreSQL connection string

### Redis (Railway injects in production)

- `REDIS_URL` - Redis connection string

### Authentication (Railway secrets in production)

- `JWT_SECRET` - JWT signing secret
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret
- `GITHUB_OAUTH_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_OAUTH_CLIENT_SECRET` - GitHub OAuth client secret

**Note:** Never commit `.env.local` to git. Use Railway dashboard to configure production secrets.

## Railway Deployment

This project is configured for deployment on [Railway](https://railway.app/).

### Prerequisites

1. Create a Railway account at [railway.app](https://railway.app/)
2. Install the Railway CLI (optional):

```bash
npm install -g @railway/cli
```

### Deploy Steps

#### Option 1: Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Log in to Railway dashboard
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the `railway.json` configuration
6. Add environment variables in Railway dashboard (see "Environment Variables" section above)
7. Deploy!

#### Option 2: Deploy with Railway CLI

```bash
railway login
railway init
railway up
```

### Railway Configuration

The project includes `railway.json` with the following settings:

- **Builder:** Nixpacks (automatic detection from package.json)
- **Replicas:** 1
- **Restart Policy:** ON_FAILURE with 3 max retries

Railway will automatically:

- Detect Node.js and pnpm
- Install dependencies with `pnpm install`
- Build the project with `pnpm build`
- Start the server with `pnpm start`

### Health Checks

Health check endpoints will be added in Story 1.2.

## Architecture

For detailed technical architecture, see [docs/architecture.md](docs/architecture.md).

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm format` before committing
4. Pre-commit hooks will automatically lint and format staged files
5. Create a pull request for review

## Git Hooks

This project uses Husky and lint-staged for pre-commit hooks:

- **ESLint** - Lints and auto-fixes TypeScript files
- **Prettier** - Formats all code files
- **Type Check** - Ensures TypeScript compilation succeeds

Hooks run automatically on `git commit`. To bypass hooks (not recommended):

```bash
git commit --no-verify
```

## Coding Standards

- **TypeScript strict mode enabled** - No `any` types allowed
- **ESLint** - Next.js and TypeScript rules enforced
- **Prettier** - Consistent code formatting
- **Import paths** - Use `@/` alias for absolute imports (e.g., `import { Button } from '@/components/ui/button'`)

## Testing

Testing framework setup will be added in Story 1.3.

## Contributing

See [docs/architecture.md](docs/architecture.md) for development guidelines.

## License

[Add license information here]
