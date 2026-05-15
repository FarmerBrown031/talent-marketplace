# Talent Marketplace — Build Plan

## Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** SQLite via Prisma ORM
- **Auth:** bcrypt + session cookies (NextAuth.js optional upgrade)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Forms:** react-hook-form

## Data Model

### Company
| Field | Type |
|---|---|
| id | UUID (PK) |
| name | String |
| email | String (unique) |
| passwordHash | String |
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
| email | String |
| phone | String? |
| resumeUrl | String? |
| skills | String |
| workHistory | JSON (array of {company, role, years}) |
| createdAt | DateTime |

### Application
| Field | Type |
|---|---|
| id | UUID (PK) |
| jobId | UUID (FK → Job) |
| applicantId | UUID (FK → Applicant) |
| customAnswers | JSON (array of {questionLabel, answer}) |
| status | Enum: new / reviewed / hired / rejected |
| createdAt | DateTime |

## Pages
| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing / job listings |
| `/jobs` | Public | All open jobs |
| `/jobs/[id]` | Public | Single job detail |
| `/jobs/[id]/apply` | Public | Application form |
| `/company/login` | Public | Company login |
| `/company/register` | Public | Company registration |
| `/company/dashboard` | Auth | Company home |
| `/company/jobs` | Auth | Manage jobs |
| `/company/jobs/new` | Auth | Create job |
| `/company/jobs/[id]` | Auth | Edit job |
| `/company/jobs/[id]/applicants` | Auth | Applicants per job |
| `/company/talent` | Auth | Full talent pool |
| `/company/talent/[id]` | Auth | View/edit applicant |

## Build Order

### Status
| # | Step | Status |
|---|---|---|
| 1 | Scaffold project, Prisma schema, migrations | ✅ Done |
| 2 | Auth system (register, login, logout) | ✅ Done |
| 3 | Company dashboard & layout | ✅ Done |
| 4 | Job CRUD (create, list, edit, close) | ✅ Done |
| 5 | Public job listing & detail pages | ✅ Done |
| 6 | Application form (standard + dynamic custom questions) | ✅ Done |
| 7 | Company view: applicants per job | ✅ Done |
| 8 | Company view: full talent pool | ✅ Done |
| 9 | Company view: edit applicant profiles | ✅ Done |
| 10 | Polish: error handling, loading, empty states, responsiveness | ✅ Done |

### Remaining
- **Add middleware** — Central auth guard for `/company/*` routes
- **Code review report** → `docs/codereview.md`
- Future: file uploads, email notifications, pagination

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
  app/          — App Router pages & API routes
  components/   — Reusable React components
  lib/          — Utilities, db client, helpers
  types/        — Shared TS types
prisma/
  schema.prisma — Data model
```
- One component per file
- Server Components by default; `"use client"` only when needed
- Route handlers grouped under `src/app/api/`

### Database (Prisma)
- Single Prisma client instance (global singleton for dev)
- All DB access through service functions in `src/lib/`, never inline in routes
- Use transactions for multi-table writes
- Index all foreign keys and frequently queried columns

### API Design
- RESTful: `GET /api/jobs`, `POST /api/jobs`, `PATCH /api/jobs/[id]`
- Every API response has shape: `{ data?: T, error?: string }`
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
- Auth required routes return 401 immediately

### Validation (Zod)
- Every API input validated with a Zod schema before processing
- Custom questions validated for structure (must be `{label: string, type: "text"|"textarea"|"file"}[]`)
- Company email validated on register + login

### Security
- Passwords hashed with bcrypt (12 rounds)
- Session stored in httpOnly, secure, sameSite cookies
- No secrets in client-side code
- File uploads: validate MIME type, max 5MB, stored outside `public/`

### Error Handling
- API routes wrapped in try/catch → return `{ error: message }` + status
- Pages use `error.tsx` error boundaries
- Forms show inline field-level errors from Zod

### Git & Commits
- `.env` and `.env.local` never committed (in `.gitignore`)
- No debug logs, console.log, or commented code in commits
- One logical change per commit with descriptive message
