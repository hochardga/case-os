# Phase 2 Test Harness

This project uses Vitest for unit/component tests and Playwright for end-to-end tests.

## Deterministic Commands

- Unit tests: `npm run test:unit`
- E2E tests: `npm run test:e2e`
- CI baseline: run `npm run test:unit` then `npm run test:e2e`

## E2E Runtime Environment

Playwright starts the app on `http://127.0.0.1:4173` using:

```bash
npm run dev -- --hostname 127.0.0.1 --port 4173
```

Injected test env vars from `playwright.config.ts`:

- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key`
- `PHASE1_E2E_AUTH_BYPASS=1`
- `ANALYTICS_PROVIDER=memory`
- `ANALYTICS_TEST_MODE=1`
- `AUTH_RATE_LIMIT_STORE=memory`
- `AUTH_RATE_LIMIT_LOGIN_MAX_ATTEMPTS=1`
- `AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS=60`
- `AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS=120`

Notes:

- E2E does not require a live Supabase connection.
- Callback success/error states are simulated via `/auth/callback?mock=success|error`.
- Server-side analytics verification uses `/api/testing/analytics-events` (enabled only when `ANALYTICS_TEST_MODE=1` and non-production runtime).

## Phase 2 Required E2E Coverage Mapping

Covered scenarios:

- Register -> verify -> login -> protected route:
  - `tests/e2e/baseline-auth-archive.spec.ts`
- Duplicate registration neutral messaging:
  - `tests/e2e/apply-flow.spec.ts`
- Failed login sanitized messaging:
  - `tests/e2e/auth-flows.spec.ts`
- Password reset full cycle:
  - `tests/e2e/auth-flows.spec.ts`
- Expired reset token recovery path:
  - `tests/e2e/auth-flows.spec.ts`
- Logout -> protected blocked:
  - `tests/e2e/auth-flows.spec.ts`

## Phase 2 Unit Coverage Mapping

- Validation schemas: `tests/unit/auth-validation.test.ts`
- Error mapper: `tests/unit/auth-error-mapper.test.ts`
- Rate limiting: `tests/unit/auth-rate-limit.test.ts`
- Redirect/callback safety: `tests/unit/auth-redirects.test.ts`, `tests/unit/auth-callback-redirects.test.ts`
- Analytics contract and dispatch adapter: `tests/unit/analytics-track.test.ts`
- Route-level telemetry emission: `tests/unit/auth-route-telemetry.test.ts`

## Telemetry Verification Targets

Phase 2 exit expects verified emission for:

- `auth_login_succeeded`
- `auth_login_failed`
- `auth_password_reset_requested`
- `auth_password_updated`
- `auth_rate_limited`

Verification paths:

- Unit route-telemetry tests for deterministic event emission checks.
- E2E analytics memory harness for auth edge-path assertion (`auth_rate_limited`).
