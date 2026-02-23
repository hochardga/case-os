# Ashfall Case Library — Spec-Driven AI Development Process (with Vibe-Coding)
**Purpose:** Define a repeatable development workflow optimized for “heavy vibe-coding” with AI, while keeping work testable, debuggable, and aligned to spec.

---

## 1) Technology stack recommendation (optimized for AI-heavy iteration)

### 1.1 Stack selection criteria (for vibe-coding success)
A good stack for AI-assisted rapid development should:
- Minimize glue code and local env pain
- Provide strong type safety + validation
- Have batteries-included auth, database, storage, deployments
- Support quick UI iteration and consistent components
- Enable fast automated testing (unit + e2e)
- Make “spec → implementation” mapping easy (schemas, contracts, typed APIs)

### 1.2 Recommended POC stack (web-first, fast iteration)
**Frontend / App Framework**
- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** (fast UI iteration)
- **shadcn/ui** (consistent component primitives)

**Backend / API**
- Next.js Route Handlers (POC) or lightweight server layer in the same repo
- Input validation with **Zod** (also used to validate Case Bible JSON)

**Database / Auth / Storage**
- **Supabase** (Postgres + Auth + Storage + Row Level Security)
    - Pros: extremely fast to stand up; great for POC; easy user auth + roles
    - Use Postgres tables for: users, cases, evidence metadata, progress, submissions, hints usage
    - Use Storage buckets for evidence assets (images / PDFs)

**Deployment**
- **Vercel** for the Next.js app
- Supabase hosted Postgres/Auth/Storage

**Analytics / Observability**
- **PostHog** (product analytics) or simple event table in Postgres for POC
- **Sentry** (frontend + server error tracking)

**Testing**
- **Vitest** (unit tests)
- **React Testing Library** (component tests where useful)
- **Playwright** (end-to-end tests for key flows: apply/login → start case → submit objective → unlock)

**Content Schema**
- Case Bible JSON validated via **Zod** (or JSON Schema) at ingestion
- Admin “publish” pipeline runs validators: ID uniqueness, unlock dependency checks, objective proof coverage checks

> This stack is intentionally “one-repo, one-language (TS)” to maximize AI velocity.

### 1.3 Acceptable alternatives (if you prefer different tradeoffs)
- **Firebase** instead of Supabase (faster auth but less relational ergonomics)
- **Remix** instead of Next.js (cleaner data loading patterns, slightly different ecosystem)
- **tRPC** (typed API calls end-to-end) if you want tighter type coupling
- **Prisma** if you want an ORM layer (optional; Supabase + SQL is fine for POC)

### 1.4 Guardrails for vibe-coding on this stack
- Strict TypeScript + ESLint + Prettier
- Zod validation on every server boundary
- Feature flags for “member-only” gating and admin tools
- E2E tests for core flows before “phase done”

---

## 2) Development process we will follow (spec-driven + vibe-coding)

### Overview
We develop in **phases**. Each phase is intentionally narrow, ends with a shippable increment, and has explicit entry/exit criteria.

---

## 3) Phase model

### 3.1 Phase definition
A **phase** is a time-bounded unit of work with:
- a clear user-visible outcome
- a measurable success signal
- a stable, testable “done” state

### 3.2 Phase artifacts (required)
Each phase produces and/or updates:
1. Phase Scope Statement
2. Phase Requirements Doc (detailed, aligned to scope)
3. Phase Design Doc (architecture + data model + UX flows)
4. Phase Task Plan (tickets with acceptance criteria + tests)
5. Working Implementation + tests + minimal telemetry
6. Phase Review Notes (what changed, what learned, what’s next)

---

## 4) The step-by-step process (canonical workflow)

### Step 1 — Declare phase scope (focus first)
**Inputs:** product vision + current state  
**Outputs:**
- Phase goal (1–2 sentences)
- In-scope list (must be small)
- Out-of-scope list (explicit)
- Phase success metrics (measurable)
- Entry criteria (what must already exist)
- Exit criteria (what “done” means)

**Rule:** If scope cannot be explained in ~60 seconds, it’s too big.

---

### Step 2 — Write phase requirements (spec as source of truth)
**Outputs:** Phase Requirements Doc that includes:
- User stories / journeys
- Functional requirements (P0/P1/P2)
- Non-functional requirements (perf/security/UX)
- Analytics events required
- Content/data contracts (schemas, enums, constraints)
- Acceptance criteria for the phase

**Rule:** Requirements must be implementable and testable.

---

### Step 3 — Write phase design doc (how we’ll build it)
**Outputs:** Phase Design Doc including:
- System architecture diagram (simple is fine)
- Data model (tables + key fields)
- API contracts (routes, payloads, auth rules)
- UI structure (screens + key components)
- State management approach
- Error handling and edge cases
- Security considerations (auth, roles, RLS, etc.)
- Validation strategy (schema validation + case validators)
- Test strategy (unit/e2e targets)
- ADRs (only if needed)

**Rule:** Design doc should make implementation decisions explicit so AI coding doesn’t “invent” architecture.

---

### Step 4 — Create task doc (tickets with success criteria)
**Outputs:** Task Plan with:
- Tasks sized to ~0.5–1.5 days each (ideally smaller)
- For each task:
    - goal
    - implementation notes / constraints
    - explicit success criteria
    - required tests (unit/e2e)
    - required instrumentation (events)
    - definition of done checklist

**Task template (required):**
- **Task Name**
- **Objective**
- **Scope**
- **Acceptance Criteria**
- **Tests Required**
- **Telemetry Required**
- **Notes / Edge Cases**

---

### Step 5 — Execute tasks via vibe-coding (but gated by tests)
**Operating mode:**
- AI-assisted coding is encouraged, but **every task must end with proof**
- Use short cycles: implement → run tests → fix → commit
- Keep PRs small; avoid “mega-diffs”

**Rules:**
- No task is “done” until tests pass and acceptance criteria are demonstrably met.
- If implementation reveals spec gaps, update docs immediately (Step 6 loop below).

---

### Step 6 — Spec ↔ Code sync (continuous during execution)
Whenever we discover:
- a missing requirement
- a design inconsistency
- a new edge case
- a constraint from the stack

We do:
1) Update requirements/design docs (source of truth)
2) Update tasks if necessary
3) Continue implementation

**Rule:** Specs should not drift from reality.

---

### Step 7 — Phase stabilization (minor fixes only)
**Purpose:** tighten quality without scope creep.

Stabilization includes:
- bug fixes
- UX polish limited to phase scope
- performance improvements
- test hardening
- instrumentation verification

**Rule:** No new features during stabilization.

---

### Step 8 — Phase exit review + next phase planning
**Outputs:**
- Phase completion checklist
- Metrics snapshot (from analytics)
- Known issues backlog
- Proposed scope for next phase

---

## 5) Definition of Done (DoD)

A feature/task is “done” when:
1. Acceptance criteria met
2. Tests required are implemented and passing
3. Telemetry events are emitted correctly (if required)
4. Error states handled (at least minimal)
5. Security checks done (auth + authorization)
6. Docs updated if behavior differs from spec
7. Code reviewed (even if the review is short)

A phase is “done” when:
- all P0 requirements delivered
- core flows have e2e coverage
- no known P0 bugs remain
- phase exit criteria met

---

## 6) Testing and validation strategy (for AI-coded reliability)

### 6.1 Minimum required e2e coverage per phase
For Ashfall POC, always keep these flows green:
- Apply/Register → Accepted → Land in Archive
- Start case → view evidence → submit objective → unlock packet
- Save progress → reload → resume state is correct

### 6.2 Contract validation
- Case Bible JSON must validate on ingestion (schema)
- Case publishing must run structural validators:
    - evidence IDs unique
    - required evidence unlocked by objective stage
    - objective has ≥ 2 evidence supports
    - no orphan evidence (warn)
    - no “ground_truth” leaking to runtime endpoints

---

## 7) Working agreements (how we vibe-code without chaos)

### 7.1 Branching / PR hygiene
- Small PRs, focused on one task
- PR includes:
    - what changed
    - how to test (commands + steps)
    - screenshots for UI changes

### 7.2 Prompting patterns for AI coding
When using AI to implement a task, always provide:
- relevant spec excerpt (copy/paste)
- file locations and conventions
- required acceptance criteria
- required tests
- boundary constraints (schema types, auth rules)

### 7.3 Avoiding “AI hallucination architecture”
AI must not invent:
- new tables
- new auth patterns
- new state models

unless the design doc explicitly allows it and we record the change.

---

## 8) Example phase breakdown (POC-friendly)

### Phase 1: Foundation + Auth + Immersive Onboarding
- App shell, routing, styles
- Apply/login/accepted flows
- Basic profile (“Candidate File”)

### Phase 2: Case Library + Case Ingestion (Admin)
- Case list + case details
- Admin upload/publish a case via schema + assets
- Validate schema and publish pipeline

### Phase 3: Case Desk Core Loop
- Evidence viewer
- Objectives panel + proof-set submission
- Packet unlocks + persistence + recap

### Phase 4: Polish + Analytics + POC Readiness
- Instrumentation
- e2e hardening
- performance improvements
- finalize a small library

---

## 9) Summary (the “rules of the road”)
- Specs drive everything; vibe-coding executes specs.
- Every task ends with proof: tests + criteria.
- Keep phases narrow; stabilize before expanding.
- Update docs when reality changes.
- Prefer boring, fast, integrated stack choices for POC velocity.

---