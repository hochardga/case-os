A new development phase is defined in phases/phase-001/phase-001-definition.md

According to design-files/development-process.md, the next step is...

### Step 2 — Write phase requirements (spec as source of truth)
**Outputs:** Phase Requirements Doc that includes:
- User stories / journeys
- Functional requirements (P0/P1/P2)
- Non-functional requirements (perf/security/UX)
- Analytics events required
- Content/data contracts (schemas, enums, constraints)
- Acceptance criteria for the phase

**Rule:** Requirements must be implementable and testable.




Write a requirements doc for this phase.


---


Next step, according to design-files/development-process.md...

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


Next step, according to design-files/development-process.md...

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

Complete the task T1 defined in phases/phase-001/phase-001-task-plan.md


