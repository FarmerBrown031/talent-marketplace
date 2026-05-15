# Talent Marketplace — Build Plan

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** SQLite via Prisma 5
- **Auth:** bcrypt + signed HMAC session cookie
- **Styling:** Tailwind CSS 4 — blue & white theme
- **Validation:** Zod

## Roles
- **`admin`** — global platform admin (`Company.role = "admin"`). Sees every company, job, applicant, and audit event. Seeded by `prisma/seed.ts`.
- **`owner`** — default for any company that registers via `/company/register`. Owns their workspace.
- **Team members** — created under `User` table by an owner via `/company/team`. Roles: `owner`, `member`, `viewer`. Status: `active`, `invited`, `disabled`. (Note: team members do not yet have their own login — they are managed records used by Owners to organize the workspace.)

### Seeded admin account
- Email: `pk.ngoie@gmail.com`
- Password: `12345678`
- Re-run with: `node node_modules/prisma/build/index.js db seed` *(see Windows-path note below)*

## Data Model

### Company
| Field | Type |
|---|---|
| id | UUID (PK) |
| name | String |
| email | String (unique) |
| passwordHash | String |
| role | String — `admin` \| `owner` (default `owner`) |
| createdAt | DateTime |

### User (company team member)
| Field | Type |
|---|---|
| id | UUID (PK) |
| companyId | UUID (FK → Company) |
| name | String |
| email | String (unique) |
| role | String — `owner` \| `member` \| `viewer` |
| status | String — `active` \| `invited` \| `disabled` |
| createdAt | DateTime |

### Job
| Field | Type |
|---|---|
| id | UUID (PK) |
| companyId | UUID (FK → Company) |
| title | String |
| description | Text |
| location | String |
| type | Enum: remote / onsite / hybrid |
| status | Enum: open / closed |
| customQuestions | JSON (array of {label, type}) |
| createdAt | DateTime |

### Applicant
| Field | Type |
|---|---|
| id | UUID (PK) |
| name | String |
| email | String (unique) |
| phone | String? |
| resumeUrl | String? |
| skills | String |
| workHistory | JSON (array of {company, role, years}) |
| createdAt | DateTime |

### Application (Kanban card)
| Field | Type |
|---|---|
| id | UUID (PK) |
| jobId | UUID (FK → Job) |
| applicantId | UUID (FK → Applicant) |
| customAnswers | JSON |
| status | Enum: `applied` \| `screening` \| `interview` \| `offer` \| `hired` \| `rejected` — used as the Kanban column |
| rating | Int 0–5 |
| notes | String |
| order | Int (within column) |
| createdAt | DateTime |
| updatedAt | DateTime |

### AuditLog
| Field | Type |
|---|---|
| id | UUID (PK) |
| actorId | String? |
| actorType | `admin` \| `company` \| `applicant` \| `system` |
| action | String (e.g. `application.update`, `user.invite`) |
| targetType | String (e.g. `Application`, `User`) |
| targetId | String? |
| companyId | UUID? (FK → Company) |
| metadata | JSON |
| createdAt | DateTime |

## Pages
| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing |
| `/jobs` | Public | Open job listings |
| `/jobs/[id]` | Public | Job detail |
| `/jobs/[id]/apply` | Public | Application form |
| `/company/login` | Public | Login (admins routed to `/admin`, owners to `/company/dashboard`) |
| `/company/register` | Public | Company registration |
| `/company/dashboard` | Owner | Company home with KPIs |
| `/company/jobs` | Owner | Manage jobs |
| `/company/jobs/new` | Owner | Create job |
| `/company/jobs/[id]` | Owner | Edit job |
| `/company/jobs/[id]/applicants` | Owner | Applicants per job (list view) |
| `/company/jobs/[id]/board` | Owner | **Kanban hiring board** for one job |
| `/company/boards` | Owner | Overview of every job's hiring board |
| `/company/talent` | Owner | Full talent pool |
| `/company/talent/[id]` | Owner | View/edit applicant |
| `/company/team` | Owner | Invite & manage team members |
| `/admin` | Admin | Platform overview + pipeline breakdown |
| `/admin/companies` | Admin | All companies |
| `/admin/jobs` | Admin | All jobs |
| `/admin/applicants` | Admin | All applicants |
| `/admin/audit` | Admin | Audit event log |

## API
| Endpoint | Purpose |
|---|---|
| `POST /api/auth/{register,login}` | Auth |
| `POST /api/auth/logout` | Destroy session |
| `GET/POST /api/jobs`, `PATCH/DELETE /api/jobs/[id]` | Job CRUD |
| `POST /api/jobs/[id]/apply` | Public apply (writes audit) |
| `GET /api/talent`, `PATCH /api/talent/[id]` | Talent CRUD |
| `PATCH /api/applications/[id]` | Move Kanban card / set rating / notes (writes audit) |
| `POST /api/team`, `PATCH/DELETE /api/team/[id]` | Team management (writes audit) |

## Build Order

### Status
| # | Step | Status |
|---|---|---|
| 1 | Scaffold project, Prisma schema, migrations | ✅ |
| 2 | Auth system (register, login, logout) | ✅ |
| 3 | Company dashboard & layout | ✅ |
| 4 | Job CRUD (create, list, edit, close) | ✅ |
| 5 | Public job listing & detail pages | ✅ |
| 6 | Application form (standard + dynamic custom questions) | ✅ |
| 7 | Company view: applicants per job | ✅ |
| 8 | Company view: full talent pool | ✅ |
| 9 | Company view: edit applicant profiles | ✅ |
| 10 | Polish: error handling, loading, empty states, responsiveness | ✅ |
| 11 | Role-based auth + seeded admin account | ✅ |
| 12 | Admin dashboard (companies, jobs, applicants, audit) | ✅ |
| 13 | Kanban hiring boards per job + `/company/boards` overview | ✅ |
| 14 | Team / user management under each company | ✅ |
| 15 | Platform-wide audit log | ✅ |
| 16 | Blue & white theme across all pages | ✅ |

### Remaining
- **Add middleware** — central auth guard for `/company/*` and `/admin/*` (currently each layout/page redirects manually)
- **Authenticated team-member login** — `User` table currently holds invited members but they don't log in yet
- **Drag-and-drop persistence ordering** — `Application.order` exists but reordering within a column is not yet wired up
- **Future:** file uploads, email notifications, pagination, exporting audit log as CSV

---

## Coding Rules

### TypeScript & Types
- `strict: true` in tsconfig — no exceptions
- Every function has an explicit return type
- Every API route handler returns typed responses
- No `any` — use `unknown` + type guards if needed
- Prisma types used over raw TS interfaces

### File & Folder Structure
```
src/
  app/
    admin/      — admin-only pages (require role=admin)
    company/    — owner workspace (dashboard, jobs, boards, talent, team)
    jobs/       — public job listings and apply flow
    api/        — API routes (REST, { data, error } shape)
  components/   — Reusable React components
  lib/          — prisma, auth, audit, session, types, json
prisma/
  schema.prisma — Data model
  seed.ts       — Seeds the admin account
```
- One component per file
- Server Components by default; `"use client"` only when needed
- Route handlers grouped under `src/app/api/`

### Database (Prisma)
- Single Prisma client instance (global singleton for dev)
- All DB access through helpers in `src/lib/` where shared logic exists
- Index all foreign keys and frequently queried columns
- Every state-changing mutation should call `recordAudit(...)` from `@/lib/audit`

### API Design
- RESTful: `GET /api/jobs`, `POST /api/jobs`, `PATCH /api/jobs/[id]`
- Every API response has shape: `{ data?: T, error?: string }`
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500
- Auth required routes return 401 immediately
- Admin override (`company.role === "admin"`) bypasses per-company ownership checks

### Validation (Zod)
- Every API input validated with a Zod schema before processing
- Custom questions: `{label: string, type: "text"|"textarea"|"file"}[]`
- Application status restricted to the 6 stages above

### Security
- Passwords hashed with bcrypt (12 rounds)
- Session stored in httpOnly, secure, sameSite cookies, signed with HMAC-SHA256
- `SESSION_SECRET` required at boot; must not equal the template value in production
- No secrets in client-side code

### Error Handling
- API routes wrapped in try/catch → return `{ error: message }` + status
- Pages use `error.tsx` error boundaries
- Forms show inline field-level errors from Zod

### Git & Commits
- `.env` and `.env.local` never committed (only `.env.template` is tracked)
- No debug logs, console.log, or commented code in commits
- One logical change per commit with descriptive message

---

## Windows-path note
This project lives under `OneDrive - Kula Staffing & Consulting B.V\...` — Node's argv parser splits on the unquoted space, so `npm run dev`, `npx prisma`, and `npx next` all fail. Use direct binary invocations instead:

```powershell
node node_modules/next/dist/bin/next dev
node node_modules/prisma/build/index.js migrate dev
node node_modules/prisma/build/index.js generate
```

Production builds still require copying to a space-free path as noted in `AGENTS.md`.
