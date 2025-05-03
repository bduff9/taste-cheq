# Authentication

## Overview
Authentication is handled using Lucia, providing secure, modern, and simple auth flows for Next.js. Users can register, sign in, and manage their profile (avatar, name, home location). Admin privileges are limited to the initial admin user for data cleanup.

- **Preference:** All authentication flows should use React Server Components (RSCs) and server actions where possible, instead of API routes. API routes are only used when strictly necessary (e.g., for third-party integrations or webhooks).

## Registration Flow
1. User provides email, password, name, and optionally home city/state and uploads an avatar.
2. Email is checked for uniqueness.
3. Password is hashed and stored securely.
4. User is logged in and session is created.

## Login Flow
1. User enters email and password.
2. Credentials are validated against stored hash.
3. On success, session is created and user is redirected to the home/dashboard.

## Session Management
- Lucia manages session tokens via secure cookies.
- Sessions are validated on each request to protected RSCs or server actions.
- Users can log out, which destroys the session.

## Admin Access
- The first user (you) is flagged as `is_admin` in the DB.
- Admin-only pages/routes are protected by server-side checks.

## Security
- All sensitive operations (registration, login, profile updates) are handled via RSCs and server actions.
- Passwords are never stored in plaintext.
- Rate limiting and brute-force protection on auth endpoints.
