# Ashfall Case Library
## Proof of Concept Requirements

**Agency (in-world):** Ashfall Investigative Collective  
**Product (customer-facing):** Ashfall Case Library  
**Document type:** Requirements (POC / MVP)  
**Status:** Draft  
**Date:** 2026-02-22  
**Primary goal:** Validate that a digital “unsolved case archive” experience is engaging, solvable, and repeatable across many cases.

---

## 1. Product Summary

Ashfall Case Library is a web-based “case desk” where users apply to join the Ashfall Investigative Collective, get “accepted,” and then work a curated library of legendary cold cases that traditional investigators couldn’t solve.

Each case is presented as a dossier (documents, photos, logs, transcripts). Players progress through **3 gated objectives** by submitting **evidence-backed findings**, unlocking sealed “evidence packets,” and ultimately presenting a final accusation supported by proof.

The POC focuses on:
- **Single-player, asynchronous play**
- **A small library of curated cases**
- **Deterministic case logic** (one true solution per case)
- **Strong immersion via in-world framing** (application, handler, dossier language)
- **Core UX + persistence** (save/resume, progress, submissions, hints)

---

## 2. POC Goals and Success Criteria

### 2.1 Goals
1. Prove users can understand and enjoy the “digital dossier” gameplay loop.
2. Prove gated objectives + evidence validation feels fair (not “guessy”).
3. Prove cases can be authored/ingested in a scalable format (case schema), enabling a growing library.
4. Prove immersion framing (agency onboarding + handler + archive) increases engagement and retention.

### 2.2 Success Criteria (measurable)
- **Activation:** ≥ 60% of new users start a case within 10 minutes of acceptance.
- **Engagement:** Median time-in-case ≥ 20 minutes in first session.
- **Completion:** ≥ 25–35% complete Objective 1 for at least one case (POC baseline).
- **Fairness:** < 20% of sessions require “reveal” usage to finish Objective 1 (adjustable by difficulty).
- **Retention signal:** ≥ 20% return within 7 days to continue or start a second case.
- **Content scalability:** New case can be added by an admin without code changes (data + assets only).

---

## 3. Scope

### 3.1 In Scope (POC)
- Web app (mobile + desktop responsive)
- User authentication + applicant-themed onboarding
- Case library browsing and case detail pages
- Case Desk experience (evidence viewer, objectives, submissions, gating/unlocks)
- Hint ladder (hint tiers + reveal)
- Save/resume progress across devices
- Admin tools for case ingestion and publishing (minimal but real)

### 3.2 Explicitly Out of Scope (POC)
- Multiplayer
- Voice narration / TTS
- AI-generated images at runtime
- “Live” monthly scenarios
- Complex social features (friends, invites, chat)
- Full subscription billing (may be stubbed behind feature flags)

---

## 4. Assumptions and Principles

### 4.1 Key Assumptions
- POC cases are **curated** and **finite** (library model), not infinite runtime generation.
- AI can assist content creation offline, but gameplay logic should not depend on a live LLM for solvability.
- The case “truth” is **deterministic** and backed by an evidence graph.

### 4.2 Product Principles
- **Evidence-first:** Progress requires evidence-backed reasoning, not guessing.
- **Fairness:** Each objective must be solvable with evidence available at that stage.
- **Immersion:** UI copy and flows should feel like an investigative portal, not a generic game.
- **Respectful tone:** Non-graphic depiction of death/violence; no procedural harm instructions.
- **Scalable content:** The platform must support many cases without bespoke UI work per case.

---

## 5. Personas

1. **Applicant / Recruit (Primary User)**
    - Wants an immersive detective experience.
    - Plays in sessions over time.
    - Needs recaps and clear objectives.

2. **Power Solver**
    - Wants challenge, minimal hand-holding.
    - May avoid reveals; expects scoring.

3. **Curator / Admin**
    - Publishes cases, manages assets, reviews analytics.
    - Needs a safe ingestion pipeline and validation tooling.

---

## 6. Core User Journeys

### 6.1 Applicant → Acceptance
1. User lands on marketing entry page
2. “Apply to Ashfall Investigative Collective”
3. Creates candidate file (callsign, email, password or magic link, optional specialty)
4. Sees “Application under review…” (instant, but framed)
5. “Accepted” screen + handler intro + CTA to open first dossier

### 6.2 Browse Library → Start a Case
1. User opens Archive (library)
2. Filters/sorts (difficulty, tone, length, tags)
3. Opens case detail page
4. Starts case → “Case Desk” view opens

### 6.3 Play Case Over Time (Save/Resume)
1. User reviews evidence, takes notes
2. Works Objective 1 → submits findings
3. If correct → unlock Packet B and Objective 2
4. If incorrect → receives guided feedback + can request hints/reveal
5. User leaves; later returns → sees recap + picks up where left off

### 6.4 Complete Case
1. Final submission for Objective 3
2. Case closure report (means/motive/opportunity reconstruction)
3. Case marked completed; record in “Closed Findings”
4. Clearance / rank updated; recommend next case

---

## 7. Functional Requirements

### Priority Legend
- **P0 (Must):** Required for POC validation
- **P1 (Should):** Strongly recommended for POC quality
- **P2 (Could):** Nice-to-have; can defer

---

### 7.1 Authentication and Account (P0)

**FR-AUTH-001 (P0):** Users can create an account via an “Application” flow.
- Required fields: email, password (or magic link), callsign/username
- Optional fields: “specialty track” selection

**FR-AUTH-002 (P0):** Login + session persistence.
- Remember user session across page reloads
- Secure session handling

**FR-AUTH-003 (P0):** Password reset (or magic link resend).

**FR-AUTH-004 (P0):** Email verification (recommended for POC; can be soft-enforced).

**FR-AUTH-005 (P0):** User profile page (“Candidate File”).
- Callsign, specialty (if used)
- View clearance/rank (even if basic)
- Account actions: log out

**FR-AUTH-006 (P1):** Account deletion request + data deletion (basic).

---

### 7.2 Immersive Framing (P0)

**FR-IMM-001 (P0):** Application copy and acceptance flow must be in-world.
- “Apply,” “Accepted,” “Handler assigned,” “Archive access granted”

**FR-IMM-002 (P0):** Handler voice used for key system messaging:
- Unlock packets
- Feedback on incorrect submissions
- Recaps (“briefing”) when returning

**FR-IMM-003 (P1):** Simple “Clearance Level” progression:
- Clearance derived from completed cases and/or objective completions
- Used for recommending cases (not hard-gating in POC unless desired)

---

### 7.3 Case Library (P0)

**FR-LIB-001 (P0):** Library view (“Archive”) lists published cases.  
Minimum metadata displayed:
- Title, short synopsis, difficulty, estimated time, tone tags, content warnings

**FR-LIB-002 (P0):** Case detail page.
- Case intro briefing
- What you’ll do (3 objectives)
- Start/Resume button

**FR-LIB-003 (P1):** Sorting and filtering (difficulty, time, tags).

**FR-LIB-004 (P1):** “Recommended next dossier” panel after completing or pausing a case.

---

### 7.4 Case Desk Experience (P0)

**FR-DESK-001 (P0):** Case Desk layout supports many cases without customization:
- Evidence list/folders
- Evidence viewer
- Objectives panel
- Notes / journal
- Submit findings action

**FR-DESK-002 (P0):** Evidence viewer supports multiple evidence types:
- Text documents (report/email/log/note)
- Images (photo/scan)
- “Transcript” text (audio transcript type; no audio required in POC)
- Basic zoom for images/scans
- Metadata display (source, date/time, exhibit id)

**FR-DESK-003 (P0):** Evidence unlocking by stage (“Packets”):
- Start packet (available immediately)
- Packet B unlocked after Obj 1
- Packet C unlocked after Obj 2
  (Names can be in-world: “Packet B Unsealed”)

**FR-DESK-004 (P0):** Objectives system (exactly 3 per case for POC):
- Objective prompt
- Submission UI (see Validation section)
- Status (locked / active / completed)

**FR-DESK-005 (P0):** Progress persistence:
- Evidence viewed state (optional)
- Notes/journal saved
- Objective attempts recorded
- Unlocked packets recorded
- Current active case list

**FR-DESK-006 (P1):** Return recap (“Briefing”):
- Shows last activity, unlocked packet, current objective, suggested next step

---

### 7.5 Submissions and Validation (P0)

**FR-VAL-001 (P0):** Submission must be evidence-based, not freeform text-only.
POC submission format:
- User selects 2–4 evidence items from a list (“Proof Set”)
- Optional: user selects 1–3 short “claims” (checkboxes) that match objective requirements
- Optional: culprit selection only required in Objective 3

**FR-VAL-002 (P0):** System validates submissions deterministically.
- Pass/fail with in-world feedback
- Must allow multiple attempts

**FR-VAL-003 (P0):** On incorrect submission, provide feedback without giving away answer:
- “One of your exhibits does not support the claim.”
- “You are missing proof related to timeline/access.”
  (Feedback templates should be configurable per objective or generically helpful.)

**FR-VAL-004 (P1):** Attempt throttling (light):
- Prevent spam attempts (e.g., short cooldown after repeated failures)

---

### 7.6 Hints and Reveals (P0)

**FR-HINT-001 (P0):** Each objective supports a hint ladder:
- Tier 1: subtle nudge
- Tier 2: more direct
- Tier 3: points to exact exhibit area
- Reveal: states the solution for that objective (or the missing link)

**FR-HINT-002 (P0):** Track hint usage for scoring/analytics.

**FR-HINT-003 (P1):** “Item-level help” (optional in POC):
- Each evidence can optionally have a “hint” and “reveal” to guide interpretation

---

### 7.7 Notes, Journal, and Reasoning Tools (P0/P1)

**FR-NOTE-001 (P0):** Case journal (freeform notes) saved per case.

**FR-NOTE-002 (P1):** Structured notes helpers:
- Quick “Add to notes” from evidence (copies title + key details)

**FR-NOTE-003 (P2):** Timeline tool (lightweight):
- User can add events with time labels
- Not required for solvability in POC but helps immersion

**FR-NOTE-004 (P2):** Suspect board (drag/drop evidence to suspects).

---

### 7.8 Completed Cases and Progression (P0)

**FR-PROG-001 (P0):** Completed case view:
- Completion timestamp
- Summary closure report (pre-authored; not generated at runtime)
- Hint usage stats

**FR-PROG-002 (P0):** Active cases list:
- Resume case
- Show current objective and unlocked packet

**FR-PROG-003 (P1):** Clearance/rank updates:
- Simple rank names (e.g., Candidate → Analyst → Operative)
- Rank derived from completions

---

## 8. Content and Data Requirements

### 8.1 Case Content Model (P0)
The platform must ingest cases via a structured schema (e.g., “Case Bible JSON”) that includes:

- Case metadata (title, tone, difficulty, warnings, estimated time)
- Ground truth (private, for authoring/QA only)
- Evidence list (IDs, type, title, source, unlock stage, summary, key details)
- Objectives (3) with:
    - Prompt
    - Validation rules (required evidence IDs, required claim IDs)
    - Unlock rewards (evidence IDs unlocked)
    - Hint ladder content
- Closure report content (final reconstruction text, non-graphic)

**POC requirement:** At runtime, users must never see the ground truth section.

### 8.2 Evidence Assets (P0)
Evidence items may reference:
- Rich text content (rendered in viewer)
- Image assets (PNG/JPG/WebP)
- PDF scans (optional; if used, must be viewable on mobile)
- Transcripts (text)

### 8.3 Case Versioning (P1)
- Cases should have a version string.
- User progress should be pinned to a case version to prevent breakage.

### 8.4 Safety and Quality Flags (P0)
Each case must store:
- Content warning tags
- Internal flags confirming:
    - no real people/places/orgs
    - no copyrighted references
    - non-graphic depiction
    - no procedural harm instructions

---

## 9. Admin and Curation Requirements

### 9.1 Roles (P0)
- **Admin:** full control
- **Curator:** can create/edit/publish cases; view analytics
- **User:** normal access

### 9.2 Case Management (P0)
**FR-ADM-001 (P0):** Admin can create/edit/publish/unpublish cases.  
**FR-ADM-002 (P0):** Admin can upload/manage evidence assets and link them to evidence IDs.  
**FR-ADM-003 (P0):** Admin can preview a case desk as a user (test mode).  
**FR-ADM-004 (P1):** Admin can run basic automated validations:
- Evidence ID uniqueness
- Unlock dependencies consistent (no required evidence locked)
- Objective has ≥ 2 supporting evidence items
- No orphan evidence (optional warning)

### 9.3 User Management (P0)
**FR-ADM-010 (P0):** Admin can view user list and basic account metadata (callsign, email verified, created date).  
**FR-ADM-011 (P0):** Admin can reset a user’s case progress (support/debug).

---

## 10. Subscription and Access Control (POC Approach)

### 10.1 POC Recommendation
For POC, keep billing out-of-scope but support a paywall-ready structure:

- **Entitlement flag** on user: `access_level = free | member | admin`
- Free users can access:
    - 1 starter case (or limited objectives)
- Member access can be simulated via admin toggle or invite code.

**FR-ENT-001 (P0):** Access checks for case visibility (starter vs full library).  
**FR-ENT-002 (P1):** Invite-code flow to grant “member” access without payments.

---

## 11. Non-Functional Requirements

### 11.1 Performance (P0)
- Mobile-first responsive performance
- Initial page load target: reasonable baseline for modern web apps
- Evidence assets lazy-loaded; no loading 40 images upfront

### 11.2 Reliability (P0)
- Progress writes must be durable (no lost notes/objective completions)
- Graceful handling of network interruptions

### 11.3 Security (P0)
- Secure authentication and session management
- Authorization checks for admin routes
- Protect unpublished case data and ground truth
- Rate limiting for auth and submissions (basic)

### 11.4 Privacy (P0)
- Store minimal PII (email + profile fields)
- Provide a basic privacy statement
- Avoid storing sensitive personal data beyond what’s needed

### 11.5 Accessibility (P1)
- Keyboard navigation on desktop
- Reasonable color contrast
- Screen-reader friendly structure for evidence docs

---

## 12. Analytics and Observability (POC)

### 12.1 Product Analytics Events (P0)
Track (at minimum):
- Account created / accepted
- Case started
- Evidence viewed (by type; optional sampling)
- Objective attempt (pass/fail)
- Hint tier used + reveal used
- Packet unlocked
- Case completed
- Session duration proxies (time in case desk)

### 12.2 Operational Metrics (P0)
- Error rate for asset loads and save operations
- Latency for key APIs
- Failed login / password reset rates

---

## 13. Acceptance Criteria (POC Exit)

A POC release is acceptable when:
1. Users can register/login and reach the Archive.
2. Users can start a case, view evidence, and submit Objective 1 with deterministic validation.
3. Unlocking packets works, and progress persists across reloads/devices.
4. Hints/reveals work and are tracked.
5. Admin can add/publish a new case without code changes (content + assets).
6. At least one case can be completed end-to-end with a closure report.

---

## 14. Risks and Mitigations (POC-Relevant)

- **Risk: Cases feel “like reading,” not investigating.**  
  *Mitigation:* Enforce objective proof sets, evidence cross-linking, and case desk tools.

- **Risk: Users get stuck and churn.**  
  *Mitigation:* Hint ladder, recap, and clearer objective prompts; track stuck points.

- **Risk: Content scale blocked by manual effort.**  
  *Mitigation:* Case Bible schema + admin ingestion + validators; AI-assisted authoring later.

- **Risk: Immersion breaks due to generic UI text.**  
  *Mitigation:* Handler voice + in-world terminology across all states (errors, unlocks, feedback).

---

## 15. Deliverables for POC

- Web application (responsive)
- Auth + applicant onboarding + acceptance flow
- Archive + case detail pages
- Case Desk + evidence viewer + objectives + submissions + hints
- Progress persistence
- Admin case management + publish flow
- Basic analytics instrumentation

---