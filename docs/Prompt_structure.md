# AI PROMPT PLAN

## Research Paper Reading Tracker

Each prompt has:

* A **clear scope**
* A **single responsibility**
* A **deterministic output**


---

## PHASE 0 – Foundation (Must be first)

### 1. Repository & Monorepo Bootstrap Prompt

**Purpose:**
Initialize pnpm workspace, base tsconfig, folder structure, and shared package skeleton.

---

### 2. Shared Enums & Types Prompt

**Purpose:**
Create all enums, shared types, and constants inside `packages/shared` exactly as defined in BRD/TAD.

---

### 3. Cursor Guardrails Validation Prompt

**Purpose:**
Validate `.cursorrules` compliance and ensure no speculative code is introduced.

---

## PHASE 1 – Backend Core

### 4. Backend App Bootstrap Prompt

**Purpose:**
Set up Express + TypeScript app, base middleware wiring, health check, error handler.

---

### 5. Database Schema & Prisma Prompt

**Purpose:**
Create Prisma schema with enums, relations, constraints, and migrations.

---

### 6. API Key Authentication Middleware Prompt

**Purpose:**
Implement secure API key hashing, validation, and request scoping.

---

### 7. Rate Limiting Middleware Prompt

**Purpose:**
Implement per–API-key rate limiting with separate read/write limits.

---

### 8. Paper Service (Business Logic) Prompt

**Purpose:**
Implement all paper-related business rules:

* create
* update
* archive
* duplicate prevention
* filtering logic

---

### 9. Paper Controller & Routes Prompt

**Purpose:**
Wire HTTP routes to services and enforce API response envelope.

---

### 10. Analytics Service Prompt

**Purpose:**
Implement all analytics aggregations:

* funnel
* scatter
* stacked bar
* summary metrics

---

### 11. Analytics Controller & Route Prompt

**Purpose:**
Expose analytics via `/analytics` endpoint using the standard response format.

---

## PHASE 2 – Frontend Core

### 12. Frontend App Bootstrap Prompt

**Purpose:**
Set up React + Vite + TypeScript, routing, layout shell.

---

### 13. API Client & Response Handling Prompt

**Purpose:**
Create a centralized API client enforcing:

* `X-API-KEY`
* `code / data / message` handling
* error normalization

---

### 14. API Key Management Hook Prompt

**Purpose:**
Implement API key generation, storage, import/export.

---

### 15. Add Paper Page Prompt

**Purpose:**
Build Add Paper form using shared enums, validation, and API integration.

---

### 16. Library Page Prompt

**Purpose:**
Build table view, filters, pagination, edit and archive flows.

---

### 17. Analytics Page Prompt

**Purpose:**
Build analytics dashboard and charts, consuming backend analytics.

---

## PHASE 3 – UX, Validation & Polish

### 18. Empty, Loading & Error States Prompt

**Purpose:**
Implement all UX states defined in UI/UX specs.

---

### 19. Responsive & Accessibility Adjustments Prompt

**Purpose:**
Ensure mobile behavior and accessibility compliance.

---

## PHASE 4 – Quality & Delivery

### 20. API Contract Validation Prompt

**Purpose:**
Ensure frontend and backend strictly follow API_CONTRACTS.md.

---

### 21. Code Refactor & Consistency Prompt

**Purpose:**
Refactor AI-generated code to:

* remove duplication
* enforce naming conventions
* improve readability

---

### 22. AI Usage Documentation Prompt

**Purpose:**
Generate `AI_USAGE.md` documenting how AI was used.

---

### 23. Final Review Checklist Prompt

**Purpose:**
Cross-check implementation against:

* BRD
* TAD
* UI/UX specs
* API contracts
