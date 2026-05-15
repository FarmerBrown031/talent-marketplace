<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Talent Marketplace — Agent Instructions

## Project Overview
Next.js 16 App Router + Prisma 5 (SQLite) + bcrypt auth + Tailwind CSS (blue & white theme).
A talent marketplace where companies post jobs, applicants apply via public links, companies move applicants through a per-job Kanban hiring board, and a platform admin oversees everything.

## Roles & seeded accounts
- `Company.role = "admin"` — global admin, lands at `/admin`.
- `Company.role = "owner"` (default) — lands at `/company/dashboard`.
- `User` rows are team members of a Company managed at `/company/team` (no separate login yet — managed records only).

Seeded admin (refreshed every time `prisma/seed.ts` runs):
- Email: `pk.ngoie@gmail.com`
- Password: `12345678`

## Application stages (Kanban columns)
`applied → screening → interview → offer → hired → rejected`. The single source of truth is `APPLICATION_STAGES` in `src/lib/types.ts`. `Application.status` **must** be one of these six values — the original `new`/`reviewed` values were migrated away.

## Audit log
Every state-changing API (login, application create/move, team invite/update/delete) calls `recordAudit(...)` from `@/lib/audit`. Admins read the log at `/admin/audit`. When you add a new mutation, record an audit entry.

## Commands

```bash
npm run dev        # Start dev server          (use node fallback if path has spaces)
npm run build      # Production build          (run from temp dir — see below)
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Known Issues

### Path with spaces breaks `npm run *` and `npx`
The project lives at `OneDrive - Kula Staffing & Consulting B.V\...`. Node's argv parser splits on the unquoted space, so `npm run dev`, `npx prisma`, and `npx next` all fail with `'Consulting' is not recognized` or `Cannot find module 'C:\Users\Parfait Ngoie\...'`. Invoke the binaries directly:

```powershell
node node_modules/next/dist/bin/next dev
node node_modules/prisma/build/index.js migrate dev --name <name>
node node_modules/prisma/build/index.js generate
node --experimental-strip-types prisma/seed.ts
```

For production builds, the Turbopack issue still requires a space-free path:
```powershell
cp -r "OpenCode" "C:\temp\marketplace"
cd C:\temp\marketplace
npm run build
```

## File Structure
```
src/
  app/
    admin/      — admin-only pages (role=admin required)
    company/    — owner workspace (dashboard, jobs, boards, talent, team)
    jobs/       — public listings + apply
    api/        — API routes
  components/   — KanbanBoard, TeamManager, PublicHeader, …
  lib/          — prisma, auth, session, audit, json, logger, types
prisma/
  schema.prisma
  seed.ts       — creates/refreshes the admin account
PLAN.md         — Full plan, rules, status
docs/codereview.md — historical code review
```

## Coding Rules
- Strict TypeScript — no `any`, explicit return types
- Server Components by default; `"use client"` only when needed
- API routes: uniform `{ data?: T, error?: string }` responses
- All inputs validated with Zod
- Every state-changing mutation calls `recordAudit(...)` from `@/lib/audit`
- Admin override: when `company.role === "admin"`, bypass per-company ownership checks in API routes
- Blue/white theme — no `bg-black`/`text-zinc-*` for primary surfaces; use `bg-blue-600`/`text-blue-900`/`text-blue-700`
- No console.log in committed code
- `.env` never committed (in `.gitignore`); only `.env.template` is tracked

## Useful URLs
**Public**
- `/` — Landing
- `/jobs` — Open job listings
- `/jobs/[id]` — Job detail + apply
- `/jobs/[id]/apply` — Application form

**Owner**
- `/company/register`, `/company/login`
- `/company/dashboard` — KPIs
- `/company/jobs` — Manage jobs
- `/company/jobs/[id]/board` — **Kanban hiring board for one job**
- `/company/boards` — Overview of every job's board
- `/company/talent`, `/company/talent/[id]` — Talent pool
- `/company/team` — Invite & manage team

**Admin**
- `/admin` — Platform overview
- `/admin/companies`, `/admin/jobs`, `/admin/applicants`, `/admin/audit`
