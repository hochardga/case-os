# Ashfall Case Library — Phase 2 Definition

**Phase Name:** Phase 2 — Authentication UX Hardening
**Date:** 2026-02-28
**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase Auth + Postgres + Zod + Vercel

---

## 1) Phase Goal (One Sentence)

Deliver a **clean, predictable, and production-ready authentication user experience** that follows SaaS best practices and eliminates edge-case friction before deeper feature development.

---

## 2) Why This Phase Exists

Phase 1 proved authentication *works* .
Phase 2 ensures authentication **feels correct, secure, and complete**.

If authentication UX is brittle, confusing, or leaky:

* Activation suffers
* Support burden increases
* Security risk grows
* Future features inherit broken assumptions

This phase stabilizes identity as a first-class foundation before expanding into Case Library and Case Desk.

---

## 3) In Scope (Must-Have Only)

### 3.1 Auth State-Aware Navigation

**Goal:** UI must accurately reflect authentication state at all times.

Required behaviors:

* If **not logged in**:

    * Show: `Apply`, `Log In`
    * Hide: `Log Out`, `Archive`, `Candidate File`
* If **logged in**:

    * Show: `Archive`, `Candidate File`, `Log Out`
    * Hide: `Apply`, `Log In`
* Protected routes:

    * Redirect unauthenticated users to `Log In`
    * Preserve intended destination (post-login redirect)

Must be:

* Server-validated (not client-only)
* Flash-free (no UI flicker during session load)

---

### 3.2 Registration (“Application”) UX Hardening

Extends FR-AUTH-001

Required behaviors:

1. Email format validated client + server (Zod)
2. Password requirements clearly displayed before submission:

    * Minimum length
    * Character requirements (if enforced)
3. Callsign validation:

    * Length constraints
    * Uniqueness enforced
4. Loading states during submission
5. Clear error messaging:

    * Network error
    * Weak password
    * Duplicate email
    * Duplicate callsign
6. No raw Supabase error messages shown to user

---

### 3.3 Handling Duplicate Email Registration

If a user attempts to register with an existing email:

* Show neutral message:

  > “An account may already exist for this email.”
* Provide:

    * “Log In”
    * “Reset Password”

Do **not** reveal whether the email definitively exists (prevents account enumeration).

---

### 3.4 Email Verification (Required)

Implements FR-AUTH-004

Required behavior:

* After registration:

    * User sees “Check your inbox to verify access.”
* Until verified:

    * Cannot access Archive
    * Attempting login shows:

      > “Please verify your email before accessing the Archive.”
* Verification link:

    * Expires after reasonable time (Supabase default acceptable)
    * Expired link shows:

      > “Verification link expired.”

        * “Resend verification email”

---

### 3.5 Login UX Best Practices

Implements FR-AUTH-002

Required behaviors:

* Email + password login
* Clear loading state
* Generic error on failure:

  > “Invalid email or password.”
* No differentiation between:

    * Wrong email
    * Wrong password
* Session persists across refresh
* Session restored server-side

---

### 3.6 Password Reset Flow (Full UX)

Implements FR-AUTH-003

#### 1) Forgot Password Screen

* Email input
* Always show neutral confirmation:

  > “If an account exists for this email, you’ll receive reset instructions.”

(No confirmation of account existence.)

#### 2) Reset Email

* Tokenized link
* Time-limited

#### 3) Reset Password Page

* Token validation
* New password + confirm password
* Same password rules as registration
* Success message:

  > “Password updated successfully.”

#### 4) Expired / Invalid Token

* Friendly error:

  > “Reset link expired or invalid.”
* CTA: “Request new reset link”

---

### 3.7 Logout Behavior

Required behaviors:

* Clears session
* Redirects to public landing page
* Invalidates protected route access immediately
* Browser back button cannot access protected content

---

### 3.8 Session Management (Minimal but Correct)

Must include:

* Secure HTTP-only cookies
* No tokens stored in localStorage
* Session expiration handled gracefully
* If session expires:

    * Redirect to login
    * Show:

      > “Your session has expired. Please log in again.”

---

### 3.9 Account Status States (Edge Cases)

System must gracefully handle:

| Scenario                 | Required UX                               |
| ------------------------ | ----------------------------------------- |
| Unverified account login | Block + resend verification               |
| Deleted account          | Generic login failure                     |
| Expired reset token      | Clear expired message                     |
| Reused reset token       | Invalid token message                     |
| Auth server unavailable  | Generic “Service temporarily unavailable” |

No raw stack traces.

---

### 3.10 Basic Abuse Protection (Minimal)

Must include:

* Rate limiting for:

    * Login attempts
    * Password reset requests
* Short cooldown after repeated failures
* No CAPTCHA yet
* No MFA yet

---

### 3.11 Accessibility Baseline

* All auth forms keyboard accessible
* Proper `<label>` usage
* Error messages associated via ARIA
* Focus states visible
* No color-only error indicators

---

### 3.12 Basic Privacy & Compliance Surface

Implements Security + Privacy P0 requirements

Must include:

* Link to Privacy Statement
* Link to Terms
* Clear statement:

  > “We store your email and profile information for account management.”
* Ability to request account deletion (simple button + confirmation)

Full GDPR tooling is out-of-scope for this phase.

---

## 4) Explicitly Out of Scope (Phase 2)

* MFA (TOTP, SMS, passkeys)
* Social login (Google, Apple, etc.)
* Enterprise SSO (SAML/OIDC)
* Device management dashboard
* Advanced fraud detection
* Billing / subscription entitlements
* Role management UI
* Magic link login (unless already required by Supabase config)

---

## 5) Phase Success Metrics

This phase is complete when:

### UX Metrics

* ≥ 90% of new users successfully complete registration without support.
* < 2% password reset failure rate.
* No auth-related critical support tickets during internal testing.

### Security Metrics

* No account enumeration possible.
* No raw provider error messages exposed.
* Protected routes cannot be accessed without session.

### Engineering Metrics

* All auth flows covered by Playwright E2E:

    * Register → verify → login → protected route
    * Duplicate registration attempt
    * Failed login attempt
    * Password reset full cycle
    * Expired reset token
    * Logout → protected route blocked

---

## 6) Entry Criteria

* Phase 1 foundation complete
* Supabase Auth configured
* Apply/login/logout/reset working minimally

---

## 7) Exit Criteria (“Definition of Done” for Phase 2)

Phase 2 is complete when all are true:

1. Auth UI is state-aware and flicker-free.
2. Registration handles duplicates safely.
3. Email verification is enforced.
4. Password reset UX fully implemented with token handling.
5. Sessions persist and expire correctly.
6. No raw auth provider errors exposed.
7. All required E2E flows pass.
8. No P0 security or UX bugs remain.
9. README updated with:

    * Auth flow documentation
    * Environment variable expectations
    * Session handling explanation

---

## 8) Deliverables

* Hardened auth UI components
* Updated route guards (server-side)
* Improved error handling layer
* Email verification enforcement
* Full password reset UX
* Rate limiting layer
* Playwright E2E suite covering auth
* Updated README documentation

---

## 9) Phase Guardrails

* Do not introduce MFA or SSO yet.
* Do not overbuild roles/entitlements.
* Keep auth flows boring, predictable, and conventional.
* Prioritize clarity over immersion copy in edge cases.
* Security > clever UX.

---

## Outcome of Phase 2

After this phase:

Authentication will be:

* Predictable
* Secure enough for POC
* Free of major UX friction
* Ready to support:

    * Case library
    * Entitlements
    * Future MFA
    * Future SSO

Identity becomes a stable substrate rather than a future refactor risk.