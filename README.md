# Ashfall Case Library (Phase 1)

Ashfall Case Library is a Next.js + Supabase Phase 1 foundation build that proves:

- apply/login/logout/reset auth flows
- server-protected `/archive` route
- profile write/read from Postgres (`public.profiles`)
- baseline unit + E2E testing harness

## Prerequisites

- Node.js 20 LTS (recommended) or Node.js >= 18.17
- npm
- A Supabase project (hosted)

## Quick Start (<= 15 Minutes)

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Populate `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Apply Phase 1 migration in Supabase SQL Editor:

- Open `supabase/migrations/20260227171500_profiles.sql`
- Run SQL in your Supabase project

5. Start local dev server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Use `.env.local` for local development.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (must be a valid absolute URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key

Optional analytics:

- `ANALYTICS_PROVIDER`: `console` or `posthog` (defaults to auto-detect)
- `POSTHOG_HOST`: PostHog host URL (for example `https://app.posthog.com`)
- `POSTHOG_API_KEY`: PostHog project key

Test-only:

- `PHASE1_E2E_AUTH_BYPASS`: used by Playwright config during E2E runs; do not set for normal app usage

## Supabase Setup Notes

1. Ensure Email auth provider is enabled.
2. Apply Phase 1 migration for `public.profiles`.
3. In Supabase Auth URL configuration:
   - Set Site URL to your production Vercel URL.
   - Add Redirect URLs for local + production auth/reset routes. Recommended:
     - `http://localhost:3000/login`
     - `http://localhost:3000/reset-password`
     - `https://<your-vercel-domain>/login`
     - `https://<your-vercel-domain>/reset-password`

## Local Verification Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
```

## Vercel Deployment (Phase 1)

1. Import this repository in Vercel.
2. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for:
   - Production
   - Preview
   - Development
3. Redeploy.
4. Update Supabase Site URL/Redirect URLs to include the deployed domain.

## Production Smoke Checklist (Manual)

Use the checklist in `phases/phase-001/phase-001-deployment-proof.md`.

Required smoke path:

1. Apply new user
2. Login
3. Verify `/archive` renders callsign
4. Logout and verify redirect to `/login`
5. Confirm telemetry events:
   - `auth_login_succeeded`
   - `archive_access_viewed`
   - `auth_logout`

## Troubleshooting

`getaddrinfo ENOTFOUND <project>.supabase.com`:

- Usually a bad Supabase URL host in env vars.
- Re-copy `NEXT_PUBLIC_SUPABASE_URL` directly from Supabase project settings.

`Missing required Supabase environment variables`:

- `.env.local` is missing required keys.
- Verify variable names exactly match `.env.example`.

`Authentication request failed. Please try again.`:

- Generic mapped auth error from provider/runtime.
- Check server logs for underlying cause (invalid env, network, provider outage, etc.).

## Security Notes

- Never commit real keys to git.
- `.env*` files are gitignored.
- Service-role keys are not required for this Phase 1 app flow and must never be exposed to client code.
