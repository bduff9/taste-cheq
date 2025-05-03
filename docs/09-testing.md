# Testing

## UI Testing
- **Storybook**: All client components are developed and tested in isolation using Storybook.
  - Visual regression testing for consistent UI.
  - Stories serve as living documentation for design system.

## Unit & Integration Testing
- **Vite**: Used for fast unit and integration tests of all testable code (utilities, hooks, API logic, DB adapters).
- Test coverage for:
  - Menu parsing and OCR extraction logic
  - RSCs and server actions (primary data flow)
  - API route handlers (only when strictly necessary)
  - Auth flows
  - State management utilities

## Coverage Goals
- Aim for 80%+ coverage on core logic (menu parsing, DB operations, auth, RSCs, server actions, API routes).
- 100% coverage for critical business logic (auth, menu item creation, rating/tried actions).

## CI Integration
- Tests run on every PR and push via Vercel/GitHub Actions.
- Linting (Biome) and unused code checks (Knip) enforced in CI.

## Manual Testing
- PWA installability and offline support tested on major browsers/devices.
- Accessibility checks for all major flows.
