# TasteCheq

A mobile-first PWA for scanning, recording, and rating menu items from restaurants, bars, and more. Built with Next.js, TailwindCSS, Shadcn UI, Kysely, Prisma, Lucia, React Hook Form, Arktype, and more.

## Project Structure

```
/ (root)
  /app           # Next.js app directory (pages, layouts, routing)
  /components    # Reusable React components (with Storybook stories)
  /db            # Kysely DB client, Prisma schema/migrations
  /lib           # Utility functions, hooks, helpers
  /public        # Static assets (favicons, images)
  /styles        # Tailwind config, global styles
  /tests         # Vite unit/integration tests
  /docs          # Project documentation
```

## Tooling

- **Biome**: Linting and formatting
- **Knip**: Unused code detection
- **Vitest**: Unit/integration testing
- **Storybook**: UI component development/testing
- **PNPM**: Package management

## CI/CD

- **GitHub Actions**: Runs Biome, Knip, Vitest, and Storybook build on every push/PR to `main`.

## Scripts

- `pnpm biome check .` — Lint and format check
- `pnpm knip --strict` — Unused code check
- `pnpm vitest run --coverage` — Run all tests with coverage
- `pnpm storybook` — Run Storybook locally
- `pnpm build-storybook` — Build Storybook static site

## Environment

- Copy `.env.example` to `.env` and fill in your secrets (Postgres, API keys, etc.)

## Documentation

See the `/docs` folder for full planning, architecture, and tech stack details.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
