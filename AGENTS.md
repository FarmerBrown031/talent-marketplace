<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Talent Marketplace — Agent Instructions

## Project Overview
Next.js 16 App Router + Prisma 5 (SQLite) + bcrypt auth + Tailwind CSS.
A talent marketplace where companies post jobs, applicants apply via public links, and companies manage a talent pool.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build (run from temp dir — see below)
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Known Issues

### Path with spaces breaks production build
The project is at `OneDrive - Kula Staffing & Consulting B.V\...` (spaces in path).
Next.js 16 Turbopack fails during static page generation when the project root has spaces.
**Workaround**: Run build from a path without spaces:
```powershell
cp -r "OpenCode" "C:\temp\marketplace"   # copy to temp dir
cd C:\temp\marketplace
npm run build                              # builds fine
```

## File Structure
```
src/
  app/          — App Router pages & API routes
  components/   — Reusable React components (create as needed)
  lib/          — prisma.ts, auth.ts, types.ts
prisma/
  schema.prisma — Data model
PLAN.md         — Full plan, rules, status
```

## Coding Rules
- Strict TypeScript — no `any`, explicit return types
- Server Components by default; `"use client"` only when needed
- API routes: uniform `{ data?: T, error?: string }` responses
- All inputs validated with Zod
- No console.log in committed code
- `.env` never committed (in `.gitignore`)

## Useful URLs
- `/` — Landing page with links
- `/company/register` — Company sign-up
- `/company/login` — Company login
- `/company/dashboard` — Dashboard (after login)
- `/jobs` — Public job listings
- `/jobs/[id]` — Job detail + apply button
- `/jobs/[id]/apply` — Application form
