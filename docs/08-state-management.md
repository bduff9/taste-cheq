# State Management

## Local State
- Managed via React hooks and context for UI state (modals, forms, navigation, etc.).
- Component-level state for menu scanning, OCR progress, and form inputs.

## Server State
- **Preference:** All data fetching and mutations should use React Server Components (RSCs) and server actions where possible, instead of API routes. API routes are only used when strictly necessary (e.g., for third-party integrations or webhooks).
- Most data fetching is handled by RSCs. Use TanStack Query (SWR/React Query) only when client-side data fetching or revalidation is required (e.g., for highly interactive or real-time features).
- All DB reads/writes go through RSCs and server actions.
- Optimistic updates for rating/tried actions to improve UX.

## Auth State
- Lucia manages session state via secure cookies.
- Auth context/hook provides user info, login/logout, and role (admin/user) to components.
- Protected routes/pages check auth state on both client and server.

## Caching & Performance
- Use TanStack Query (SWR/React Query) for caching and revalidation only in client-side data fetching scenarios.
- Memoization for expensive computations (e.g., OCR results parsing).

## Error Handling
- Centralized error boundaries for UI errors.
- User-friendly error messages for failed API calls, OCR, and auth issues.
