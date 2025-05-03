# Architecture

## Folder Structure (Proposed)
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

## RSC, Server Actions, and Client Components
- **React Server Components (RSC)**: Default for all UI and data-fetching logic. Use RSC for rendering, DB reads, and most business logic to maximize performance and minimize client bundle size.
- **Server Actions**: Preferred for mutations (writes, updates, deletes) and side effects, replacing most API routes. Use server actions for form submissions, menu creation, ratings, etc.
- **API Routes**: Only used for cases where a traditional HTTP API is required (e.g., webhooks, file uploads, or third-party integrations that require a REST endpoint).
- **Client Components**: Used only when client-side interactivity is needed (e.g., hooks, local state, event handlers, OCR processing, file/image uploads, or highly interactive UI elements).

## Data Flow
1. **User Auth**: Lucia manages sessions via RSC and server actions (no API routes needed for most flows).
2. **Menu Scanning**: User uploads/takes photo → Tesseract.js (WASM) runs OCR in a client component → Extracted text is passed to RSC/server action for parsing and DB writes.
3. **DB Operations**: All runtime DB reads via RSC, all writes via server actions. Migrations via Prisma.
4. **File Uploads**: Handled by client components (for file selection) and server actions (for storage and DB updates).
5. **Location/Maps**: User location fetched client-side, Google Maps API used for place suggestions (client component), results passed to RSC/server actions as needed.

## Security Considerations
- All sensitive operations (auth, DB writes, file uploads) handled via server actions or RSC.
- Input validation and sanitization on both client and server.
- User data (avatars, locations) protected via access controls.
- Rate limiting and abuse prevention on server actions and any remaining API endpoints.
