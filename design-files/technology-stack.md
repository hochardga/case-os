# Ashfall Case Library
## Technology Stack Declaration (POC)

**Date:** 2026-02-22  
**Scope:** Proof of Concept (POC)  
**Purpose:** Declare the official technology stack for Ashfall Case Library POC development, optimized for spec-driven AI development and heavy vibe-coding workflows.

---

# 1. Guiding Principles for Stack Selection

The chosen stack must:

1. **Maximize AI development velocity**
    - Single language where possible (TypeScript end-to-end)
    - Minimal boilerplate
    - Strong ecosystem support
    - Predictable file structure

2. **Support spec-driven development**
    - Strong typing
    - Runtime validation
    - Clear data contracts
    - Deterministic APIs

3. **Minimize infrastructure friction**
    - Hosted database
    - Managed authentication
    - Managed storage
    - Simple deployments

4. **Be production-upgradable**
    - POC should not require a rewrite for v1
    - Scalable to larger content library

---

# 2. Official POC Stack

## 2.1 Frontend & Application Framework

### Framework
**Next.js (App Router) + TypeScript**

**Why:**
- Full-stack capability (frontend + server routes)
- Mature ecosystem
- Excellent AI familiarity
- Strong deployment support (Vercel)
- Good separation of concerns for spec-driven builds

### Language
**TypeScript (strict mode enabled)**

**Why:**
- Type safety reduces AI hallucination bugs
- Shared types between frontend and backend
- Supports spec-driven schema alignment

### Styling
**Tailwind CSS**

**Why:**
- Rapid iteration
- Consistent design tokens
- Minimal CSS overhead
- AI-friendly pattern usage

### UI Components
**shadcn/ui (Radix-based primitives)**

**Why:**
- Accessible components out of the box
- Consistent design language
- Reduces custom component complexity

---

## 2.2 Backend & API Layer

### Server Environment
**Next.js Route Handlers (Node runtime)**

**Why:**
- Same repository and language
- Eliminates need for separate API server
- Simplifies authentication integration
- Ideal for POC speed

### Input Validation
**Zod**

**Why:**
- Runtime validation
- Schema definition for Case Bible ingestion
- Shared validation between API and frontend
- Prevents malformed case data

---

## 2.3 Database, Auth, and Storage

### Backend Platform
**Supabase**

Components used:
- PostgreSQL (database)
- Supabase Auth (authentication)
- Supabase Storage (evidence assets)
- Row-Level Security (RLS)

---

### 2.3.1 Database (PostgreSQL via Supabase)

**Why:**
- Relational structure ideal for:
    - Users
    - Cases
    - Evidence metadata
    - Objectives
    - Progress
    - Submissions
    - Hint usage
- Mature and scalable
- Strong support for JSON fields (for case schema storage)

---

### 2.3.2 Authentication (Supabase Auth)

**Why:**
- Email/password or magic link
- Built-in session handling
- Role support
- Quick integration with Next.js

**POC Auth Model:**
- user
- admin
- curator

---

### 2.3.3 Storage (Supabase Storage)

Used for:
- Evidence images
- PDF scans
- Case assets

**Why:**
- Managed storage
- Signed URLs
- Easy integration with auth

---

## 2.4 Deployment

### Application Hosting
**Vercel**

**Why:**
- Native Next.js support
- Fast preview deployments
- Simple CI/CD
- Edge-ready if needed later

### Database Hosting
**Supabase Hosted**

---

## 2.5 Analytics & Observability

### Product Analytics
**PostHog (recommended)**  
Alternative: Basic event table in Postgres for POC

Tracked events:
- Account created
- Case started
- Objective attempt
- Objective passed
- Hint used
- Case completed

---

### Error Monitoring
**Sentry (frontend + server)**

**Why:**
- Immediate visibility into runtime errors
- Critical for AI-heavy rapid iteration

---

## 2.6 Testing Stack

### Unit Testing
**Vitest**

### Component Testing
**React Testing Library**

### End-to-End Testing
**Playwright**

Critical E2E coverage:
- Apply → Accepted → Archive
- Start Case → Submit Objective → Unlock Packet
- Save → Reload → Resume

---

# 3. Content Schema & Validation

## 3.1 Case Bible Schema

- Case content authored as JSON
- Validated via Zod on ingestion
- Stored in database (JSONB or normalized tables)
- Ground truth never exposed to client

## 3.2 Publishing Pipeline (Admin)

On publish:
- Schema validation
- Evidence ID uniqueness check
- Unlock dependency validation
- Objective proof coverage check
- Flag confirmation (no real people, no copyrighted material)

---

# 4. Architectural Overview
