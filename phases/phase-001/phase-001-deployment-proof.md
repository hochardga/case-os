# Phase 1 Deployment Proof and Smoke Test

**Phase:** Phase 1 - Foundation "Hello World"  
**Task:** T10 - Deployment Proof and Developer Onboarding  
**Last Updated:** 2026-02-28

---

## 1) Objective

Capture verifiable evidence that:

1. Developers can set up and run locally using documented steps.
2. Production deployment works end-to-end for auth + protected route flow.

---

## 2) Local Verification Evidence (Completed)

Executed on 2026-02-28 in workspace `/Users/gregoryhochard/Development/case-os`:

- `npm run lint` - pass
- `npm run typecheck` - pass
- `npm run build` - pass
- `npm run test:unit` - pass
- `npm run test:e2e` - pass

E2E baseline includes signup/login -> `/archive` with callsign assertion:

- `tests/e2e/baseline-auth-archive.spec.ts`

---

## 3) Production Smoke Checklist (Manual Run Required)

Run on deployed Vercel URL and mark each item:

- [ ] Production URL reachable over HTTPS
- [ ] Apply flow creates account and reaches review/accepted states
- [ ] Login succeeds and routes to `/archive`
- [ ] `/archive` renders profile callsign (DB-sourced)
- [ ] Logout returns user to `/login`
- [ ] Unauthenticated direct visit to `/archive` redirects to `/login`
- [ ] Telemetry observed for:
  - [ ] `auth_login_succeeded`
  - [ ] `archive_access_viewed`
  - [ ] `auth_logout`

---

## 4) Vercel/Supabase Configuration Checklist

- [ ] Vercel env vars set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase Site URL set to production Vercel domain
- [ ] Supabase Redirect URLs include auth/reset routes:
  - [ ] `https://<prod-domain>/login`
  - [ ] `https://<prod-domain>/reset-password`
- [ ] `public.profiles` migration applied in production database

---

## 5) Smoke Run Record

Fill this after each production smoke execution.

| Date (UTC) | Environment | URL | Commit/Ref | Tester | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-02-28 | Local | http://localhost:3000 | workspace | Codex | PASS | Local build/lint/type/unit/e2e all green |
| _pending_ | Production | _pending_ | _pending_ | _pending_ | _pending_ | Manual production smoke run required |

---

## 6) Known Setup Pitfalls

1. `ENOTFOUND <project-ref>.supabase.com`
   - Cause: incorrect Supabase URL host in env.
   - Fix: copy URL directly from Supabase project settings.
2. Generic auth error `Authentication request failed. Please try again.`
   - Cause: mapped unknown provider/network error.
   - Fix: check server logs and env values first.
3. Missing env startup failure
   - Cause: missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Fix: verify `.env.local` against `.env.example`.
