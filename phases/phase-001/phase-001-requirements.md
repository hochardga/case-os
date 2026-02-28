# Ashfall Case Library — Phase 1 Requirements

**Phase:** Phase 1 — Foundation "Hello World"  
**Source Scope:** `phases/phase-001/phase-001-definition.md`  
**Process Step:** Step 2 — Phase Requirements  
**Date:** 2026-02-27  
**Status:** Draft

---

## 1) Purpose

Define the implementable, testable requirements for Phase 1 so implementation and testing can proceed with this document as the source of truth.

---

## 2) Scope Alignment

### 2.1 In Scope (this phase)
- Next.js application foundation using declared stack.
- Immersive but lightweight Ashfall branding shell.
- Supabase authentication flows: apply/register, login, logout, password reset.
- Server-protected route ("Archive Access") with profile data display.
- Database write/read proof using a minimal `profiles` table.
- Production deployment proof on Vercel connected to Supabase.

### 2.2 Out of Scope (this phase)
- Case library browsing and case gameplay loops.
- Admin ingestion and publishing tools.
- Hints, objective submissions, evidence viewer.
- Paywall/entitlements.
- AI generation features.

---

## 3) User Stories and Journeys

### 3.1 User Stories

1. As an applicant, I want to apply with email, password, and callsign so I can create an Ashfall account.
2. As an applicant, I want to see "Application under review" and then "Accepted" states so onboarding feels in-world.
3. As a returning user, I want to log in and stay logged in after refresh so I can continue without reauthenticating.
4. As a user, I want to reset my password so I can recover access.
5. As an authenticated user, I want to access an Archive page that shows my callsign from the database.
6. As an unauthenticated visitor, I want protected routes to redirect me to authentication.
7. As a developer, I want documented setup and a passing build/test baseline so new contributors can run the project quickly.

### 3.2 Journey A — Apply to Archive Access

1. User opens auth entry screen.
2. User submits apply form with `email`, `password`, `callsign`.
3. System creates auth account and profile row.
4. User sees "Application under review..." screen.
5. User proceeds to "Accepted" screen.
6. User enters protected Archive Access page.
7. Archive Access page displays callsign from `profiles`.

### 3.3 Journey B — Login, Refresh, Logout

1. User logs in with valid credentials.
2. User reaches Archive Access.
3. User refreshes browser.
4. Session remains valid and Archive Access remains available.
5. User logs out.
6. Next access attempt to Archive Access is denied and redirected.

### 3.4 Journey C — Password Reset

1. User starts reset flow from auth UI.
2. System requests password reset via Supabase.
3. User receives reset confirmation state in UI.
4. User can authenticate with the updated password.

---

## 4) Functional Requirements

Priority legend: `P0` must ship for phase completion, `P1` should ship if low risk, `P2` can defer.

### 4.1 P0 Requirements

**FR-P1-001 (P0) App Foundation**  
The app shall use Next.js App Router with strict TypeScript and Tailwind configured and buildable.
- Testability:
  - `npm run build` succeeds.
  - Type checking passes.

**FR-P1-002 (P0) UI Shell**  
The app shall provide a shared layout shell with header, main content area, and footer.
- Testability:
  - Shell is visible on public auth screens and protected Archive Access screen.

**FR-P1-003 (P0) Brand Framing**  
Top-level copy shall consistently use product and agency names:
- Product: "Ashfall Case Library"
- Agency: "Ashfall Investigative Collective"
- Testability:
  - Copy appears on auth and protected screens.

**FR-P1-004 (P0) Apply/Registration Flow**  
The app shall allow account creation with required inputs `email`, `password`, `callsign`.
- Testability:
  - Valid submission creates auth account.
  - Invalid input returns field-level validation errors.

**FR-P1-005 (P0) Under Review and Accepted States**  
After successful apply, UI shall show:
1. "Application under review..." state.
2. "Accepted" state with CTA to continue.
- Testability:
  - Both states are rendered in happy path.

**FR-P1-006 (P0) Login Flow**  
The app shall authenticate existing users via Supabase and route them to Archive Access on success.
- Testability:
  - Valid credentials succeed.
  - Invalid credentials show non-technical error message.

**FR-P1-007 (P0) Logout Flow**  
Authenticated users shall be able to sign out and lose protected-route access.
- Testability:
  - After logout, protected route redirects to auth.

**FR-P1-008 (P0) Password Reset**  
The app shall provide a minimum viable password reset flow via Supabase.
- Testability:
  - Reset request can be initiated from auth UI.
  - UI confirms reset initiation without exposing account existence.

**FR-P1-009 (P0) Session Persistence**  
Auth session shall persist across page refresh.
- Testability:
  - Refresh while authenticated retains access to protected route.

**FR-P1-010 (P0) Server-Side Protected Route Guard**  
`/archive` (or equivalent protected route) shall enforce auth server-side, not client-only.
- Testability:
  - Direct navigation while unauthenticated redirects before protected content is rendered.

**FR-P1-011 (P0) Archive Access Screen Content**  
Protected screen shall display:
- User callsign
- Clearance placeholder (static)
- "Case Library is coming soon" placeholder panel
- Testability:
  - All three elements visible for authenticated user.

**FR-P1-012 (P0) Profile Write on Signup**  
On successful account creation, system shall create one `profiles` row keyed to user ID.
- Testability:
  - New user has exactly one profile record.

**FR-P1-013 (P0) Profile Read on Protected Route**  
Protected route shall fetch profile and render callsign from database.
- Testability:
  - Callsign displayed on protected page matches stored profile record.

**FR-P1-014 (P0) Production Deployment Proof**  
Application shall deploy to Vercel with Supabase env vars configured and working auth flow in production.
- Testability:
  - Production URL reachable.
  - Apply/login/protected route tested in production.

**FR-P1-015 (P0) Setup Documentation**  
Repository shall include README setup instructions enabling a new developer to run locally in <= 15 minutes.
- Testability:
  - Dry run of README steps on clean environment succeeds.

**FR-P1-016 (P0) Test Baseline**  
Phase shall include:
- At least one Playwright E2E test covering signup/login to protected route.
- At least one unit test (or equivalent type-level validation harness test).
- Testability:
  - Required test suite entries exist and pass in CI/local.

### 4.2 P1 Requirements

**FR-P1-101 (P1) Auth Error UX Quality**  
Auth errors shall be user-friendly and in-world where practical (no raw provider error dumps).
- Testability:
  - Simulated invalid login/reset failures show sanitized messages.

**FR-P1-102 (P1) Loading/Disabled States on Auth Actions**  
Submit actions shall show pending state and prevent duplicate submissions.
- Testability:
  - Buttons disable while request is in progress.

**FR-P1-103 (P1) Schema Validation with Zod**  
Auth form inputs shall be validated with shared schema definitions.
- Testability:
  - Invalid inputs fail schema parsing in unit tests.

### 4.3 P2 Requirements

**FR-P1-201 (P2) Optional Sentry Bootstrap**  
Sentry can be initialized for basic error capture if low effort.
- Testability:
  - Intentional test error appears in Sentry project (if enabled).

---

## 5) Non-Functional Requirements

### 5.1 Performance

**NFR-P1-PERF-001 (P0)**  
Protected page shall complete initial profile query in a single request path and render without unnecessary chained fetches.
- Testability:
  - Network inspection confirms one profile fetch on route load.

**NFR-P1-PERF-002 (P1)**  
Auth pages shall avoid loading non-phase assets (case media/evidence bundles).
- Testability:
  - Bundle/network inspection shows no case content payload on auth routes.

### 5.2 Security

**NFR-P1-SEC-001 (P0)**  
Protected route authorization shall be enforced server-side.
- Testability:
  - Unauthenticated direct request does not return protected payload.

**NFR-P1-SEC-002 (P0)**  
`profiles` access policy shall prevent users from reading/updating other users' profiles.
- Testability:
  - RLS policy test or manual SQL/API check denies cross-user access.

**NFR-P1-SEC-003 (P0)**  
Secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, service credentials) shall be provided via environment variables only.
- Testability:
  - No credentials committed in repository history for phase files.

### 5.3 Reliability

**NFR-P1-REL-001 (P0)**  
Signup flow shall not leave orphaned profile records on failed auth creation.
- Testability:
  - Forced signup failure does not create profile row.

**NFR-P1-REL-002 (P1)**  
Protected route shall show a fallback state if profile read fails (instead of crashing).
- Testability:
  - Simulated DB error shows fallback/error UI.

### 5.4 UX and Accessibility

**NFR-P1-UX-001 (P0)**  
Auth and protected screens shall be usable on mobile and desktop breakpoints.
- Testability:
  - Manual verification at 375px and 1280px widths.

**NFR-P1-UX-002 (P1)**  
Forms shall include labels, focus states, and keyboard-submittable controls.
- Testability:
  - Keyboard-only apply/login flow succeeds.

---

## 6) Analytics Events Required (Phase 1)

Phase 1 requires a minimal event instrumentation layer. Events may be sent to PostHog or logged through a temporary analytics adapter if PostHog is deferred.

### 6.1 Event Contract

Common properties on all events:
- `event_name` (string)
- `user_id` (nullable string; null for anonymous events)
- `session_id` (string)
- `timestamp` (ISO 8601 string, UTC)
- `source` (enum: `web_client` | `server`)
- `phase` (constant string: `phase-001`)

### 6.2 Required Events

1. `auth_apply_submitted`
   - Properties: `callsign_length` (number), `email_domain` (string, redacted domain only)
2. `auth_apply_succeeded`
   - Properties: `user_id` (string)
3. `auth_apply_failed`
   - Properties: `error_code` (string), `is_validation_error` (boolean)
4. `auth_login_succeeded`
   - Properties: `user_id` (string), `method` (enum: `password`)
5. `auth_login_failed`
   - Properties: `error_code` (string)
6. `auth_password_reset_requested`
   - Properties: `email_domain` (string)
7. `auth_logout`
   - Properties: `user_id` (string)
8. `archive_access_viewed`
   - Properties: `user_id` (string), `clearance_label` (string)
9. `profile_created`
   - Properties: `user_id` (string), `callsign` (string)
10. `profile_load_failed`
    - Properties: `user_id` (string), `error_code` (string)

### 6.3 Analytics Testability
- At least one automated test or integration assertion verifies event emission for:
  - `auth_login_succeeded`
  - `archive_access_viewed`

---

## 7) Content and Data Contracts

### 7.1 Schema: Apply Form Payload

Contract ID: `CONTRACT-P1-APPLY-001`

```ts
type ApplyInput = {
  email: string;      // valid email format, normalized lowercase
  password: string;   // min 8 chars
  callsign: string;   // 3-24 chars, letters/numbers/_/-
};
```

Constraints:
- `email`: must pass RFC-like email validation via Zod `.email()`.
- `password`: minimum 8 characters.
- `callsign`: regex `^[A-Za-z0-9_-]{3,24}$`; case-preserving for display.

### 7.2 Database Contract: `profiles` Table

Contract ID: `CONTRACT-P1-PROFILE-001`

Table: `public.profiles`
- `id uuid primary key`  
  - Foreign key to `auth.users(id)`  
  - `on delete cascade`
- `callsign text not null unique`
- `created_at timestamptz not null default now()`

Constraints:
- One profile per auth user.
- `callsign` uniqueness enforced at DB layer.

### 7.3 Authorization Contract

Contract ID: `CONTRACT-P1-AUTHZ-001`

RLS requirements for `profiles`:
- Select: user can read only row where `profiles.id = auth.uid()`
- Insert: user can insert only row where `profiles.id = auth.uid()`
- Update (if enabled): user can update only own row

### 7.4 UI State Contract (Auth Flow)

Contract ID: `CONTRACT-P1-STATE-001`

Enum `application_state`:
- `idle`
- `submitting`
- `under_review`
- `accepted`
- `error`

Transition constraints:
- `submitting -> under_review | error`
- `under_review -> accepted`

### 7.5 Error Contract

Contract ID: `CONTRACT-P1-ERROR-001`

Enum `auth_error_code` (phase minimum):
- `INVALID_CREDENTIALS`
- `EMAIL_ALREADY_IN_USE`
- `WEAK_PASSWORD`
- `RATE_LIMITED`
- `UNKNOWN`

UI must map provider errors to this enum before rendering to user.

---

## 8) Phase Acceptance Criteria

Phase 1 is accepted only when all criteria below are satisfied.

1. **Build and Quality Gate**
   - `npm run build` passes.
   - Lint/type checks pass.

2. **Auth Flow Completeness**
   - Apply, under-review, accepted, login, logout, and password reset flows work end-to-end.

3. **Protected Route Enforcement**
   - Unauthenticated users cannot access Archive Access.
   - Authenticated users can access Archive Access after login.

4. **Database Proof**
   - Profile row is created during apply/signup.
   - Protected route reads and displays callsign from profile table.

5. **Session Behavior**
   - Session survives browser refresh.
   - Logout revokes protected access immediately.

6. **Telemetry Minimum**
   - Required Phase 1 events are emitted through analytics adapter.

7. **Deployment Proof**
   - Vercel production deployment is live and connected to Supabase.
   - Production smoke test confirms auth + protected route behavior.

8. **Test Coverage Minimum**
   - >=1 Playwright E2E test covers signup/login -> protected route.
   - >=1 unit/schema test validates input or contract logic.

9. **Developer Onboarding**
   - README setup allows a new developer to run locally in <= 15 minutes.

---

## 9) Traceability Notes

- This document is derived from the phase scope definition and is intentionally limited to foundation and auth plumbing.
- Any implementation decision that materially changes these requirements must update this file before or with code changes.

