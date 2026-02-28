# Ashfall Case Library — Phase 2 Requirements

**Phase:** Phase 2 — Authentication UX Hardening  
**Source Scope:** `phases/phase-002/phase-002-definition.md`  
**Process Step:** Step 2 — Phase Requirements  
**Date:** 2026-02-28  
**Status:** Draft

---

## 1) Purpose

Define the implementable, testable requirements for Phase 2 authentication hardening so this document is the source of truth for implementation, tests, and review.

---

## 2) Scope Alignment

### 2.1 In Scope (this phase)
- Auth-aware navigation that is accurate, server-validated, and flicker-free.
- Registration UX hardening (validation clarity, duplicate handling, sanitized errors).
- Email verification enforcement with resend verification path.
- Login UX hardening with generic failure messaging.
- Complete password reset UX including tokenized reset and invalid/expired token handling.
- Logout correctness and protected-route invalidation.
- Session management hardening (cookie handling, expiration UX).
- Minimal abuse protection (rate limits on login and reset).
- Accessibility baseline on auth forms.
- Basic privacy/compliance surface (Privacy/Terms links and account deletion request UX).
- Auth analytics for flow quality and security outcomes.

### 2.2 Out of Scope (this phase)
- MFA (TOTP/SMS/passkeys), social login, enterprise SSO.
- Device/session management dashboard.
- Advanced fraud detection.
- Billing/entitlements and role management UI.
- Full GDPR tooling beyond basic deletion request initiation.
- Magic-link-only login redesign.

---

## 3) User Stories and Journeys

### 3.1 User Stories

1. As a visitor, I want navigation to clearly show only the actions available to my auth state so I do not hit dead ends.
2. As an applicant, I want clear validation and safe duplicate-account handling during apply so I can recover without support.
3. As a new user, I want email verification to be explicit and recoverable if links expire so I can complete onboarding.
4. As a returning user, I want login and session restore to be reliable and predictable so I can resume quickly.
5. As a user who forgot my password, I want a secure, neutral reset flow that does not expose account existence.
6. As an authenticated user, I want logout and session expiry behavior to consistently protect restricted pages.
7. As a privacy-conscious user, I want visible Terms/Privacy and a clear account deletion request entry point.

### 3.2 Journey A — Apply with Existing Email (Enumeration Safe)

1. User opens Apply screen and submits valid form with an already-registered email.
2. System returns neutral message that does not confirm account existence.
3. UI presents `Log In` and `Reset Password` actions.
4. No raw provider error is shown.

### 3.3 Journey B — New Registration to Verified Access

1. User submits valid apply form.
2. System creates account in unverified state and shows inbox verification instruction.
3. User attempts login before verification and is blocked with verification-specific guidance.
4. User verifies via email link.
5. User logs in and reaches protected destination (or preserved `next` destination).

### 3.4 Journey C — Password Reset End-to-End

1. User opens Forgot Password and submits email.
2. System always returns neutral confirmation.
3. User opens tokenized reset link.
4. User sets and confirms new password.
5. System confirms success and allows login with new password.
6. Expired/invalid/reused token path shows recoverable error and request-new-link CTA.

### 3.5 Journey D — Session Expiration and Logout Safety

1. Authenticated user accesses protected route.
2. Session expires (or user logs out).
3. Protected route access is blocked on next request.
4. User is redirected to login with a clear session-expired or post-logout state.
5. Browser back navigation does not reveal protected content.

---

## 4) Functional Requirements

Priority legend: `P0` must ship for phase completion, `P1` should ship if low risk, `P2` can defer.

### 4.1 P0 Requirements

**FR-P2-001 (P0) Auth-State Navigation Accuracy**  
The shell navigation shall render links by authenticated state:
- Unauthenticated: show `Apply`, `Log In`; hide `Archive`, `Candidate File`, `Log Out`.
- Authenticated: show `Archive`, `Candidate File`, `Log Out`; hide `Apply`, `Log In`.
- Testability:
  - Component/server-render tests for both states pass.
  - E2E validates expected links on each state.

**FR-P2-002 (P0) Server-Validated Route Protection + Intent Preservation**  
Protected routes shall redirect unauthenticated users to login and preserve intended destination.
- Testability:
  - Direct request to protected route while unauthenticated redirects to `/login?next=<path>`.
  - After successful login, user is redirected to preserved `next` path.

**FR-P2-003 (P0) No Auth Flicker on Initial Render**  
Auth-dependent navigation and protected pages shall not flash incorrect state during session hydration.
- Testability:
  - E2E visual/assertion checks confirm no transient display of unauthorized links/content.

**FR-P2-004 (P0) Registration Validation Hardening**  
Apply flow shall validate email/password/callsign on client and server via shared Zod schemas and show password requirements before submit.
- Testability:
  - Invalid payloads rejected on server with field errors.
  - UI displays requirements and field-level validation messages.

**FR-P2-005 (P0) Callsign Uniqueness Enforcement**  
Callsign shall be unique at persistence layer and produce user-safe error mapping on conflicts.
- Testability:
  - Duplicate callsign signup attempt returns conflict-class error.
  - DB constraint prevents duplicate profile callsigns.

**FR-P2-006 (P0) Duplicate Email Handling Without Enumeration**  
Duplicate email apply shall show neutral copy:  
`An account may already exist for this email.`  
and CTAs for login and password reset.
- Testability:
  - Duplicate and non-duplicate branches do not expose existence confirmation.
  - UI includes both recovery CTAs.

**FR-P2-007 (P0) Email Verification Enforcement**  
Unverified users shall be unable to access protected Archive flow until verified.
- Testability:
  - Post-apply state shows inbox verification instruction.
  - Login attempt from unverified account is blocked with verification guidance.
  - Verified account login succeeds.

**FR-P2-008 (P0) Verification Link Expiration + Resend Flow**  
Expired verification links shall show explicit expired state and allow resend verification action.
- Testability:
  - Expired token path returns `Verification link expired.` UI message.
  - Resend action dispatches verification email and returns neutral success.

**FR-P2-009 (P0) Login UX Hardening**  
Login shall support email/password with loading state and generic failure copy:  
`Invalid email or password.`
- Testability:
  - Wrong-email and wrong-password failures map to same user-visible error.
  - Submit button enters pending/disabled state during request.

**FR-P2-010 (P0) Password Reset Request Neutrality**  
Forgot password request shall always return neutral confirmation copy independent of account existence.
- Testability:
  - Existing and non-existing emails return same response body and status class.

**FR-P2-011 (P0) Tokenized Reset Password Completion**  
Reset password page shall validate token/session, require `new_password` + `confirm_password`, enforce password rules, and show success confirmation.
- Testability:
  - Valid token accepts matching compliant password and confirms success.
  - Mismatch/non-compliant password yields field errors.

**FR-P2-012 (P0) Invalid/Expired/Reused Reset Token UX**  
Reset token failures shall show recoverable message and CTA to request a new link.
- Testability:
  - Invalid, expired, and reused token paths render error state with request-new-link CTA.

**FR-P2-013 (P0) Logout Safety and Redirect**  
Logout shall clear auth session, redirect to public landing page, and immediately block protected routes.
- Testability:
  - Post-logout access to protected route redirects to login.
  - Browser back does not reveal protected content.

**FR-P2-014 (P0) Session Expiry UX**  
When session expires, user shall be redirected to login with message:  
`Your session has expired. Please log in again.`
- Testability:
  - Simulated expired session produces redirect and message on next protected navigation.

**FR-P2-015 (P0) Sanitized Error Surface**  
Auth UI/API shall map provider errors to internal codes and user-safe copy; no raw Supabase error strings or stack traces may be shown.
- Testability:
  - Unit tests for mapper cover known provider errors.
  - E2E confirms user-visible messages are sanitized.

**FR-P2-016 (P0) Minimal Abuse Protection**  
Login attempts and password reset requests shall be rate-limited with short cooldown behavior.
- Testability:
  - Repeated failures trigger rate-limit response with retry guidance.
  - Cooldown clears after configured window.

**FR-P2-017 (P0) Accessibility Baseline on Auth Flows**  
Auth screens shall be keyboard-operable and use proper label, focus, and error semantics.
- Testability:
  - Keyboard-only traversal and submit succeeds.
  - Form controls have associated labels and ARIA-linked errors.

**FR-P2-018 (P0) Privacy + Terms Visibility**  
Apply/Login/Reset surfaces shall include Privacy Statement and Terms links plus account-data-use statement.
- Testability:
  - Links are visible and navigate to non-404 destinations.
  - Data-use statement text renders on auth entry surfaces.

### 4.2 P1 Requirements

**FR-P2-101 (P1) Candidate File Entry Point**  
Authenticated shell shall expose `Candidate File` destination (full profile editing can remain minimal).
- Testability:
  - Authenticated nav contains `Candidate File` link to implemented route.

**FR-P2-102 (P1) Account Deletion Request UX**  
User shall be able to initiate account deletion request via explicit button + confirmation step.
- Testability:
  - Confirmation step is required before request submission.
  - Deletion request event is logged and user sees confirmation state.

**FR-P2-103 (P1) Auth Service Outage Message Consistency**  
When auth upstream is unavailable, user sees generic service-unavailable message with retry guidance.
- Testability:
  - Simulated 5xx/upstream failure maps to `Service temporarily unavailable.`

**FR-P2-104 (P1) Verification/Reset Resend Cooldown UX**  
Resend actions shall show cooldown countdown/disabled state to reduce repeated spam clicks.
- Testability:
  - Repeated resend attempts before cooldown expiration are blocked client-side and server-side.

### 4.3 P2 Requirements

**FR-P2-201 (P2) Login Risk Telemetry Enrichment**  
Capture optional aggregate indicators (for example repeated failures per IP hash bucket) for future anti-abuse tuning.
- Testability:
  - Event payload includes anonymized risk counters where available.

---

## 5) Non-Functional Requirements

### 5.1 Performance

**NFR-P2-PERF-001 (P0)**  
Auth pages must maintain responsive interaction under normal load; submit action should show pending feedback within 150 ms of click.
- Testability:
  - UI test asserts pending state appears immediately after submit.

**NFR-P2-PERF-002 (P1)**  
Protected route redirects for unauthenticated access should complete in a single server round-trip without rendering protected content.
- Testability:
  - E2E/network trace confirms redirect before protected data render.

### 5.2 Security

**NFR-P2-SEC-001 (P0)**  
Account existence must not be disclosed by registration, login, or password-reset responses.
- Testability:
  - Response/message parity checks for existent vs non-existent accounts.

**NFR-P2-SEC-002 (P0)**  
Sessions must use HTTP-only cookies and must not store auth tokens in localStorage/sessionStorage.
- Testability:
  - Runtime inspection confirms no auth token persistence in web storage.

**NFR-P2-SEC-003 (P0)**  
Auth endpoints must enforce request validation (Zod) and return structured error payloads only.
- Testability:
  - Invalid payload integration tests return `VALIDATION_ERROR` with field errors.

**NFR-P2-SEC-004 (P0)**  
Rate limiting must apply to login and reset endpoints with deterministic 429 behavior.
- Testability:
  - Load test script or integration test triggers 429 after threshold.

### 5.3 Reliability

**NFR-P2-REL-001 (P0)**  
Auth backend failures must degrade gracefully with user-safe fallback messaging.
- Testability:
  - Simulated provider outage path returns controlled error and no crash.

**NFR-P2-REL-002 (P1)**  
Verification and reset token error states must be idempotent and recoverable.
- Testability:
  - Reopening invalid/used token link repeatedly yields stable UX and recovery CTA.

### 5.4 UX and Accessibility

**NFR-P2-UX-001 (P0)**  
Auth forms must be fully usable at 375 px and 1280 px viewport widths.
- Testability:
  - Manual or snapshot checks at both breakpoints pass.

**NFR-P2-UX-002 (P0)**  
Error communication must be text-based and not rely solely on color.
- Testability:
  - Visual review verifies explicit textual errors for all invalid states.

**NFR-P2-UX-003 (P1)**  
Focus management must move to first error on failed submit and to confirmation headline on success states.
- Testability:
  - Keyboard-driven integration test verifies focus target transitions.

---

## 6) Analytics Events Required (Phase 2)

Phase 2 keeps Phase 1 auth events and adds hardening-specific events.

### 6.1 Common Event Contract

Every event must include:
- `event_name` (string)
- `user_id` (nullable string)
- `session_id` (string)
- `timestamp` (ISO 8601 UTC)
- `source` (enum: `web_client` | `server`)
- `phase` (constant string: `phase-002`)

### 6.2 Required Events

1. `auth_nav_state_rendered`  
   Properties: `is_authenticated` (boolean), `has_flicker` (boolean)
2. `auth_apply_submitted`  
   Properties: `callsign_length` (number), `email_domain` (string)
3. `auth_apply_failed`  
   Properties: `error_code` (string), `is_validation_error` (boolean)
4. `auth_apply_duplicate_email_hint_shown`  
   Properties: `email_domain` (string)
5. `auth_verification_prompt_shown`  
   Properties: `delivery_channel` (enum: `email`)
6. `auth_verification_resend_requested`  
   Properties: `email_domain` (string)
7. `auth_login_succeeded`  
   Properties: `user_id` (string|null), `method` (enum: `password`), `redirect_target` (string)
8. `auth_login_failed`  
   Properties: `error_code` (string)
9. `auth_login_blocked_unverified`  
   Properties: `email_domain` (string)
10. `auth_password_reset_requested`  
    Properties: `email_domain` (string)
11. `auth_password_reset_token_invalid`  
    Properties: `reason` (enum: `expired` | `invalid` | `reused`)
12. `auth_password_updated`  
    Properties: `method` (enum: `reset_token`)
13. `auth_rate_limited`  
    Properties: `action` (enum: `login` | `password_reset` | `verification_resend`), `retry_after_seconds` (number)
14. `auth_session_expired`  
    Properties: `route` (string)
15. `auth_logout`  
    Properties: `user_id` (string|null), `initiator` (enum: `user` | `system`)
16. `auth_account_deletion_requested`  
    Properties: `user_id` (string|null), `request_channel` (enum: `self_service`)

### 6.3 Analytics Testability

- Automated tests must assert emission of:
  - `auth_login_succeeded`
  - `auth_login_failed`
  - `auth_password_reset_requested`
  - `auth_password_updated`
  - `auth_rate_limited`
- At least one E2E flow verifies event emission around duplicate-email or unverified-login path.

---

## 7) Content and Data Contracts

### 7.1 Input Schema Contracts

Contract ID: `CONTRACT-P2-AUTH-INPUT-001`

```ts
type ApplyInput = {
  email: string;      // normalized lowercase, valid email format
  password: string;   // minimum 8 chars
  callsign: string;   // 3-24 chars, [A-Za-z0-9_-]
};

type LoginInput = {
  email: string;      // normalized lowercase
  password: string;   // required non-empty
  next?: string;      // optional relative redirect path
};

type ForgotPasswordInput = {
  email: string;      // normalized lowercase
};

type ResetPasswordInput = {
  token: string;              // one-time token from reset link
  new_password: string;       // registration password policy
  confirm_password: string;   // must equal new_password
};

type ResendVerificationInput = {
  email: string;      // normalized lowercase
};
```

Constraints:
- Email validation is enforced client+server with identical schema semantics.
- Password policy is shared between apply and reset update.
- `next` must be a safe relative path; absolute URLs are rejected.

### 7.2 API Response Contract

Contract ID: `CONTRACT-P2-AUTH-API-001`

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiError = {
  ok: false;
  error: {
    code: AuthErrorCode | "VALIDATION_ERROR";
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
    retryAfterSeconds?: number;
  };
};
```

Constraints:
- All auth endpoints return only `ApiSuccess` or `ApiError`.
- No raw provider message is passed through directly to UI.

### 7.3 Error and State Enum Contracts

Contract ID: `CONTRACT-P2-AUTH-ENUM-001`

```ts
type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_IN_USE"
  | "CALLSIGN_ALREADY_IN_USE"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED"
  | "UNVERIFIED_EMAIL"
  | "TOKEN_INVALID_OR_EXPIRED"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";

type AuthFlowState =
  | "idle"
  | "submitting"
  | "needs_verification"
  | "success"
  | "rate_limited"
  | "error";
```

Constraints:
- Error mapping layer must map provider/internal failures into this enum set.
- UI messages are determined by mapped code, not by raw upstream text.

### 7.4 Data Persistence Contracts

Contract ID: `CONTRACT-P2-PROFILE-001`

Table: `public.profiles`
- `id uuid primary key` (FK to `auth.users(id)`, `on delete cascade`)
- `callsign text not null`
- `created_at timestamptz not null default now()`

Constraints:
- One profile per auth user.
- Callsign uniqueness must be DB-enforced.
- Callsign uniqueness is case-insensitive (`lower(callsign)` unique index or equivalent).

### 7.5 Session and Cookie Contracts

Contract ID: `CONTRACT-P2-SESSION-001`

Session expectations:
- Auth session token/cookie is HTTP-only.
- `Secure` flag enabled in production.
- `SameSite` configured (`lax` minimum).
- No auth token in localStorage/sessionStorage.

Constraints:
- Session refresh path must keep server and middleware cookie state synchronized.
- Expired session path must return deterministic redirect + session-expired UI message.

### 7.6 Rate Limit Contracts

Contract ID: `CONTRACT-P2-RATELIMIT-001`

```ts
type RateLimitedAction = "login" | "password_reset" | "verification_resend";
```

Constraints:
- Minimum protected actions: `login`, `password_reset`.
- Threshold and window must be configurable through env/application config.
- 429 response includes user-readable retry guidance and `retryAfterSeconds` where available.

### 7.7 Privacy and Compliance Content Contract

Contract ID: `CONTRACT-P2-CONTENT-001`

Required user-facing content:
- Privacy Statement link
- Terms link
- Data-use statement text:  
  `We store your email and profile information for account management.`
- Account deletion request CTA + confirmation text

Constraints:
- Links must be accessible from primary auth entry surfaces.
- Deletion request action must require explicit confirmation.

---

## 8) Phase Acceptance Criteria

Phase 2 is accepted only when all criteria below are satisfied.

1. **Navigation and Route Guard Correctness**
   - Auth-state navigation behavior matches requirements in both server and client renders.
   - Protected route redirect preserves destination and returns user post-login.

2. **Registration Hardening**
   - Apply flow enforces shared validation, shows password requirements, and handles duplicate email/callsign safely.
   - Duplicate email path uses neutral non-enumerating copy with recovery CTAs.

3. **Email Verification Enforcement**
   - Unverified accounts are blocked from protected archive access.
   - Expired verification path and resend flow are implemented and tested.

4. **Login Hardening**
   - Invalid login always returns generic message without email/password distinction.
   - Loading and disabled-submit UX is present.

5. **Password Reset Completion**
   - Forgot password request is neutral.
   - Reset link flow supports successful update and explicit invalid/expired/reused token handling.

6. **Session and Logout Correctness**
   - Logout immediately revokes protected access and redirects appropriately.
   - Session expiry path redirects with explicit session-expired guidance.

7. **Security and Abuse Baseline**
   - No raw provider errors or stack traces are user-visible.
   - Rate limiting is active for login and reset paths and returns deterministic behavior.
   - Auth tokens are not persisted in browser storage.

8. **Accessibility Baseline**
   - Keyboard-only use works on apply, login, forgot/reset flows.
   - Labels, focus states, and ARIA error associations meet baseline requirements.

9. **Privacy/Compliance Surface**
   - Terms and Privacy links are present on auth surfaces.
   - Account data-use statement is visible.
   - Account deletion request UX is present at least at request-confirmation level.

10. **Telemetry and Tests**
   - Required Phase 2 auth events are emitted.
   - Playwright coverage includes:
     - Register -> verify -> login -> protected route
     - Duplicate registration
     - Failed login
     - Password reset full cycle
     - Expired reset token
     - Logout then protected route blocked

11. **Documentation**
   - README is updated with auth flow behavior, env requirements, and session handling notes.

---

## 9) Traceability Notes

- This document is derived from `phases/phase-002/phase-002-definition.md` and maps each in-scope item to testable requirements and contracts.
- If implementation decisions change flow behavior, this file must be updated before or with corresponding code changes.
