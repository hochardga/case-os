# Ashfall Case Library (Phase 2)

Ashfall Case Library is a Next.js + Supabase app with hardened authentication UX and protected-route behavior.

Phase 2 delivers:

- auth-aware navigation and protected route guards with `next` destination preservation
- hardened apply/login/reset/logout/session-expiry flows
- verification resend and account deletion request entry point
- rate limiting for login, password reset, and verification resend
- Phase 2 analytics contracts and deterministic test harnesses

## Prerequisites

- Node.js 20 LTS (recommended) or Node.js >= 18.17
- npm
- Supabase project (hosted)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Populate `.env.local` with required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Apply migrations in Supabase SQL Editor:

- `supabase/migrations/20260227171500_profiles.sql`
- `supabase/migrations/20260228103000_auth_rate_limits.sql`
- `supabase/migrations/20260228113000_account_deletion_requests.sql`

5. Start local dev server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Use `.env.local` for local development.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key

Optional analytics:

- `ANALYTICS_PROVIDER`: `console`, `posthog`, or `memory` (test harness)
- `POSTHOG_HOST`: PostHog host URL (for example `https://app.posthog.com`)
- `POSTHOG_API_KEY`: PostHog project key

Optional auth/rate-limit server settings:

- `SUPABASE_SERVICE_ROLE_KEY`: required only when `AUTH_RATE_LIMIT_STORE=database`
- `AUTH_RATE_LIMIT_STORE`: `memory` or `database` (`database` requires service role)
- `AUTH_RATE_LIMIT_SALT`: salt for subject hashing
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`: global rate-limit window fallback
- `AUTH_RATE_LIMIT_BLOCK_SECONDS`: global block duration fallback
- `AUTH_RATE_LIMIT_LOGIN_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS`
- `AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS`
- `AUTH_RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_PASSWORD_RESET_WINDOW_SECONDS`
- `AUTH_RATE_LIMIT_PASSWORD_RESET_BLOCK_SECONDS`
- `AUTH_RATE_LIMIT_VERIFICATION_RESEND_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_VERIFICATION_RESEND_WINDOW_SECONDS`
- `AUTH_RATE_LIMIT_VERIFICATION_RESEND_BLOCK_SECONDS`

Test-only (do not set in production):

- `PHASE1_E2E_AUTH_BYPASS`
- `ANALYTICS_TEST_MODE`

Supabase Management API (for hosted email template deploys):

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_RECOVERY_TEMPLATE_PATH` (optional, default `supabase/email-templates/recovery.html`)
- `SUPABASE_RECOVERY_TEMPLATE_SUBJECT` (optional)

## Version-Controlled Recovery Email Template

The reset-password email template is stored in source at:

- `supabase/email-templates/recovery.html`

Deploy the template + subject to your hosted Supabase project:

```bash
npm run deploy:email:recovery-template
```

Notes:

- The deploy script automatically loads `.env.local` (if present).
- Shell-exported env vars still work and can override `.env.local` values.

Preview what would be deployed without updating Supabase config:

```bash
npm run deploy:email:recovery-template -- --dry-run
```

## Auth Flow Summary (Phase 2)

- Apply: `/apply` -> `/apply/review` -> verify via callback -> `/apply/accepted`
- Login: `/login` supports safe `next` destination and blocks unverified users
- Password reset: `/reset-password` request -> callback recovery -> `/reset-password/update`
- Protected routes: `/archive` and `/candidate-file` redirect unauthenticated users to `/login?next=<path>`
- Logout: clears session and returns to `/`; back navigation does not expose protected content
- Session expiry: redirects to `/login?next=<path>&session=expired`

## Local Verification Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
```

## Test Coverage Highlights

Phase 2 required auth scenarios are covered in Playwright suites under `tests/e2e`:

- register -> verify -> login -> protected route
- duplicate registration neutral messaging
- failed login sanitized messaging
- full password reset request + update cycle
- expired reset token recovery path
- logout and protected-route blocking

Unit suites under `tests/unit` cover:

- auth schemas/validation
- auth error mapping
- rate-limit behavior
- analytics contract and route telemetry emission

## Supabase Auth Configuration Notes

1. Ensure Email auth provider is enabled.
2. Set Site URL to production domain.
3. Add redirect URLs for local + production callback flows, including:
   - `/auth/callback?type=signup`
   - `/auth/callback?type=recovery`
4. Keep callback destinations aligned with app routes:
   - `/apply/accepted`
   - `/reset-password/update`

## Vercel Deployment

1. Import repository in Vercel.
2. Set environment variables:
   - Required public vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Optional server vars for analytics and database-backed rate limiting
3. Apply migrations in production Supabase project.
4. Redeploy and run production smoke checklist.

## Phase 2 Smoke Checklist (Manual)

- [ ] Apply flow reaches review/accepted
- [ ] Unverified login blocked with resend guidance
- [ ] Verified login reaches protected archive
- [ ] Password reset request and reset update succeed
- [ ] Expired reset token shows recovery CTA
- [ ] Logout redirects to landing and protected routes remain blocked
- [ ] Telemetry observed for:
  - [ ] `auth_login_succeeded`
  - [ ] `auth_login_failed`
  - [ ] `auth_password_reset_requested`
  - [ ] `auth_password_updated`
  - [ ] `auth_rate_limited`

## Troubleshooting

`getaddrinfo ENOTFOUND <project>.supabase.co`:

- Usually an invalid Supabase URL host.
- Re-copy `NEXT_PUBLIC_SUPABASE_URL` from Supabase settings.

`Missing SUPABASE_SERVICE_ROLE_KEY for database rate limiting`:

- `AUTH_RATE_LIMIT_STORE=database` is set without service role key.
- Either provide key server-side or use `AUTH_RATE_LIMIT_STORE=memory`.

`Authentication request failed. Please try again.`:

- Generic mapped auth error from provider/runtime.
- Check server logs and env values first.

## Security Notes

- Never commit real keys.
- `.env*` files are gitignored.
- Service role keys are server-only and must never be exposed to client code.
