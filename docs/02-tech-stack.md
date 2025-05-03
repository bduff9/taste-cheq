# Tech Stack

## Frontend
- **React / Next.js**: Modern, flexible framework for building mobile-first PWAs with SSR/ISR support.
- **TailwindCSS**: Utility-first CSS for rapid, consistent, and responsive UI development.
- **Shadcn**: Component library for accessible, customizable, and modern UI components.
- **React Hook Form**: Efficient, scalable form state management and validation integration for all forms.
- **Arktype**: Type-safe, runtime validation for all form data and API payloads.

## Backend
- **Next.js API Routes**: For server-side logic, OCR fallback, and secure DB access.
- **Kysely**: Type-safe SQL query builder for all runtime DB operations.
- **Prisma**: Handles DB migrations and schema evolution.
- **PostgreSQL**: Reliable, scalable relational database.

## Authentication
- **Lucia**: Simple, secure authentication for Next.js.

## OCR
- **Tesseract.js (WASM)**: Free, client-side OCR engine with good accuracy and browser support. Fallback to server-side if needed for performance or accuracy.

## Maps & Location
- **Google Maps API**: For place lookup, geolocation, and suggesting nearby venues.

## File Storage
- **Cheapest available (e.g., Vercel Blob, S3, or similar)**: For menu images and user avatars.

## Tooling
- **PNPM**: Fast, disk-efficient package manager.
- **Biome**: Linting and formatting for code quality.
- **Knip**: Detects and removes unused files/dependencies.

## Testing
- **Storybook**: Visual testing and documentation for UI components.
- **Vite**: Fast unit/integration testing for all testable code.

## Hosting
- **Vercel**: Optimized for Next.js, easy CI/CD, and global edge deployment.
