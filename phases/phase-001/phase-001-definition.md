# Ashfall Case Library — Phase 1 Definition
**Phase Name:** Phase 1 — Foundation “Hello World”  
**Date:** 2026-02-22  
**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Auth + Postgres + Storage) + Zod + Vercel + Vitest/Playwright + Sentry (optional in Phase 1)

---

## 1) Phase Goal (One Sentence)

Stand up a deployable Ashfall web application using the declared stack that proves the end-to-end plumbing works: **app shell → Supabase auth → protected route → database read/write → basic UI**.

---

## 2) Why This Phase Exists

Phase 1 reduces downstream risk by validating the “boring but critical” foundations early:

- Local dev setup is smooth (vibe-coding friendly)
- Auth and sessions work
- Database connectivity works
- Deployments are repeatable
- Basic UI layout patterns are established

No case gameplay yet.

---

## 3) In Scope

### 3.1 Application Foundation
- Next.js app created with App Router and strict TypeScript
- Tailwind configured
- shadcn/ui installed and usable
- Basic layout shell (header + main + footer)

### 3.2 Immersive Branding Shell (lightweight)
- Product name used consistently: **Ashfall Case Library**
- In-world agency references appear in top-level copy (e.g., “Ashfall Investigative Collective”)
- Minimal brand tone (professional, procedural)

### 3.3 Authentication (Supabase)
- “Apply” flow (registration)
    - email + password + callsign
    - “Application under review…” screen (immediate)
    - “Accepted” screen
- Login flow
- Logout
- Password reset (minimum viable)
- Session persistence across refresh

### 3.4 Protected Route + Basic User Home
- A protected “Archive Access” page that requires login
- Shows:
    - callsign
    - acceptance/clearance placeholder (static for now)
    - a “Case Library is coming soon” placeholder panel
- Confirms server-side auth checks (not just client-only)

### 3.5 Database Write/Read Proof
- A minimal table to prove DB interaction (e.g., `profiles`)
- On signup:
    - create a profile record (callsign, created_at)
- On protected route load:
    - read profile record and display it

### 3.6 Deployment Proof
- Deployed to Vercel
- Connected to Supabase project (env vars set)
- Works in production environment

---

## 4) Explicitly Out of Scope (Phase 1)

- Case library browsing
- Case ingestion / admin tools
- Evidence viewer
- Objectives / submissions / hints
- Analytics pipeline (PostHog) beyond basic logging
- Sentry (optional; may be deferred to Phase 2)
- Entitlements/paywall
- Any AI generation tooling

---

## 5) Phase Success Metrics (POC-oriented)

- A brand-new developer can run the app locally in **≤ 15 minutes** with documented steps.
- A user can:
    1) Apply
    2) Get accepted
    3) Log in
    4) Reach a protected page
    5) See their callsign pulled from the database
- Vercel deployment works and auth functions in production.

---

## 6) Entry Criteria

- Technology stack declared and agreed:
    - Next.js + TS + Tailwind + shadcn/ui
    - Supabase (Auth + Postgres)
    - Zod
    - Vercel target

---

## 7) Exit Criteria (“Definition of Done” for Phase 1)

Phase 1 is complete when all are true:

1. **Repo + Tooling**
    - App builds successfully (`npm run build`)
    - Linting and type checks pass
    - Basic README for local setup exists

2. **Auth**
    - Apply, login, logout, reset password flows functional
    - Sessions persist across refresh

3. **Protected Route**
    - Protected route requires auth
    - Displays user profile data from Postgres

4. **Database**
    - Profile row is created on signup
    - Profile row is read on protected route

5. **Deployment**
    - Production deployment on Vercel is live
    - Connected to Supabase and fully functional

6. **Tests**
    - At least 1 minimal Playwright E2E test:
        - signup/login → protected route visible
    - At least 1 basic unit test (or a type-level validation check) proving the test harness works

---

## 8) Deliverables

- Running Next.js app (local + prod)
- Supabase project configured (Auth + Postgres table)
- Auth UI (apply/login/reset) with Ashfall-themed copy
- Protected “Archive Access” landing page
- Minimal E2E test proving auth + routing
- README with setup instructions

---

## 9) Phase Notes / Guardrails (for vibe-coding)

- Keep changes small and incremental; avoid overbuilding future features.
- Prefer simple, explicit patterns over clever abstractions.
- If any “stack friction” appears, resolve it now (this phase exists to surface friction early).
- Any deviations from the stack must be recorded as a short ADR.

---