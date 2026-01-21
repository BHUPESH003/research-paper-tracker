# Technical Architecture Document (TAD)

## Research Paper Reading Tracker

---

## 1. Architecture Overview

The application follows a **modular full-stack architecture** with a clear separation of concerns between:

* Presentation (Frontend)
* API Layer (Backend)
* Business Logic
* Data Persistence
* Shared Contracts (Enums, Types)

The system is designed to:

* Be deterministic
* Be user-isolated via API key
* Support analytics without client-side computation
* Be easily reviewable by AI and humans

---

## 2. High-Level Architecture Diagram (Logical)

```
Browser (React App)
│
│  HTTP (JSON + X-API-KEY)
│
▼
Backend API (Node.js + Express)
│
├── Middleware (API Key Validation, Rate Limiting)
├── Controllers (Request orchestration)
├── Services (Business + Analytics logic)
├── Data Access Layer (ORM)
│
▼
PostgreSQL Database
```

---

## 3. Monorepo Structure

The project is implemented as a **monorepo** to ensure strict consistency between frontend and backend.

```
/research-paper-tracker
│
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│   └── shared/
│
├── docs/
│   ├── BRD.md
│   ├── TAD.md
│   ├── UI_UX_SPECS.md
│   ├── API_CONTRACTS.md
│   └── AI_USAGE.md
│
├── .cursorrules/01.mdc
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json

```

---

## 4. Shared Package (`packages/shared`)

### Purpose

* Single source of truth for enums and types
* Prevent enum drift between frontend and backend

### Contents

```
packages/shared/
├── enums/
│   ├── researchDomain.ts
│   ├── readingStage.ts
│   └── impactScore.ts
│
├── types/
│   ├── paper.ts
│   ├── analytics.ts
│   └── api.ts
│
└── constants/
    ├── filters.ts
    └── rateLimits.ts
```

Both frontend and backend import from this package.

---

## 5. Backend Architecture

### 5.1 Backend Folder Structure

```
apps/backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── middleware/
│   │   ├── apiKeyAuth.ts
│   │   └── rateLimiter.ts
│   │
│   ├── routes/
│   │   ├── paper.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── controllers/
│   │   ├── paper.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/
│   │   ├── paper.service.ts
│   │   └── analytics.service.ts
│   │
│   ├── validators/
│   │   └── paper.validator.ts
│   │
│   ├── db/
│   │   ├── prisma.ts
│   │   └── schema.prisma
│   │
│   └── utils/
│       ├── hash.ts
│       └── date.ts
│
└── package.json
```

---

### 5.2 Backend Responsibilities

#### Middleware

* `apiKeyAuth`

  * Validates `X-API-KEY`
  * Hashes incoming key and matches against DB
* `rateLimiter`

  * Rate limits per API key
  * Separate limits for read/write routes

#### Controllers

* No business logic
* Input validation
* Service invocation
* HTTP response mapping

#### Services

* All business rules
* Duplicate detection
* Archive handling
* Analytics aggregation
* Filter application logic

#### Data Layer

* ORM-based (Prisma)
* Enums enforced at DB level
* Unique constraints enforced in schema

---

## 6. Database Design

### 6.1 Tables

#### UserAccessKey

```
id (uuid, pk)
hashed_key (string, unique)
created_at (timestamp)
```

#### Paper

```
id (uuid, pk)
title (text)
first_author (text)
research_domain (enum)
reading_stage (enum)
citation_count (int)
impact_score (enum)
date_added (date)
is_archived (boolean)
user_key_id (fk)
created_at (timestamp)
updated_at (timestamp)
```

### 6.2 Constraints

* Unique constraint:

  ```
  (title, first_author, user_key_id)
  ```
* Enums enforced at DB level

---

## 7. API Design

### 7.1 Authentication

* All requests require:

  ```
  X-API-KEY: <user-api-key>
  ```

---

### 7.2 Endpoints

#### Create Paper

```
POST /papers
```

#### Update Paper

```
PATCH /papers/:id
```

#### Get Papers

```
GET /papers
```

Supports filters via query params.

---

#### Archive Paper

```
PATCH /papers/:id/archive
```

---

#### Analytics

```
GET /analytics
```

Response structure:

```json
{
  "funnel": [],
  "scatter": [],
  "stackedBar": [],
  "summary": {}
}
```

---

## 8. Frontend Architecture

### 8.1 Frontend Folder Structure

```
apps/frontend/
├── src/
│   ├── pages/
│   │   ├── AddPaper.tsx
│   │   ├── Library.tsx
│   │   └── Analytics.tsx
│   │
│   ├── components/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── common/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── paper.service.ts
│   │
│   ├── hooks/
│   │   ├── useApiKey.ts
│   │   └── useFilters.ts
│   │
│   ├── state/
│   │   └── filters.store.ts
│   │
│   ├── utils/
│   │   └── formatters.ts
│   │
│   └── App.tsx
│
└── package.json
```

---

### 8.2 Frontend Responsibilities

* UI rendering
* Form validation
* Filter state management
* API consumption
* No analytics computation

---

## 9. Data Flow (End-to-End)

1. User opens app
2. API key is generated or imported
3. API key stored locally
4. API key attached to all requests
5. Backend middleware validates key
6. Controllers route requests
7. Services execute logic
8. DB queried/updated
9. Aggregated analytics returned
10. Frontend renders charts

---

## 10. Error Handling Strategy

### Backend

* Structured error responses
* Consistent HTTP status codes

### Frontend

* Inline form validation
* Toast notifications for API errors
* Graceful empty states

---

## 11. Deployment Architecture

* Frontend: Vercel
* Backend: Render / Railway
* Database: PostgreSQL / Supabase

Environment variables:

* DB connection string
* Rate limit configs

---

## 12. Code Quality & Review Readiness

* Clean separation of concerns
* Deterministic analytics
* No hidden state
* Shared enums
* Explicit AI usage documentation

