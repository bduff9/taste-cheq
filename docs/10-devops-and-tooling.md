# DevOps & Tooling

## Package Management
- **PNPM**: Used for all dependency management. Fast, disk-efficient, and workspace-friendly.

## Linting & Formatting
- **Biome**: Enforces code style, formatting, and linting across the codebase. Runs in CI.

## Unused Code Detection
- **Knip**: Regularly scans for unused files, exports, and dependencies. Integrated into CI.

## Deployment
- **Vercel**: Primary hosting for both frontend and backend (Next.js RSCs, server actions, and API routes).
  - RSCs and server actions are the preferred approach for backend logic; API routes are only used when strictly necessary (e.g., webhooks, third-party REST integrations).
  - Automatic deployments on push/PR.
  - Environment variable management.
  - Edge network for fast global performance.

## Environment Variables
- `.env` file for local development (Postgres connection, API keys, etc.).
- Vercel dashboard for production secrets (DB URL, Google Maps API key, storage credentials).

## CI/CD
- **GitHub Actions**: All tests, linting, and Knip checks run on every PR and push via GitHub Actions.
- Deploy previews for feature branches are managed through Vercel integrations with GitHub.

## Documentation
- All planning and technical docs live in the `/docs` folder.
- Storybook serves as living documentation for UI components.
