# Phase 1 Test Harness

This project uses Vitest for unit/component tests and Playwright for end-to-end tests.

## Deterministic Commands

- Unit tests: `npm run test:unit`
- E2E tests: `npm run test:e2e`
- CI baseline: run `npm run test:unit` then `npm run test:e2e`

## E2E Environment Handling

- Playwright starts the app on `http://127.0.0.1:4173` using `npm run dev -- --hostname 127.0.0.1 --port 4173`.
- E2E run injects test-safe env vars from `playwright.config.ts`:
  - `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key`
  - `PHASE1_E2E_AUTH_BYPASS=1`
- The E2E suite does not require a live Supabase connection.

## Baseline Coverage for Phase 1

- Unit baseline: schema/error/analytics tests under `/tests/unit`.
- E2E baseline: `tests/e2e/baseline-auth-archive.spec.ts` covers:
  - apply/signup step
  - login step
  - protected `/archive` access
  - callsign visibility assertion
