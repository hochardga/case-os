# Ashfall Case Library — Phase 1 Task Plan

**Phase:** Phase 1 - Foundation "Hello World"  
**Inputs:** `phase-001-definition.md`, `phase-001-requirements.md`, `phase-001-design.md`  
**Date:** 2026-02-27  
**Status:** Draft

---

## 1) Plan Overview

- Task sizing target: `0.5` to `1.0` day per task.
- Execution order is sequential by dependency.
- Each task includes acceptance criteria, tests, telemetry, and definition of done.

---

## 2) Task Sequence

1. T1 - App foundation and shared shell
2. T2 - Supabase integration and session middleware
3. T3 - Auth validation and API contract scaffolding
4. T4 - Profiles schema, trigger, and RLS
5. T5 - Apply flow (UI + API integration)
6. T6 - Login/logout/reset flows (UI + API integration)
7. T7 - Protected Archive Access route and profile render
8. T8 - Analytics adapter and event instrumentation
9. T9 - Test harness completion and baseline coverage
10. T10 - Deployment proof and developer onboarding docs

---

## 3) Tickets

## T1
- **Task Name**
  - App Foundation and Shell
- **Objective**
  - Establish the Next.js App Router foundation with strict TypeScript, Tailwind, shadcn/ui, and the shared Ashfall layout shell.
- **Scope**
  - Create route groups for public/protected pages.
  - Implement `AppShell` with header, main, footer.
  - Add top-level brand copy with product and agency names.
  - Ensure project builds with strict TS settings.
  - Estimate: `0.5 day`
- **Acceptance Criteria**
  - `npm run build` succeeds.
  - Shared shell appears on public and protected routes.
  - "Ashfall Case Library" and "Ashfall Investigative Collective" copy appears in top-level UI.
- **Tests Required**
  - Unit: one render smoke test for shell component.
  - E2E: none for this task.
- **Telemetry Required**
  - None.
- **Notes / Edge Cases**
  - Keep shell lightweight and reusable.
  - Avoid introducing case-specific UI patterns in this phase.
- **Definition of Done Checklist**
  - [x] Code merged for app shell and route skeleton.
  - [x] Build/type/lint pass locally.
  - [x] Shell smoke test passes.

## T2
- **Task Name**
  - Supabase Integration and Middleware Session Guard
- **Objective**
  - Set up Supabase browser/server clients and middleware session refresh to support server-authenticated routes.
- **Scope**
  - Add `lib/supabase/browser.ts` and `lib/supabase/server.ts`.
  - Add `middleware.ts` for session refresh behavior.
  - Add environment variable access helpers with startup validation.
  - Estimate: `0.5 day`
- **Acceptance Criteria**
  - Missing required env vars fail with clear startup/runtime error.
  - Middleware executes without breaking public routes.
  - Server code can read auth session from cookies.
- **Tests Required**
  - Unit: env var validation helper test.
  - E2E: none for this task.
- **Telemetry Required**
  - None.
- **Notes / Edge Cases**
  - Never expose service role key to client bundle.
  - Middleware matcher must avoid static asset paths.
- **Definition of Done Checklist**
  - [x] Supabase client utilities added and used.
  - [x] Middleware configured and verified.
  - [x] Env validation test passes.

## T3
- **Task Name**
  - Auth Validation and API Contract Scaffolding
- **Objective**
  - Implement shared request validation and standard API response/error contracts for auth routes.
- **Scope**
  - Add Zod schemas for apply/login/reset payloads.
  - Add `AuthErrorCode` enum and provider error mapper.
  - Add route-handler helpers for `ApiSuccess` / `ApiError` responses.
  - Estimate: `0.5 day`
- **Acceptance Criteria**
  - Invalid payloads return structured validation errors.
  - Auth routes return consistent JSON envelope shape.
  - Raw Supabase error text is not returned to UI.
- **Tests Required**
  - Unit: apply/login/reset schema pass/fail tests.
  - Unit: error mapper normalization tests.
  - E2E: none for this task.
- **Telemetry Required**
  - `auth_apply_failed`
  - `auth_login_failed`
- **Notes / Edge Cases**
  - Keep error mapping deterministic for repeatable tests.
  - Preserve unknown errors as `UNKNOWN`.
- **Definition of Done Checklist**
  - [x] Shared validation module is used by route handlers.
  - [x] Error mapping tests pass.
  - [x] Response contract examples added in code comments or docs.

## T4
- **Task Name**
  - Profiles Table, Trigger, and RLS Policies
- **Objective**
  - Create the database contract that proves profile write/read while enforcing per-user access.
- **Scope**
  - Add migration for `public.profiles`.
  - Add trigger function from `auth.users` to `public.profiles`.
  - Add RLS policies for select/insert/update own record only.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Signup creates exactly one profile row tied to user ID.
  - `callsign` uniqueness is enforced.
  - Cross-user profile read/write is denied by RLS.
- **Tests Required**
  - Unit: none.
  - E2E: indirect coverage through auth/protected-route tests.
  - Manual: SQL or API verification of RLS behavior with two users.
- **Telemetry Required**
  - `profile_created`
- **Notes / Edge Cases**
  - Handle missing callsign metadata with deterministic fallback.
  - Ensure migration is idempotent for repeat runs.
- **Definition of Done Checklist**
  - [x] Migration applied successfully in local Supabase.
  - [x] Trigger verified on signup path.
  - [x] RLS verified with second-user access test.

## T5
- **Task Name**
  - Apply Flow Implementation
- **Objective**
  - Deliver the application journey from form submission to under-review and accepted screens.
- **Scope**
  - Implement `/apply` form UI and API integration (`POST /api/auth/apply`).
  - Implement `/apply/review` and `/apply/accepted`.
  - Add loading/disabled submit state and user-friendly error rendering.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Valid apply submission creates auth user and routes to review then accepted flow.
  - Invalid input shows field-level validation.
  - Duplicate-account failures show sanitized messages.
- **Tests Required**
  - Unit: apply form schema and submit-state behavior.
  - E2E: apply flow reaches accepted screen.
- **Telemetry Required**
  - `auth_apply_submitted`
  - `auth_apply_succeeded`
  - `auth_apply_failed`
  - `profile_created`
- **Notes / Edge Cases**
  - Prevent duplicate submits while request is pending.
  - Keep copy in-world and consistent with brand tone.
- **Definition of Done Checklist**
  - [x] Apply API route and UI are connected.
  - [x] Apply E2E test passes.
  - [x] Required apply events are emitted.

## T6
- **Task Name**
  - Login, Logout, and Password Reset Flows
- **Objective**
  - Implement complete returning-user auth workflows and session exit path.
- **Scope**
  - Implement `/login` and `/reset-password` pages with API integration.
  - Implement `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/reset-password`.
  - Add logout action in shared header when session exists.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Valid login routes user to `/archive`.
  - Invalid login shows sanitized error.
  - Reset flow always returns generic confirmation.
  - Logout removes access to `/archive`.
- **Tests Required**
  - Unit: login/reset payload schema tests.
  - E2E: login success, invalid login handling, logout redirect behavior.
- **Telemetry Required**
  - `auth_login_succeeded`
  - `auth_login_failed`
  - `auth_password_reset_requested`
  - `auth_logout`
- **Notes / Edge Cases**
  - Avoid account enumeration in reset flow.
  - Preserve form values after network error where possible.
- **Definition of Done Checklist**
  - [x] Login/logout/reset APIs are functional.
  - [x] Auth E2E tests pass.
  - [x] Required login/reset/logout events are emitted.

## T7
- **Task Name**
  - Protected Archive Access Route
- **Objective**
  - Implement server-protected `/archive` with profile read and required placeholder content.
- **Scope**
  - Add server-side auth guard in `/archive/page.tsx`.
  - Fetch signed-in user's profile callsign from `public.profiles`.
  - Render callsign, clearance placeholder, and "Case Library is coming soon" panel.
  - Add fallback UI for profile read failures.
  - Estimate: `0.5 day`
- **Acceptance Criteria**
  - Unauthenticated direct navigation to `/archive` redirects to `/login`.
  - Authenticated user sees callsign from DB, not hardcoded value.
  - Profile read failure shows fallback state without crashing.
- **Tests Required**
  - Unit: optional profile view model test.
  - E2E: protected redirect + authenticated archive render.
- **Telemetry Required**
  - `archive_access_viewed`
  - `profile_load_failed`
- **Notes / Edge Cases**
  - Guard must run on server before rendering protected content.
  - Keep archive UI intentionally minimal for Phase 1.
- **Definition of Done Checklist**
  - [x] Server auth guard implemented.
  - [x] Callsign DB render verified.
  - [x] Protected route E2E assertions pass.

## T8
- **Task Name**
  - Analytics Adapter and Event Plumbing
- **Objective**
  - Implement a centralized analytics adapter and wire all required Phase 1 events.
- **Scope**
  - Add `trackEvent()` abstraction and provider switch (PostHog or console).
  - Define typed event payload contracts.
  - Wire event calls into auth routes and archive page.
  - Estimate: `0.5 day`
- **Acceptance Criteria**
  - All required Phase 1 events can be emitted through one adapter.
  - Event payloads include required common properties.
  - Adapter can run with PostHog disabled (no runtime crash).
- **Tests Required**
  - Unit: event payload builder/shape tests.
  - Integration: verify dispatch on `auth_login_succeeded` and `archive_access_viewed`.
  - E2E: covered indirectly by auth/archive flows.
- **Telemetry Required**
  - `auth_apply_submitted`
  - `auth_apply_succeeded`
  - `auth_apply_failed`
  - `auth_login_succeeded`
  - `auth_login_failed`
  - `auth_password_reset_requested`
  - `auth_logout`
  - `archive_access_viewed`
  - `profile_created`
  - `profile_load_failed`
- **Notes / Edge Cases**
  - Do not include full email in event payloads; domain only where required.
  - Event failures must not block user flow.
- **Definition of Done Checklist**
  - [x] Analytics adapter implemented and documented.
  - [x] Required events wired and validated.
  - [x] Event tests pass.

## T9
- **Task Name**
  - Baseline Automated Test Coverage
- **Objective**
  - Deliver the minimum required unit and e2e test coverage for phase exit.
- **Scope**
  - Finalize Vitest config and test scripts.
  - Finalize Playwright setup and environment handling.
  - Implement required baseline tests from requirements/design docs.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - At least one unit test and one E2E test pass in local run.
  - E2E covers signup/login to protected route visibility.
  - Test commands are deterministic and documented.
- **Tests Required**
  - Unit: schema or error-mapper test suite.
  - E2E: signup/login -> `/archive` with callsign assertion.
- **Telemetry Required**
  - `auth_login_succeeded`
  - `archive_access_viewed`
- **Notes / Edge Cases**
  - Avoid flaky selectors; use stable test IDs.
  - Isolate test users/data to avoid collisions.
- **Definition of Done Checklist**
  - [x] Required baseline tests implemented.
  - [x] Local test run is green.
  - [x] CI-friendly test commands confirmed.

## T10
- **Task Name**
  - Deployment Proof and Developer Onboarding
- **Objective**
  - Prove production deployment works and ensure a new developer can run locally within 15 minutes.
- **Scope**
  - Configure Vercel environment variables.
  - Execute production smoke test for apply/login/archive/logout.
  - Update README with setup, env, run, and test instructions.
  - Document known setup pitfalls and resolution notes.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Production deployment is reachable and auth flow works.
  - README setup path is complete and reproducible.
  - Smoke test checklist is completed and recorded.
- **Tests Required**
  - Unit: none.
  - E2E: existing suite passes against local/preview as applicable.
  - Manual: production smoke test.
- **Telemetry Required**
  - `auth_login_succeeded`
  - `archive_access_viewed`
  - `auth_logout`
- **Notes / Edge Cases**
  - Confirm production Supabase redirect URLs include auth/reset paths.
  - Keep secrets out of docs and screenshots.
- **Definition of Done Checklist**
  - [ ] Production smoke test completed.
  - [x] README updated and reviewed.
  - [x] Exit criteria evidence captured.

---

## 4) Phase-Level Exit Gate Mapping

- P0 requirements are covered by T1 through T10.
- Test baseline requirement (unit + E2E) is primarily satisfied by T9.
- Deployment and setup requirements are primarily satisfied by T10.
- Any changes to requirements or design must update this task plan before implementation diverges.
