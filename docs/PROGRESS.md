# CommitteeKart - Progress Tracker

> Yeh file project ki "memory" hai. Har baar jab kaam shuru karein,
> is file mein dekhein ke kahan tak hua aur kahan se shuru karna hai.

---

## Phase 1 - Foundation [COMPLETE]

- [x] Project scaffold (Next.js 16, TypeScript, Tailwind v4)
- [x] Supabase client setup (browser + server)
- [x] Database schema (5 tables, enums, RLS, triggers)
- [x] Auth middleware/proxy (protected routes, session refresh)
- [x] Landing page with CommitteeKart branding
- [x] Signup/Login/Logout pages and actions
- [x] Dashboard placeholder
- [x] Git + GitHub repo (https://github.com/datawithusman/committeekart)
- [x] Supabase project connected + schema run
- [x] Auth flow tested and verified

---

## Phase 2 - Core Features [COMPLETE]

### Features Built
- [x] Draw schedule generator (lottery, fixed, auction with Fisher-Yates shuffle)
- [x] Committee create flow (form + server action + auto member insertion)
- [x] Dynamic member rows (add/remove on create committee form)
- [x] Dashboard with real committees list from database
- [x] Dashboard stats (total committees, collected, pending)
- [x] Committee detail page (members, contributions, draw schedule)
- [x] Interactive ContributionRow (mark paid/pending toggle)
- [x] Current month contributions display (date-based calculation)
- [x] Contributions created for ALL months at committee creation
- [x] Empty states (no committees, no contributions)

### Code Review Fixes Applied
- [x] IDOR prevention (ownership verification in contribution actions)
- [x] Cookie secure flag respects NODE_ENV (was hardcoded false)
- [x] Thorough server-side validation (NaN, lengths, enum checks)
- [x] ROSCA fairness guarantee enforced (duration = member count)
- [x] Partial failure cleanup (cascade delete on error)
- [x] Error messages displayed on create committee page (was silent)
- [x] Contribution actions return ActionResult for error handling
- [x] Draw schedule no longer cycles members (fairness)
- [x] Updated metadata (was "Create Next App" boilerplate)
- [x] RLS infinite recursion fixed (migration 0002)
- [x] Button text changed to English throughout

### Documentation
- [x] 14 professional documents created (9,600+ lines)
- [x] Project Proposal, SRS, User Stories, Use Case Diagram
- [x] Flowcharts, Wireframes, Database Design, Architecture
- [x] API Documentation, Test Plan, User Manual, Deployment Guide
- [x] README updated with documentation index

### Manually Tested
- [x] Landing page renders correctly
- [x] Signup creates account and redirects to dashboard
- [x] Login authenticates and redirects to dashboard
- [x] Logout works
- [x] Protected routes redirect to login when logged out
- [x] Committee creation works (after RLS recursion fix)
- [x] Committee detail page shows members, contributions, draws

---

## Next Phase: Phase 3 - Polish and Deploy [NOT STARTED]

### Planned Tasks
- [ ] Vercel deployment (web app live)
- [ ] Landing page polish (better hero, testimonials section)
- [ ] Settings/Profile page (view/edit name, phone, plan)
- [ ] Committee edit/delete functionality
- [ ] Member invite links (shareable URLs)
- [ ] Reports / CSV export
- [ ] WhatsApp reminder integration
- [ ] PWA setup (installable on mobile)
- [ ] Error boundary and loading states (error.tsx, loading.tsx)
- [ ] Future: React Native mobile app

### Deferred from Code Review (Nice to Have)
- [ ] Unit tests for draw-schedule.ts
- [ ] Auth input validation (email format, password length server-side)
- [ ] Login redirect param support (?redirect=/committees/xxx)
- [ ] Duplicate member prevention (name+phone unique constraint)
- [ ] Reproducible lottery (store seed for auditability)
- [ ] Global error boundary (error.tsx)
- [ ] Not-found page customization (not-found.tsx)
- [ ] Loading skeletons (loading.tsx)

---

## How to Resume

Jab bhi session start karein:
1. Is file mein check karein current phase
2. "Next Phase" wale tasks se shuru karein

**Current next action:** Phase 3 - Vercel deployment + polish
