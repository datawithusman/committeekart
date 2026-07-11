# CommitteeKart - Deployment Guide

> Complete guide for deploying CommitteeKart to production (web),
> setting up future mobile app releases, managing environments, and
> establishing CI/CD and backup strategies.

---

## Table of Contents

1. [Web Deployment (Vercel)](#1-web-deployment-vercel)
2. [Environment Variables Setup](#2-environment-variables-setup)
3. [Custom Domain Setup](#3-custom-domain-setup)
4. [Database Migration on Production Supabase](#4-database-migration-on-production-supabase)
5. [Mobile App Deployment (Future)](#5-mobile-app-deployment-future)
6. [CI/CD Pipeline Recommendations](#6-cicd-pipeline-recommendations)
7. [Environment Management](#7-environment-management)
8. [Backup and Recovery Strategy](#8-backup-and-recovery-strategy)

---

## 1. Web Deployment (Vercel)

CommitteeKart is a Next.js 16 App Router application. Vercel is the
recommended hosting platform because it is built by the Next.js team,
offers a generous free tier, and supports zero-config deployments.

### 1.1 Prerequisites

Before deploying, ensure the following are ready:

| Requirement | Details |
|-------------|---------|
| GitHub account | The repo must be on GitHub (https://github.com/datawithusman/committeekart) |
| Vercel account | Sign up free at https://vercel.com (use GitHub login) |
| Supabase project | A production Supabase project with the schema migrated |
| Node.js 18+ | Local development environment tested |
| Build verified | `npm run build` passes locally with no errors |

### 1.2 Step-by-Step Vercel Deploy Process

#### Step 1: Push Code to GitHub

Ensure all changes are committed and pushed to the main branch:

```bash
git add .
git commit -m "feat: ready for production deploy"
git push origin main
```

#### Step 2: Import the Project on Vercel

1. Go to https://vercel.com and log in with GitHub
2. Click **"Add New"** > **"Project"**
3. Find "committeekart" in the repository list
4. Click **"Import"**

[SCREENSHOT: Vercel import project page showing the committeekart repo]

#### Step 3: Configure Project Settings

On the import page, Vercel auto-detects Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `./` (default) |
| Build Command | `next build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` (auto-detected) |

No changes needed here. Vercel reads `package.json` automatically.

#### Step 4: Add Environment Variables

Before clicking Deploy, expand the **"Environment Variables"** section
and add the required variables (see
[Section 2](#2-environment-variables-setup) for details).

#### Step 5: Deploy

Click **"Deploy"**. The build takes 1 to 3 minutes typically.

Vercel will show a build log. When done, you get a success screen with
a temporary URL like:
`https://committeekart-abc123.vercel.app`

#### Step 6: Verify the Deployment

Open the deployment URL and:
1. Verify the landing page loads
2. Try signing up with a test account
3. Verify the Supabase connection works (signup should succeed)
4. Check that protected routes redirect to /login
5. Test creating a committee end-to-end

#### Step 7: Set Up Production URL

By default, every Vercel project gets a `*.vercel.app` domain. To use
a custom domain, see [Section 3](#3-custom-domain-setup).

### 1.3 Subsequent Deployments

After the initial setup, deployments are automatic:

- **Push to `main`** triggers a production deployment
- **Push to any other branch** creates a preview deployment
- **Pull requests** get their own preview URLs for review

Each deployment gets a unique URL for rollback if needed.

### 1.4 Vercel Project Settings to Verify

After the first deploy, check these in the Vercel dashboard:

1. **Settings > General > Node.js Version**: Set to 18.x or 20.x
2. **Settings > Functions**: Verify serverless function memory (default 1024MB is fine)
3. **Settings > Domains**: Add custom domain here
4. **Settings > Environment Variables**: Confirm all variables are set for Production, Preview, and Development

---

## 2. Environment Variables Setup

CommitteeKart uses two public environment variables for Supabase.
These are safe to expose to the browser because they are paired with
Row Level Security on the database.

### 2.1 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://josuxzrioqpufdidtbct.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key | `sb_publishable_abc123...` |

### 2.2 Adding Variables on Vercel

1. Go to your project on Vercel
2. **Settings** > **Environment Variables**
3. Click **"Add New"**
4. Enter the key and value
5. Select environments: **Production**, **Preview**, **Development**
6. Click **"Save"**

[SCREENSHOT: Vercel environment variables page with both Supabase variables added]

Repeat for both variables.

> **Important:** After adding or changing environment variables, you
> must trigger a redeployment for the changes to take effect. Go to
> "Deployments" and click "Redeploy" on the latest deployment.

### 2.3 Getting Supabase Credentials

1. Go to https://supabase.com and open your project
2. **Project Settings** (gear icon) > **API**
3. Copy the **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the **publishable key** / **anon key** (this is
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

> **Note:** Supabase now calls the anon key "publishable key". Both
> refer to the same thing. It is safe to use in client-side code
> because RLS protects the data.

### 2.4 Local Development Variables

For local development, copy `.env.local.example` to `.env.local` and
fill in the values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key-here
```

> **Never commit `.env.local` to git.** It is already in `.gitignore`.

---

## 3. Custom Domain Setup

### 3.1 Adding a Custom Domain on Vercel

1. Go to your project on Vercel
2. **Settings** > **Domains**
3. Enter your domain (e.g. `committeekart.com`)
4. Click **"Add"**

[SCREENSHOT: Vercel domains settings page]

### 3.2 Configure DNS Records

Vercel shows you the DNS records to add. Typically:

**Option A: Use Vercel Nameservers (recommended for new domains)**

Change your domain's nameservers to Vercel's at your registrar
(GoDaddy, Namecheap, etc.).

**Option B: Add DNS Records Manually**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

### 3.3 SSL Certificate

Vercel automatically provisions an SSL certificate (HTTPS) once the
DNS is configured. This takes 5 to 30 minutes. The certificate
auto-renews.

### 3.4 Redirect www to apex (or vice versa)

In Vercel Domains settings, you can configure:
- Redirect `www.committeekart.com` to `committeekart.com`
- Or redirect `committeekart.com` to `www.committeekart.com`

Choose one and stick with it.

### 3.5 Update Supabase Auth Redirect URLs

After adding a custom domain, update Supabase to allow the new domain
for auth redirects:

1. Go to Supabase > **Authentication** > **URL Configuration**
2. Add your production URL to **Site URL**: `https://committeekart.com`
3. Add to **Redirect URLs**:
   - `https://committeekart.com/**`
   - `https://committeekart-abc123.vercel.app/**` (Vercel preview URL)
   - `http://localhost:3000/**` (for local dev)

---

## 4. Database Migration on Production Supabase

When you make schema changes (new migrations), you need to apply them
to your production Supabase project.

### 4.1 Current Migrations

| File | Description |
|------|-------------|
| `supabase/migrations/0001_initial_schema.sql` | Initial schema: tables, enums, RLS policies, trigger |
| `supabase/migrations/0002_fix_rls_recursion.sql` | Fixes infinite recursion in RLS policies |

### 4.2 Running a Migration on Production

#### Step 1: Back Up First

Before any migration, create a backup (see
[Section 8](#8-backup-and-recovery-strategy)).

#### Step 2: Open Supabase SQL Editor

1. Go to your production Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**

#### Step 3: Run the Migration

1. Open the migration file from your local repo
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"**

[SCREENSHOT: Supabase SQL Editor with migration SQL pasted and ready to run]

#### Step 4: Verify

After running:
1. Check for "Success" message
2. Go to **Table Editor** and verify the tables exist
3. Go to **Authentication > Policies** and verify RLS policies are active
4. Test the app to ensure nothing broke

### 4.3 Migration Best Practices

1. **Always test locally first.** Run the migration against a local or
   staging Supabase project before production.
2. **Never run seed data on production.** The `supabase/seed.sql` file
   is for development only.
3. **One migration at a time.** Do not batch multiple schema changes
   into one production run.
4. **Document the change.** Add a note to the migration file explaining
   what changed and why.
5. **Have a rollback plan.** For every migration, know how to undo it
   (drop table, drop column, restore policy).

### 4.4 Using the Supabase CLI (Alternative)

For a more controlled migration process, use the Supabase CLI:

```bash
# Install the CLI
npm install -g supabase

# Link to your production project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

This applies all unapplied migrations in order. The CLI tracks which
migrations have been run.

---

## 5. Mobile App Deployment (Future)

CommitteeKart will become a React Native mobile app after the web PWA
is stable. This section outlines the requirements for both stores.

### 5.1 Architecture Decision

The web app (Next.js) will be wrapped or rebuilt as a React Native app.
The Supabase backend stays the same. The mobile app will share the same
database, auth, and RLS policies.

**Recommended approach:** React Native with Expo for faster development
and easier store submissions.

### 5.2 Android Deployment (Google Play Store)

#### 5.2.1 Google Play Developer Account

| Requirement | Details |
|-------------|---------|
| Account type | Google Play Developer |
| Cost | $25 USD (one-time fee) |
| Sign up | https://play.google.com/console |
| Verification | Identity verification required (ID, phone) |

#### 5.2.2 Signed AAB Build

Google Play requires Android App Bundle (AAB) format, not APK.

```bash
# Using Expo EAS
npm install -g eas-cli
eas login
eas build:configure

# Build for production
eas build --platform android --profile production
```

The build must be signed with a release keystore. EAS handles this
automatically, or you can manage your own keystore:

```bash
# Generate a keystore (one-time)
keytool -genkey -v -keystore committeekart.keystore \
  -alias committeekart -keyalg RSA -keysize 2048 -validity 10000
```

> **Critical:** Keep the keystore file and passwords safe. If you lose
> them, you cannot update the app on the Play Store. Back them up in
> multiple secure locations.

#### 5.2.3 Store Listing Requirements

| Asset | Specification |
|-------|---------------|
| App name | "CommitteeKart - Committee Tracker" |
| Short description | 80 characters max |
| Full description | 4000 characters max |
| App icon | 512 x 512 px PNG |
| Feature graphic | 1024 x 500 px PNG |
| Phone screenshots | Minimum 2, recommended 4 to 8 (minimum 320px, max 3840px) |
| Category | Finance |
| Content rating | Fill out the IARC questionnaire (likely "Everyone") |
| Target audience | 18+ (financial app) |

#### 5.2.4 Privacy Policy and Data Safety

Google Play requires:

1. **Privacy Policy URL**: Host a privacy policy page (can be on your
   website). Must explain:
   - What data is collected (email, name, phone)
   - How it is used (committee tracking)
   - Whether it is shared (no third-party sharing)
   - User rights (data deletion on request)

2. **Data Safety Form**: Declare in the Play Console:
   - Data collected: Personal info (name, email, phone)
   - Data use: App functionality
   - Encryption: Data encrypted in transit (Supabase uses HTTPS)
   - Data deletion: Users can request deletion
   - No financial data is stored (app does not process payments)

> **Important:** Since CommitteeKart follows "Track, Don't Hold", the
> app does NOT collect payment card details, bank account numbers, or
> process transactions. State this clearly. It simplifies the Data
> Safety form significantly.

#### 5.2.5 Testing Requirements

Google Play has specific testing requirements for new apps:

| Testing Track | Requirement |
|---------------|-------------|
| Internal testing | Up to 100 testers |
| Closed testing (required before production) | **20+ testers for 14 days** of continuous testing |

> **Closed Testing Requirement (Updated 2024+):** Google now requires
> new personal accounts to run a closed test with at least 20 testers
> for 14 consecutive days before applying for production access. Plan
> for this timeline.

**Steps for closed testing:**
1. Create a closed testing track in Play Console
2. Add a Google Group or Google Group email with your testers
3. Build and upload the AAB to the closed track
4. Have testers opt in via the testing link
5. Testers install and use the app for 14 days
6. After 14 days, you can apply for production

#### 5.2.6 Production Rollout

1. Complete all testing tracks
2. Fill out the Store Listing
3. Complete Data Safety form
4. Complete Content Rating questionnaire
5. Set pricing (Free)
6. Select countries (start with Pakistan, India, Bangladesh, UAE, UK, USA)
7. Submit for review
8. Review typically takes 1 to 7 days
9. Use staged rollout (start with 10%, increase to 100%)

### 5.3 iOS Deployment (App Store)

#### 5.3.1 Apple Developer Account

| Requirement | Details |
|-------------|---------|
| Account type | Apple Developer Program |
| Cost | $99 USD per year |
| Sign up | https://developer.apple.com |
| Verification | Two-factor authentication required |

#### 5.3.2 Build Requirements

- Build with Xcode on a macOS machine
- Or use Expo EAS Build (cloud-based, no Mac needed)
- App must target a supported iOS version (typically iOS 14+)
- Submit in IPA format via App Store Connect or `eas submit`

#### 5.3.3 App Store Requirements (Overview)

| Requirement | Details |
|-------------|-------------|
| App name | "CommitteeKart" (must be unique) |
| App screenshots | Required for all device sizes (6.7", 6.5", 5.5", iPad) |
| App icon | 1024 x 1024 px PNG (no alpha channel) |
| Description | Keywords and full description |
| Privacy Policy | Required URL (same as Android) |
| App Privacy | Declare data collection in App Store Connect |
| Support URL | A support webpage or contact email |
| Review notes | Explain that the app does NOT process payments |

> **iOS Review Tip:** Apple reviewers may reject the app if they
> think it handles financial transactions. Add a clear note in the
> review notes: "This app is a tracking tool only. It does not
> process, hold, or transfer any money. There is no payment gateway."

#### 5.3.4 Review Process

- First review: 1 to 3 days typically
- May require 1 to 2 rounds of revisions
- Common rejection reasons: missing privacy policy, unclear value
  proposition, or perceived financial functionality

### 5.4 Shared Considerations for Both Platforms

1. **Consistent branding**: Same app name, icon, colors across web
   and mobile
2. **Same backend**: Both use the same Supabase project and database
3. **Auth sync**: Users can log in on web or mobile with the same
   account
4. **Push notifications**: Plan for local notifications (payment
   reminders) and optionally remote notifications
5. **Offline support**: Consider what happens when the user is offline
   (queue actions, show cached data)

---

## 6. CI/CD Pipeline Recommendations

### 6.1 Recommended Stack

| Stage | Tool |
|-------|------|
| Source control | GitHub |
| CI/CD | GitHub Actions |
| Hosting (web) | Vercel |
| Database | Supabase |
| E2E testing | Playwright |
| Unit testing | Vitest |

### 6.2 GitHub Actions Workflow

Create a file at `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}
```

### 6.3 Pipeline Stages

```
Code Push
    |
    v
[1] Install (npm ci)
    |
    v
[2] Lint (npm run lint) ----- FAIL --> Notify developer
    |
    v
[3] Type Check (tsc) -------- FAIL --> Notify developer
    |
    v
[4] Unit Tests (vitest) ----- FAIL --> Notify developer
    |
    v
[5] Build (next build) ------ FAIL --> Notify developer
    |
    v
[6] Deploy to Vercel Preview (auto on PR)
    |
    v
[7] E2E Tests (Playwright) -- FAIL --> Block merge
    |
    v
[8] Merge to main
    |
    v
[9] Deploy to Vercel Production (auto)
```

### 6.4 Vercel Integration

Vercel integrates directly with GitHub. You do not need a separate
deploy step in GitHub Actions for web. Vercel handles:

- Automatic deploy on push to main (production)
- Automatic preview deploy on pull requests
- Instant rollback via dashboard

GitHub Actions is used for pre-deploy checks (lint, test, build). Vercel
handles the actual deployment.

### 6.5 Branch Protection Rules

Set up on GitHub (Settings > Branches > Branch protection rules):

1. Require pull request before merging to main
2. Require status checks to pass (lint, type check, build)
3. Require at least 1 approval (if working in a team)
4. Require branches to be up to date before merging

---

## 7. Environment Management

### 7.1 Three Environments

CommitteeKart should maintain three environments:

| Environment | Purpose | Supabase Project | URL |
|-------------|---------|------------------|-----|
| **Development** | Local coding and testing | Local Supabase (Docker) or a dev project | `http://localhost:3000` |
| **Staging** | Pre-production testing, QA | Separate staging Supabase project | `staging.committeekart.com` or Vercel preview |
| **Production** | Live app for real users | Production Supabase project | `committeekart.com` |

### 7.2 Why Separate Supabase Projects?

- **Data isolation:** Test data never touches production data
- **Safe migrations:** Test schema changes on staging first
- **Independent RLS testing:** Verify security policies without risk
- **No rate limit interference:** Dev tests do not consume production API limits

### 7.3 Environment Variable Management

| Variable | Dev | Staging | Production |
|----------|-----|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Local/project URL | Staging project URL | Production project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dev key | Staging key | Production key |

On Vercel, use the **Environment** selector when adding variables to
assign different values to Production, Preview, and Development.

### 7.4 Promotion Flow

```
Development (local)
    |
    | "Feels good, ready for testing"
    v
Staging (Vercel Preview + Staging Supabase)
    |
    | "All tests pass, QA approved"
    v
Production (Vercel Production + Production Supabase)
```

**Never skip staging.** Even a small change can break production if
it touches the database schema or RLS policies.

---

## 8. Backup and Recovery Strategy

### 8.1 What Needs Backing Up

| Asset | Importance | Frequency |
|-------|------------|-----------|
| Supabase database (production) | Critical | Daily automatic + manual before migrations |
| Environment variables | High | On every change |
| Code (GitHub repo) | Critical | Every commit (automatic via Git) |
| Vercel deployment configurations | Medium | On change |
| Supabase Auth keys and service role key | Critical | Stored securely, never in code |

### 8.2 Supabase Database Backups

#### Automatic Backups

Supabase provides automatic backups depending on your plan:

| Plan | Backup Frequency | Retention |
|------|-----------------|-----------|
| Free | Daily | 7 days |
| Pro ($25/month) | Daily + Point-in-time recovery | 30 days |
| Team/Enterprise | Daily + PITR + Logical backups | 30+ days |

> **Recommendation:** Upgrade to Supabase Pro for production. The
> Point-in-Time Recovery (PITR) feature lets you restore the database
> to any second within the last 7 days, which is invaluable if a
> bad migration corrupts data.

#### Manual Backups

Before any migration or risky operation, take a manual backup:

**Method 1: Supabase Dashboard**
1. Go to Supabase > **Database** > **Backups**
2. Click **"Create backup"**

**Method 2: SQL Dump (via CLI)**
```bash
# Using pg_dump (requires connection string from Supabase settings)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  --no-owner --no-privileges \
  -f backup_$(date +%Y%m%d).sql
```

**Method 3: Export via Supabase Dashboard**
1. Go to **Table Editor**
2. For each table, use the export option (CSV)

### 8.3 Recovery Procedure

#### Scenario: A Bad Migration Corrupted Data

1. **Stop:** Do not run more migrations
2. **Assess:** Check what was affected (which tables, which rows)
3. **Restore from backup:**
   - If using PITR (Pro plan): Restore to the timestamp just before
     the migration
   - If using manual backup: Run the SQL dump file in reverse or
     restore from the Supabase backup dashboard
4. **Test:** Verify the app works with the restored data
5. **Fix:** Correct the migration file and re-test on staging

#### Scenario: Accidental Data Deletion

1. If a user accidentally deleted data, check if RLS prevented it
   (organizers can delete their own committees, which cascades)
2. Restore from the most recent backup
3. Inform affected users

### 8.4 Code Backup (GitHub)

The code is backed up via Git/GitHub automatically. Best practices:

1. **Push frequently** (at least daily when actively developing)
2. **Use tags for releases:**
   ```bash
   git tag -a v1.0.0 -m "Phase 2 release"
   git push origin v1.0.0
   ```
3. **GitHub itself is backed up** but consider mirroring to another
   provider (GitLab, Bitbucket) for redundancy

### 8.5 Environment Variable Backup

Environment variables are NOT in the code repo (for security). Keep a
secure record:

1. Store credentials in a password manager (1Password, Bitwarden,
   LastPass)
2. Document which variables are needed (see `.env.local.example`)
3. Never commit `.env.local` or any file with real secrets

### 8.6 Disaster Recovery Plan

If the entire production environment goes down:

1. **Database:** Restore Supabase from the latest backup (or PITR)
2. **Code:** Re-deploy from GitHub main branch to Vercel
3. **DNS:** If the domain is down, point it to the Vercel fallback URL
4. **Communication:** Inform users via a status page or social media

**Recovery Time Objective (RTO):** Under 2 hours
**Recovery Point Objective (RPO):** Under 24 hours (daily backups)

### 8.7 Backup Testing

Backups are useless if they cannot be restored. Test quarterly:

1. Take a backup
2. Restore it to a fresh Supabase project (or local)
3. Verify all tables, rows, and RLS policies are intact
4. Document any issues

---

## Appendix A: Deployment Checklist

Before going to production, verify every item:

### Code Quality
- [ ] `npm run lint` passes with no errors
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] `npm run build` succeeds
- [ ] No `console.log` statements in production code
- [ ] No hardcoded secrets or API keys

### Database
- [ ] All migrations applied to production Supabase
- [ ] RLS policies verified on all tables
- [ ] Auth trigger (handle_new_user) is active
- [ ] Backup taken before deploy

### Vercel
- [ ] Environment variables set for Production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Node.js version set correctly

### Supabase Auth
- [ ] Site URL updated to production domain
- [ ] Redirect URLs include production domain
- [ ] Email templates customized (if email confirmation is on)

### Security
- [ ] Service role key is NOT in the codebase
- [ ] RLS tested with two different user accounts
- [ ] No sensitive data in client-visible code
- [ ] HTTPS enforced (automatic on Vercel)

### Functional Testing
- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect when logged out
- [ ] Committee creation works
- [ ] Contribution marking works
- [ ] Dashboard stats are correct
- [ ] Draw schedule displays correctly

---

## Appendix B: Useful Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run lint         # Run ESLint
npm run build        # Production build
npm start            # Start production server (after build)

# Git
git tag v1.0.0       # Create a release tag
git push origin main # Push to GitHub (triggers Vercel deploy)

# Supabase CLI (optional)
supabase link        # Link local project to Supabase
supabase db push     # Push migrations to Supabase
supabase db pull     # Pull schema changes from Supabase

# Vercel CLI (optional)
vercel               # Deploy to Vercel preview
vercel --prod        # Deploy to Vercel production
vercel env ls        # List environment variables
vercel logs          # View deployment logs
```

---

## Appendix C: Resource Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/datawithusman/committeekart |
| Vercel dashboard | https://vercel.com/dashboard |
| Supabase dashboard | https://supabase.com/dashboard |
| Next.js docs | https://nextjs.org/docs |
| Supabase docs | https://supabase.com/docs |
| Google Play Console | https://play.google.com/console |
| Apple Developer | https://developer.apple.com |
| Expo EAS | https://expo.dev/eas |
