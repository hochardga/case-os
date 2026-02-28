# Ashfall Case Library — Phase 2 Task Plan

**Phase:** Phase 2 - Authentication UX Hardening  
**Inputs:** `phase-002-definition.md`, `phase-002-requirements.md`, `phase-002-design.md`  
**Date:** 2026-02-28  
**Status:** Draft

---

## 1) Plan Overview

- Task sizing target: `0.5` to `1.5` days per task.
- Execution order is dependency-driven and intentionally incremental.
- Each task includes acceptance criteria, required tests, required telemetry, and a definition-of-done checklist.
- Any scope/design change during implementation must update this task plan first.

---

## 2) Task Sequence

1. T1 - Auth contracts, error mapping, and redirect safety utilities
2. T2 - Server-validated auth shell and protected-route intent preservation
3. T3 - Registration UX hardening and duplicate-safe handling
4. T4 - Verification callback and resend verification flow
5. T5 - Login hardening (generic errors, unverified block, next redirect)
6. T6 - Password reset request and password update completion flow
7. T7 - Logout correctness and session-expiration UX
8. T8 - Rate limiting infrastructure and endpoint enforcement
9. T9 - Candidate File and account deletion request flow
10. T10 - Privacy/Terms surfaces and accessibility baseline pass
11. T11 - Phase 2 analytics contract and instrumentation wiring
12. T12 - End-to-end test completion, docs updates, and phase exit evidence

---

## 3) Tickets

## T1
- **Task Name**
  - Auth Contracts and Validation Utilities
- **Objective**
  - Establish Phase 2 auth contracts and shared utilities so all subsequent route/component work uses consistent enums, schema rules, and safe redirect handling.
- **Scope**
  - Extend `AuthErrorCode` to Phase 2 set (`CALLSIGN_ALREADY_IN_USE`, `UNVERIFIED_EMAIL`, `TOKEN_INVALID_OR_EXPIRED`, `SERVICE_UNAVAILABLE`).
  - Update auth error mapper for Supabase/provider message coverage.
  - Add safe redirect utility for `next` query/path sanitization.
  - Extend auth validation schemas for:
    - login `next`
    - reset-password confirm payload (`newPassword`, `confirmPassword`)
    - resend verification payload
    - account deletion request payload
  - Ensure API envelope supports optional `retryAfterSeconds`.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - New error codes compile and are consumable across API and UI boundaries.
  - Redirect sanitizer rejects absolute/external URLs and accepts safe relative paths.
  - New schemas reject malformed payloads and normalize expected fields.
  - API response types include optional retry metadata without breaking existing consumers.
- **Tests Required**
  - Unit:
    - auth error mapper tests for new Phase 2 error codes.
    - redirect sanitizer tests (allow/deny cases).
    - schema tests for reset confirm, resend verification, account deletion request.
  - E2E:
    - none required for this task.
- **Telemetry Required**
  - None in this foundational task.
- **Notes / Edge Cases**
  - Keep mapping deterministic; avoid pass-through of raw provider messages.
  - Do not allow `next` values beginning with `//` or containing protocol prefixes.
- **Definition of Done Checklist**
  - [x] Phase 2 auth enums/types merged.
  - [x] Redirect utility added and used in login validation boundaries.
  - [x] Unit tests for mapper/schema/redirects pass.

## T2
- **Task Name**
  - Auth-State Shell and Protected Redirect Contract
- **Objective**
  - Make navigation and route protection fully state-aware, server-validated, and compatible with preserved destination redirects.
- **Scope**
  - Replace layout auth-state detection heuristic with server-validated user check.
  - Update `AppShell` nav behavior:
    - unauthenticated: `Apply`, `Log In`
    - authenticated: `Archive`, `Candidate File`, `Log Out`
  - Ensure protected routes redirect unauthenticated users to `/login?next=<safe_path>`.
  - Add login page support for carrying `next` through submit flow.
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Nav links match requirements for both auth states.
  - Unauthenticated protected access redirects with preserved safe destination.
  - Successful login returns user to preserved destination.
  - Protected content is not briefly rendered to unauthenticated users.
- **Tests Required**
  - Unit/component:
    - shell rendering for authenticated vs unauthenticated state.
  - E2E:
    - unauthenticated protected-route redirect includes `next`.
    - login with `next` returns user to intended page.
- **Telemetry Required**
  - `auth_nav_state_rendered`
- **Notes / Edge Cases**
  - Keep protected route enforcement server-side, not client-only.
  - Preserve deterministic fallback when `next` is missing or unsafe.
- **Definition of Done Checklist**
  - [x] Server-validated shell auth state in place.
  - [x] Protected redirect includes safe `next`.
  - [x] E2E route-intent tests pass.

## T3
- **Task Name**
  - Registration UX Hardening
- **Objective**
  - Harden apply flow validation, duplicate handling, and user messaging to remove ambiguity and account-enumeration leakage.
- **Scope**
  - Update apply form UX:
    - explicit password requirements display
    - loading/disabled submit state
    - accessible field/general errors
  - Update `/api/auth/apply` behavior:
    - safe duplicate email response copy
    - duplicate callsign conflict mapping
    - sanitized provider errors only
  - Update apply review state to verification-pending messaging.
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Apply form shows password requirements before submission.
  - Duplicate email attempt returns neutral copy and recovery options.
  - Duplicate callsign returns user-safe conflict response.
  - No raw Supabase/provider message is visible in UI.
- **Tests Required**
  - Unit/component:
    - apply schema validation cases.
    - apply form accessibility and pending-state behavior.
  - E2E:
    - duplicate registration path shows neutral message and recovery CTAs.
    - apply success reaches review screen with verification prompt.
- **Telemetry Required**
  - `auth_apply_submitted`
  - `auth_apply_failed`
  - `auth_apply_duplicate_email_hint_shown`
  - `auth_verification_prompt_shown`
- **Notes / Edge Cases**
  - Handle metadata/DB errors that occur after auth user creation.
  - Keep recovery CTAs visible regardless of duplicate certainty.
- **Definition of Done Checklist**
  - [x] Apply API/UI flow hardened and wired.
  - [x] Duplicate email/callsign behaviors verified.
  - [x] Required apply/verification-prompt events emitted.

## T4
- **Task Name**
  - Verification Callback and Resend Flow
- **Objective**
  - Implement robust verification-link handling and resend capability with safe redirects and expired-link recovery UX.
- **Scope**
  - Add `GET /auth/callback` for code exchange and redirect logic.
  - Add `POST /api/auth/verification/resend` endpoint.
  - Update apply review/verification states with resend action and confirmation.
  - Add expired verification link messaging and retry path.
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Verification callback exchanges code and redirects to safe destination.
  - Expired/invalid verification links route to clear recovery state.
  - Resend verification endpoint returns neutral success and is usable from UI.
- **Tests Required**
  - Unit:
    - callback redirect-sanitization behavior.
  - E2E:
    - verification callback happy path.
    - expired verification link path and resend CTA behavior.
- **Telemetry Required**
  - `auth_verification_resend_requested`
- **Notes / Edge Cases**
  - Callback must handle missing/invalid code without throwing framework errors.
  - Keep resend responses neutral to avoid account enumeration.
- **Definition of Done Checklist**
  - [x] Callback route implemented and integrated.
  - [x] Resend verification endpoint/UI flow implemented.
  - [x] Verification-link edge-case tests pass.

## T5
- **Task Name**
  - Login UX Hardening and Unverified Guard
- **Objective**
  - Enforce predictable login behavior with generic invalid-credential handling, unverified-email blocking, and next-route restoration.
- **Scope**
  - Update `/api/auth/login`:
    - rate-limit hook integration point
    - unverified email gate (`UNVERIFIED_EMAIL`)
    - sanitize/generic invalid credential response
    - respect safe `next` destination
  - Update login UI:
    - generic error copy
    - unverified guidance + resend entry point
    - keep pending/disabled submit behavior
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Invalid email and invalid password cases return same user-visible message.
  - Unverified users are blocked with verification-specific guidance.
  - Login success redirects to validated `next` or `/archive`.
- **Tests Required**
  - Unit:
    - login schema with optional `next`.
    - error mapper coverage for unverified case.
  - E2E:
    - invalid login shows generic message.
    - unverified login blocked and guided.
    - login with next parameter redirects correctly.
- **Telemetry Required**
  - `auth_login_succeeded`
  - `auth_login_failed`
  - `auth_login_blocked_unverified`
- **Notes / Edge Cases**
  - Avoid revealing whether address exists in any pre-auth branch.
  - Ensure login failure copy is fixed and not provider-dependent.
- **Definition of Done Checklist**
  - [x] Login API enforces Phase 2 rules.
  - [x] Login UI reflects generic + unverified states.
  - [x] Login E2E scenarios pass.

## T6
- **Task Name**
  - Password Reset Completion Flow
- **Objective**
  - Deliver full reset lifecycle from neutral request to secure password update with invalid/expired token recovery.
- **Scope**
  - Keep/reset request endpoint neutral and consistent.
  - Add `/reset-password/update` page and update form.
  - Add `/api/auth/reset-password/confirm` endpoint.
  - Map invalid/expired/reused token failures to user-safe message.
  - Route callback recovery sessions to reset update page.
  - Estimate: `1.25 days`
- **Acceptance Criteria**
  - Reset request always returns neutral confirmation copy.
  - Valid recovery session allows password update and success redirect.
  - Invalid/expired/reused token state shows clear recoverable error with request-new-link CTA.
- **Tests Required**
  - Unit:
    - reset confirm schema (password rules + equality refinement).
  - E2E:
    - password reset request -> callback -> update success flow.
    - expired/invalid token flow.
- **Telemetry Required**
  - `auth_password_reset_requested`
  - `auth_password_reset_token_invalid`
  - `auth_password_updated`
- **Notes / Edge Cases**
  - Do not leak token details in UI.
  - Ensure reset update route gracefully handles missing recovery session.
- **Definition of Done Checklist**
  - [x] Reset request and confirm endpoints implemented.
  - [x] Reset update UI integrated and reachable via callback.
  - [x] Reset lifecycle E2E tests pass.

## T7
- **Task Name**
  - Logout and Session-Expiration UX
- **Objective**
  - Guarantee session termination behavior is immediate and protected-route responses are consistent for logout and session expiry.
- **Scope**
  - Update logout route redirect target and response handling as defined in design doc.
  - Add login message handling for session-expired redirect states.
  - Ensure protected pages redirect with `session=expired` where applicable.
  - Verify back-button behavior cannot reveal protected content.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Logout clears session and redirects to public page.
  - Post-logout and expired-session attempts to access protected pages are blocked server-side.
  - Session-expired message appears on login route when applicable.
- **Tests Required**
  - Unit:
    - none mandatory.
  - E2E:
    - logout then protected route blocked.
    - simulated session-expired flow shows expected login message.
- **Telemetry Required**
  - `auth_logout`
  - `auth_session_expired`
- **Notes / Edge Cases**
  - Preserve safe behavior even when sign-out API call fails mid-flight.
  - Avoid caching behavior that could expose stale protected render.
- **Definition of Done Checklist**
  - [x] Logout flow behavior updated and verified.
  - [x] Session-expired redirect + message path implemented.
  - [x] E2E session/logout coverage green.

## T8
- **Task Name**
  - Auth Rate Limiting Infrastructure
- **Objective**
  - Introduce minimal, deterministic rate limiting for login and reset-related actions without introducing user-data leakage.
- **Scope**
  - Add migration for `auth_rate_limits` table and constraints.
  - Implement server-side rate-limit utility with hashed subject keying.
  - Integrate rate limit checks into:
    - login
    - reset password request
    - resend verification
  - Return structured `RATE_LIMITED` errors with retry metadata.
  - Estimate: `1.25 days`
- **Acceptance Criteria**
  - Repeated action attempts trigger deterministic 429/rate-limited behavior.
  - Response includes retry guidance (`retryAfterSeconds`).
  - No raw email/IP is stored in limiter persistence.
- **Tests Required**
  - Unit:
    - limiter counter window/cooldown behavior.
    - subject hashing determinism.
  - E2E:
    - repeated login/reset attempts produce rate-limited UX.
- **Telemetry Required**
  - `auth_rate_limited`
- **Notes / Edge Cases**
  - Prevent race-condition double increments under concurrent requests.
  - Keep thresholds configurable via environment/config.
- **Definition of Done Checklist**
  - [x] DB migration authored and verified.
  - [x] Rate-limit utility integrated in required endpoints.
  - [x] Rate-limit tests pass with deterministic retry values.

## T9
- **Task Name**
  - Candidate File and Account Deletion Request
- **Objective**
  - Provide the authenticated Candidate File destination and implement basic account deletion request UX with persistence and access control.
- **Scope**
  - Add protected `/candidate-file` route.
  - Add account deletion request UI with explicit confirmation step.
  - Add `/api/auth/account-deletion-request` endpoint.
  - Add migration + RLS policies for `account_deletion_requests`.
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Authenticated navigation includes working `Candidate File` link.
  - Deletion request requires explicit confirmation before submission.
  - Request persists to DB and is scoped to current user via RLS.
- **Tests Required**
  - Unit:
    - account deletion request schema validation.
  - E2E:
    - authenticated user opens candidate file and submits deletion request.
    - unauthorized access to candidate file redirects to login.
- **Telemetry Required**
  - `auth_account_deletion_requested`
- **Notes / Edge Cases**
  - Prevent duplicate active pending requests per user.
  - Keep deletion flow as request-only; no immediate destructive action.
- **Definition of Done Checklist**
  - [x] Candidate file page shipped and linked in authenticated nav.
  - [x] Deletion request API/UI flow implemented.
  - [x] RLS and persistence verified.

## T10
- **Task Name**
  - Privacy/Terms Surface and Accessibility Baseline
- **Objective**
  - Ensure auth surfaces meet minimum legal visibility and accessibility requirements for keyboard/form-error behavior.
- **Scope**
  - Add `/legal/privacy` and `/legal/terms` pages.
  - Add Privacy/Terms links and account data-use statement to apply/login/reset surfaces.
  - Ensure ARIA associations for field errors.
  - Add focus-management behavior for first error and key success states.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Privacy/Terms links are visible on auth screens and non-broken.
  - Required data-use statement appears on auth entry surfaces.
  - Keyboard-only auth flows are operable with visible focus states.
  - Errors are announced/associated by text and ARIA, not color only.
- **Tests Required**
  - Unit/component:
    - form accessibility assertions for labels/error associations.
  - E2E:
    - keyboard-only auth flow smoke path.
- **Telemetry Required**
  - None required for this task.
- **Notes / Edge Cases**
  - Keep legal pages static/simple for this phase.
  - Focus management should not conflict with router navigation transitions.
- **Definition of Done Checklist**
  - [x] Legal routes added and linked.
  - [x] Accessibility baseline improvements implemented.
  - [x] Accessibility tests/smoke checks pass.

## T11
- **Task Name**
  - Phase 2 Analytics Contract and Event Wiring
- **Objective**
  - Upgrade analytics contracts to Phase 2 and wire all required auth hardening events across server and UI boundaries.
- **Scope**
  - Update analytics phase constant to `phase-002`.
  - Extend `AnalyticsEventProperties` with required Phase 2 events.
  - Wire event emissions into apply/login/reset/logout/resend/rate-limit/session-expired/account-deletion flows.
  - Ensure failures in telemetry dispatch never block auth flows.
  - Estimate: `0.75 day`
- **Acceptance Criteria**
  - Event contract includes all required Phase 2 events and payload fields.
  - Instrumented flows emit required events with common envelope fields.
  - Analytics adapter fallback behavior remains safe when provider is unavailable.
- **Tests Required**
  - Unit:
    - event-envelope tests asserting `phase-002`.
    - payload-shape tests for new Phase 2 events.
  - E2E:
    - at least one auth edge-path asserts event call behavior through spy/stub harness.
- **Telemetry Required**
  - `auth_nav_state_rendered`
  - `auth_apply_submitted`
  - `auth_apply_failed`
  - `auth_apply_duplicate_email_hint_shown`
  - `auth_verification_prompt_shown`
  - `auth_verification_resend_requested`
  - `auth_login_succeeded`
  - `auth_login_failed`
  - `auth_login_blocked_unverified`
  - `auth_password_reset_requested`
  - `auth_password_reset_token_invalid`
  - `auth_password_updated`
  - `auth_rate_limited`
  - `auth_session_expired`
  - `auth_logout`
  - `auth_account_deletion_requested`
- **Notes / Edge Cases**
  - Do not include full email addresses in event payloads; use domain-only where specified.
  - Keep server/client source attribution accurate.
- **Definition of Done Checklist**
  - [ ] Analytics contract updated to Phase 2.
  - [ ] Required event points instrumented.
  - [ ] Analytics tests pass.

## T12
- **Task Name**
  - Test Suite Finalization and Phase Exit Documentation
- **Objective**
  - Complete required automated coverage and documentation updates to satisfy Phase 2 exit criteria.
- **Scope**
  - Add/refresh Playwright coverage for all required auth flows:
    - register -> verify -> login -> protected
    - duplicate registration
    - failed login
    - password reset full cycle
    - expired reset token
    - logout -> protected blocked
  - Add/refresh unit tests for schemas, mapper, rate limiter, and analytics contract.
  - Update README and test docs for new env vars, flow behavior, and session handling.
  - Capture phase exit checklist evidence.
  - Estimate: `1.0 day`
- **Acceptance Criteria**
  - Required unit and e2e suites are green in local deterministic runs.
  - README reflects final Phase 2 auth flow and environment expectations.
  - Phase exit criteria evidence is captured and review-ready.
- **Tests Required**
  - Unit:
    - full auth Phase 2 validation/mapping/rate-limit/analytics suites.
  - E2E:
    - all required Phase 2 auth scenarios listed above.
- **Telemetry Required**
  - Verify emission for:
    - `auth_login_succeeded`
    - `auth_login_failed`
    - `auth_password_reset_requested`
    - `auth_password_updated`
    - `auth_rate_limited`
- **Notes / Edge Cases**
  - Keep E2E selectors stable and deterministic.
  - Avoid coupling tests to third-party email delivery by stubbing callback states when needed.
- **Definition of Done Checklist**
  - [x] All required unit tests pass.
  - [x] All required e2e tests pass.
  - [x] README/test docs updated and reviewed.
  - [x] Phase exit evidence captured.

---

## 4) Phase-Level Exit Gate Mapping

- Navigation and route guard requirements: primarily T2, T5, T7.
- Registration/verification requirements: primarily T3, T4.
- Login/reset/logout/session requirements: primarily T5, T6, T7.
- Abuse protection requirements: primarily T8.
- Candidate file + deletion request requirements: primarily T9.
- Privacy/accessibility requirements: primarily T10.
- Analytics requirements: primarily T11.
- Final test and documentation gates: primarily T12.

If a P0 requirement is not traceable to one of these tasks, implementation must pause and this plan must be updated.
