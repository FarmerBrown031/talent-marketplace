# Code Review — Talent Marketplace

**Date:** 2026-05-15
**Scope:** Full codebase review after initial scaffold (49 files)

---

## Summary

The codebase is structured well with clear separation of concerns. TypeScript strict mode is enabled. All API routes use Zod validation and uniform `{ data, error }` responses. Below are findings grouped by severity.

---

## High Priority

### H1. Apply page doesn't render custom questions dynamically
**File:** `src/app/jobs/[id]/apply/page.tsx`
**Issue:** The form only has hardcoded fields (name, email, phone, skills). Jobs can define `customQuestions` (text/textarea/file), but these are never fetched or rendered on the apply page. Applicants see no custom questions.
**Fix:** Fetch job on mount, render custom questions dynamically, include answers in the API payload.

### H2. Apply API route ignores customAnswers
**File:** `src/app/api/jobs/[id]/apply/route.ts`
**Issue:** The Zod schema and Prisma create call don't accept or store `customAnswers`. Even if the frontend sent answers, they'd be silently dropped — `customAnswers: "[]"` is hardcoded.
**Fix:** Accept `customAnswers` in the schema and pass to Prisma create.

### H3. No success feedback after applying
**File:** `src/app/jobs/[id]/page.tsx`
**Issue:** After applying, user is redirected to `?applied=true` but the page doesn't check this query param. The user sees the job detail again with no confirmation.
**Fix:** Read `searchParams.applied` and show a success banner.

### H4. Logout GET route uses `redirect()` in API route
**File:** `src/app/api/auth/logout/route.ts`
**Issue:** `redirect()` from `next/navigation` throws a redirect error intended for Server Components, not API routes. The GET handler may not work correctly. The POST handler uses `NextResponse.redirect()` which is correct.
**Fix:** Use `NextResponse.redirect()` in both handlers.

---

## Medium Priority

### M1. No loading states on client-side pages
**Files:**
- `src/app/company/jobs/[id]/page.tsx` (Edit Job)
- `src/app/company/talent/[id]/page.tsx` (Applicant Profile)

**Issue:** Both pages show a bare "Loading..." text while fetching data via `useEffect`. No skeleton/spinner.
**Fix:** Add a proper loading skeleton matching the form layout.

### M2. No root error boundary
**File:** Missing — should be `src/app/error.tsx`
**Issue:** No root-level `error.tsx` exists. Rendering crashes will show Next.js's default error page (white screen in production). We had one but removed it during build debugging.
**Fix:** Re-create `error.tsx` with proper "try again" button.

### M3. Hardcoded navigation header duplication
**Files:** `src/app/page.tsx`, `src/app/jobs/page.tsx`, `src/app/jobs/[id]/page.tsx`
**Issue:** The public header (brand + "Company Login" link) is duplicated in 3 files. If we add a nav item, we must update 3 places.
**Fix:** Extract a shared `PublicHeader` component.

### M4. No edge case handling for JSON.parse
**Files:** `src/app/jobs/[id]/page.tsx`, `src/app/company/talent/[id]/page.tsx`
**Issue:** `JSON.parse(job.customQuestions || "[]")` and `JSON.parse(applicant.workHistory || "[]")` assume well-formed JSON. If the DB has malformed JSON (e.g., from a bug in an earlier migration), it will crash the page with a runtime error.
**Fix:** Wrap in try/catch with a fallback to `[]`.

---

## Low Priority

### L1. Tiny tap targets on mobile
**Files:** All pages
**Issue:** Buttons like "Applicants" and "Edit" on the jobs list have small touch targets (`px-3 py-1.5`) that may be hard to tap on mobile.
**Fix:** Increase padding or add `min-h-[44px]` for touch friendliness.

### L2. Empty states are basic text
**Files:** All list pages
**Issue:** Empty states are just `<p>` tags with text. Could be more helpful with CTAs (e.g., "Post your first job" link on the jobs page when empty).
**Fix:** Add CTAs inside empty states.

### L3. No loading.tsx for server component pages
**Files:** Missing — should be `src/app/jobs/loading.tsx`, `src/app/company/jobs/loading.tsx`, etc.
**Issue:** Server component pages with `force-dynamic` show nothing while the DB query runs. Next.js supports `loading.tsx` for instant loading states.
**Fix:** Add `loading.tsx` files for route segments.

### L4. `satisfies ApiResponse` isn't type-safe
**Files:** All API routes
**Issue:** `satisfies ApiResponse` checks the shape but doesn't enforce it at the return level. If a future refactor changes `ApiResponse`, these won't error.
**Fix:** Use typed helper functions like `successResponse(data)` and `errorResponse(message, status)`.

---

## Recommendations Before Next Build Phase

1. Fix H1–H4 before adding new features (broken UX)
2. Address M1–M3 for polish (loading, error states, maintainability)
3. Extract shared components as pages grow (PublicHeader, LoadingSkeleton)
4. Add `loading.tsx` files alongside page groups that fetch data
