# CommitteeKart - Project Proposal

> A digital committee (ROSCA) tracker for South Asian savings circles.
> Built on the "Track, Don't Hold" principle.

**Document Version:** 1.0
**Date:** 2026-07-11
**Author:** CommitteeKart Team
**Status:** Proposed

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Target Users and Personas](#4-target-users-and-personas)
5. [Market Size and Opportunity](#5-market-size-and-opportunity)
6. [Competitive Analysis](#6-competitive-analysis)
7. [Unique Selling Proposition](#7-unique-selling-proposition)
8. [Monetization Model](#8-monetization-model)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Risks and Mitigation](#10-risks-and-mitigation)
11. [Success Metrics](#11-success-metrics)

---

## 1. Executive Summary

CommitteeKart is a web application that digitizes the management of
"committees", the informal rotating savings and credit associations
(ROSCAs) that millions of South Asian families run every month. In a
committee, a group of people each contribute a fixed amount monthly, and
one member receives the total "pot" each month in rotation.

Today, almost all committees are run through WhatsApp messages, phone
calls, and Excel sheets. This creates disputes, forgotten payments, and
endless confusion about whose turn it is to receive the pot.

CommitteeKart solves this by being a single source of truth for every
committee: who is in it, who has paid, who gets the pot next, and how
much has been collected. Crucially, the app follows a "Track, Don't
Hold" principle: it never touches the money. Organizers collect funds
however they prefer (cash, JazzCash, EasyPaisa, bank transfer) and the
app only records what happened. This removes the need for financial
licenses, keeps users in full control of their money, and lets a solo
developer build and ship a product that earns trust.

The ROSCA market is large and underserved. The global ROSCA software
market was valued at approximately USD 0.92 billion in 2025 and is
projected to reach USD 3.12 billion by 2034. Pakistan alone has an
estimated formal and informal ROSCA participation in the tens of
millions, with committees being a household-level financial habit
across urban and rural areas alike.

CommitteeKart targets Pakistan first, then the broader South Asian and
global diaspora market. Monetization is subscription based (Free, Pro
at PKR 500/month, Premium at PKR 1,500/month), avoiding transaction fee
dependencies. The product is built on a modern, scalable stack
(Next.js 16, TypeScript, Supabase, Tailwind CSS v4) and is designed for
a solo developer to operate at low cost while growing to thousands of
organizers.

---

## 2. Problem Statement

### 2.1 How Committees Work Today

A typical committee works like this. An organizer (usually a trusted
woman in a family, neighborhood, or office) gathers 5 to 25 members.
Each member agrees to contribute a fixed monthly amount, for example
PKR 10,000, for a fixed number of months equal to the number of members.
Every month, one member receives the entire pot. By the end, every
member has received the pot exactly once.

The organizer is responsible for:

- Collecting money from every member every month
- Recording who paid and who did not
- Deciding and announcing whose turn it is to receive the pot
- Settling disputes when records disagree
- Reminding late payers

### 2.2 The Pain Points

Today this work is done using a mix of WhatsApp groups, Excel sheets,
notebooks, and memory. This causes well known problems:

1. **Forgotten payments.** Without a central record, members forget
   which month they have paid for. The organizer must chase people, and
   members dispute whether they already sent the money.

2. **Disputes over the pot schedule.** When the draw order is only in
   the organizer's notebook, members suspect favoritism or changes.
   "Unko pehle pot mil gaya, mujhe nahi pata tha" becomes a real source
   of tension.

3. **Lost records.** Excel files get overwritten. WhatsApp chats scroll
   away. When a phone is lost or a sheet is deleted, the entire history
   of a committee can disappear.

4. **No transparency.** Members have no easy way to see the full picture:
   total collected, who is late, and how many months remain. Trust
   depends entirely on the organizer's honesty and availability.

5. **Organizer burnout.** The organizer carries the entire mental load.
   Monthly reminders, manual tracking, and conflict resolution turn a
   social savings circle into an unpaid administrative job.

6. **No audit trail.** When a dispute escalates, there is no neutral
   record both sides can agree on.

### 2.3 Why Existing Tools Fall Short

General purpose tools (Excel, Google Sheets, WhatsApp) are flexible but
provide no structure, no reminders, and no transparency view for
members. Dedicated committee apps either hold money (requiring
financial licenses and creating regulatory risk) or are built for other
markets with different conventions. There is a clear gap for a
lightweight, aunty-friendly, track-only tool tailored to South Asian
committee culture.

---

## 3. Proposed Solution

### 3.1 CommitteeKart in One Line

CommitteeKart is a digital committee tracker that records contributions,
auto-generates transparent draw schedules, and gives every member a
clear view of the committee status, without ever touching the money.

### 3.2 Core Capabilities

CommitteeKart provides the following core capabilities:

1. **Committee creation.** An organizer signs up, creates a committee,
   and configures the monthly amount, member count, duration, start
   date, and draw type (lottery, fixed, or auction).

2. **Member management.** The organizer adds members by name and phone
   number. Members do not need to sign up to be tracked. They can
   optionally claim their profile later.

3. **Automatic draw schedules.** When a committee is created, the entire
   draw schedule (who receives the pot in which month) is generated
   immediately and locked in. Every member gets the pot exactly once.

   - **Lottery:** a fair random shuffle of all members.
   - **Fixed:** the organizer sets the order manually.
   - **Auction:** members bid a discount; highest bid wins the pot for
     that month (placeholder assigned at creation, updated monthly).

4. **Contribution tracking.** Each month, the organizer records each
   member's payment as paid, pending, late, or skipped, along with the
   payment method (cash, JazzCash, EasyPaisa, bank transfer, other) and
   an optional note.

5. **Organizer dashboard.** A single screen shows all committees the
   organizer runs, with live stats: how many paid this month, how much
   has been collected in total, and what is still pending.

6. **Member transparency view.** Members (once they claim their profile)
   can see their own payment history, when they receive the pot, and the
   overall progress of the committee.

7. **Reports and reminders.** CSV exports for record keeping, and
   WhatsApp-friendly reminders for late payers (Phase 3).

### 3.3 The Track, Don't Hold Principle

CommitteeKart deliberately does not include a payment gateway. The app
records what happened; it never moves money. This decision is central to
the product and is explained in detail in section 7 (Unique Selling
Proposition) and in the technical decisions log (`docs/DECISIONS.md`).

### 3.4 Technology

CommitteeKart is built on a modern, low-oper-cost stack:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 16 (App Router) | Server Components, PWA ready, fast |
| Language | TypeScript | Type safety, maintainable solo codebase |
| Database | Supabase (PostgreSQL) | Auth, DB, and Row Level Security in one |
| Styling | Tailwind CSS v4 | Utility first, rapid UI |
| Hosting | Vercel | One click Next.js deploy, generous free tier |

This stack lets a single developer build, deploy, and operate the full
product without managing servers.

---

## 4. Target Users and Personas

CommitteeKart has two primary user roles: the organizer and the member.
Most early value is delivered to the organizer, who is the person most
burdened by today's manual process.

### 4.1 Persona 1: Saima, the Organizer Aunty

- **Who:** A 45 year old homemaker in Lahore who runs three committees
  among her relatives and neighbors.
- **Goal:** Keep clean records so no one fights about money.
- **Pain:** She manages everything in a diary and a WhatsApp group.
  Every month someone forgets to pay, and she has to chase them.
  Relatives sometimes accuse her of favoritism in the draw order.
- **Tech comfort:** Uses WhatsApp and YouTube daily. Types slowly but
  confidently on a phone. Rarely uses a laptop.
- **What she needs:** A simple phone-friendly app where she can mark who
  paid, see whose turn is next, and show a screenshot to prove the
  schedule is fair.
- **Why she will adopt it:** It removes arguments. "App mein sab kuch
  likha hai, dekh lo."

### 4.2 Persona 2: Bilal, the Office Worker

- **Who:** A 32 year old software engineer in Karachi who runs an office
  committee of 10 colleagues.
- **Goal:** Make the committee feel professional and transparent without
  spending his evenings on it.
- **Pain:** He maintains an Excel sheet on Google Drive. Colleagues edit
  it, rows get overwritten, and no one is ever sure which version is
  correct. He also has to remember to remind people.
- **Tech comfort:** High. Comfortable with web apps, spreadsheets, and
  automation.
- **What he needs:** A single shared dashboard his colleagues can view,
  automatic draw scheduling, and CSV export for his own records.
- **Why he will adopt it:** It saves him time and removes "which version
  of the sheet is correct" confusion.

### 4.3 Persona 3: Nida, the Family Treasurer

- **Who:** A 28 year old teacher in Islamabad who manages a family
  committee for her siblings and cousins.
- **Goal:** Keep the family peace by making money matters transparent.
- **Pain:** Family members trust her but still ask the same questions
  every month: "Kitna collect hua?", "Meri baari kab aayegi?", "Bhai ne
  diya ya nahi?"
- **Tech comfort:** Medium. Uses a smartphone fluently.
- **What she needs:** A link she can share so family members can see
  their own status without asking her repeatedly.
- **Why she will adopt it:** It lets her stop repeating herself and
  protects her from being accused of hiding anything.

### 4.4 Secondary Persona: The Member

- **Who:** Anyone participating in a committee run on CommitteeKart.
- **Goal:** Know that the committee is fair, know when they receive the
  pot, and know their own payment status.
- **Pain:** They have no visibility today and must trust the organizer
  blindly.
- **What they need:** A simple view of their own contributions and the
  draw schedule.

### 4.5 Target Market Sequence

1. **Primary:** Pakistan, urban and semi-urban, organizers aged 30 to 55.
2. **Secondary:** Pakistani and Indian diaspora in the Gulf, UK, US, and
   Canada who run committees with family back home.
3. **Tertiary:** Broader South Asian market (India, Bangladesh) where
   ROSCA conventions are similar (chit funds, kitties, beesi).

---

## 5. Market Size and Opportunity

### 5.1 ROSCA Software Market

The global market for software that supports ROSCAs and similar
informal savings groups is growing as these circles move from paper and
chat to apps.

- **2025 market size:** approximately USD 0.92 billion.
- **2034 projected size:** approximately USD 3.12 billion.
- **Implied compound annual growth rate (CAGR):** roughly 14 to 15
  percent over the forecast period.

This growth is driven by smartphone penetration, rising trust in
digital tools for personal finance, and the persistent cultural
importance of ROSCAs in South Asia, parts of Africa, and diaspora
communities worldwide.

### 5.2 Underlying ROSCA Participation

ROSCAs themselves are far larger than the software market. Globally, an
estimated hundreds of millions of people participate in rotating savings
groups. In Pakistan alone, committees are a near-universal middle-class
financial habit, and the number of active committees runs into the
millions. Even capturing a small fraction of organizers who are willing
to pay for a tracking tool represents a meaningful opportunity.

### 5.3 Why Now

- **Smartphone penetration** in Pakistan and South Asia has crossed the
  threshold where an app-first approach reaches the target audience.
- **Trust in cloud tools** has grown post-pandemic, even among older
  users who now use WhatsApp, banking apps, and online shopping daily.
- **Regulatory clarity** around "track only" apps: by not holding money,
  CommitteeKart avoids the regulatory burden that has slowed or blocked
  money-holding committee apps in several markets.
- **Solo developer economics:** modern stacks (Next.js, Supabase,
  Vercel) make it viable for one person to build and operate a product
  that scales to thousands of users at near-zero marginal cost.

### 5.4 Market Sizing Assumptions

The figures above reflect the ROSCA and group-savings software segment.
They are directional and intended to size the opportunity, not to
guarantee revenue. CommitteeKart's actual revenue will depend on
conversion from free to paid plans, which is modeled in section 8.

---

## 6. Competitive Analysis

### 6.1 Competitive Landscape

| Competitor | Model | Market | Holds Money? | Strengths | Weaknesses |
|-----------|-------|--------|--------------|-----------|------------|
| Oraan | App, holds money via escrow | Pakistan | Yes | Strong brand, regulatory backing | Requires KYC, limited to Oraan-run committees, not for private circles |
| Committee Book | Tracking app | South Asia | No | Tracking focus | Limited features, low polish, weak transparency |
| ChitBook | Tracking app | India | No | Simple interface | India-centric, limited draw types, weak reporting |
| Chit.Biz | SaaS for chit fund companies | India | No (but targets fund operators) | Built for professional operators | Complex, aimed at businesses not families, not aunty-friendly |
| Excel / Google Sheets | Generic tool | Global | No | Free, flexible | No structure, no reminders, no member view, error-prone |
| WhatsApp + Notebook | Manual | Global | No | Universal, zero learning curve | No record keeping, high dispute risk |

### 6.2 Positioning of CommitteeKart

CommitteeKart sits in a specific gap that no current competitor fills
well:

- **For families and social circles, not fund companies.** Chit.Biz and
  similar tools target professional chit fund operators. CommitteeKart
  targets the aunty, the office worker, and the family treasurer.
- **Track only, no money held.** Unlike Oraan, CommitteeKart works for
  private committees where members already trust each other and want to
  keep their own cash flows (JazzCash, EasyPaisa, cash, bank). It does
  not require KYC or regulatory approval.
- **Structured, not generic.** Unlike Excel, CommitteeKart enforces the
  committee model: fair draws, one contribution per member per month,
  and a transparent member view.
- **Aunty-friendly.** The interface is designed for low-tech-comfort
  organizers first, with large tap targets, Roman Urdu friendly copy,
  and a phone-first layout.

### 6.3 Sustainable Advantage

CommitteeKart's most defensible advantages are:

1. **Zero regulatory friction**, which means faster shipping and lower
   operating risk than money-holding competitors.
2. **Cultural fit**, with terminology (committee, pot, JazzCash,
   EasyPaisa) and draw types (lottery, fixed, auction) that match how
   South Asian committees actually work.
3. **Network effects within a committee.** Once an organizer runs a
   committee on CommitteeKart, every member is exposed to the product,
   and some become organizers themselves.

---

## 7. Unique Selling Proposition

### 7.1 The Core USP

CommitteeKart's unique selling proposition can be stated in one line:

> **CommitteeKart is the most trustworthy, aunty-friendly way to run a
> committee, because it tracks everything transparently and never holds
> a single rupee of your money.**

### 7.3 Why the USP Wins

#### 7.3.1 Track, Don't Hold

This is the single most important differentiator. Apps that hold money
face three hard problems:

1. **Regulation.** Holding customer funds requires financial licenses
   (in Pakistan, SBP and SECP oversight). This is slow, expensive, and
   risky for a solo developer.
2. **Trust.** Users are rightly cautious about handing money to a new
   app. Money-holding apps must spend heavily on trust building.
3. **Fraud risk.** Any app that holds money becomes a target. A single
   incident can destroy the business.

By tracking only, CommitteeKart sidesteps all three. The organizer keeps
collecting money the way they always have, and the app provides the
neutral record everyone can agree on. The worst case for a track-only
app is a data error, not a loss of funds.

#### 7.3.2 Aunty-Friendly Design

Most financial software is designed for finance professionals.
CommitteeKart is designed first for the organizer aunty:

- Phone-first layout, large tap targets.
- Simple language, with Roman Urdu used naturally in help text.
- No jargon, no dashboards full of charts she does not need.
- One-tap actions for the most common task: marking someone paid.

#### 7.3.3 No Regulation Needed

Because CommitteeKart never touches money, it does not need a financial
license to launch. This means:

- Faster time to market.
- Lower legal cost.
- Ability to expand to new countries without re-certifying as a
  financial institution.

#### 7.3.4 Transparency as a Feature

Transparency is not a side effect, it is the product. The draw schedule
is generated upfront and visible to all members. Every contribution has
a status, a date, and a method. This converts trust from a personal
quality of the organizer into a verifiable property of the system.

---

## 8. Monetization Model

### 8.1 Pricing Philosophy

CommitteeKart uses a freemium subscription model. The free tier is
genuinely useful so that organizers can try the product with a real
committee before paying. Paid tiers unlock higher limits and
convenience features. There are no transaction fees, which is consistent
with the Track, Don't Hold principle.

### 8.2 Pricing Tiers

| Tier | Price (PKR/month) | Price (USD/month, indicative) | Target User | Key Limits and Features |
|------|-------------------|-------------------------------|-------------|-------------------------|
| Free | 0 | 0 | New organizers trying it out | Up to 1 active committee, up to 10 members, core tracking, draw schedule, member view |
| Pro | 500 | ~2 | Active organizers with a few committees | Up to 5 active committees, up to 25 members each, CSV export, basic reminders |
| Premium | 1,500 | ~6 | Power users managing many circles | Unlimited committees, up to 50 members each, WhatsApp reminders, priority support, advanced reports |

All prices are per organizer account. Members are always free and never
pay.

### 8.3 Why Subscription, Not Transaction Fees

1. **Consistent with Track, Don't Hold.** Since no money flows through
   the app, there is no transaction to take a fee from.
2. **Predictable revenue.** Subscriptions are easier to forecast and
   plan around than transaction volume.
3. **Aligns incentives.** The app earns by being useful enough to keep,
   not by pushing more money through the system.
4. **Low friction.** A flat monthly fee is simple to explain and easy
   for an organizer to justify (it is far less than the time saved).

### 8.4 Revenue Model (Illustrative)

Assumptions (directional, for planning only):

- 1,000 organizers on Free, 80 on Pro, 20 on Premium after 12 months.
- Pro: PKR 500/month. Premium: PKR 1,500/month.

Monthly recurring revenue estimate:

- Pro: 80 x 500 = PKR 40,000
- Premium: 20 x 1,500 = PKR 30,000
- Total: PKR 70,000/month (~USD 250)

These numbers are modest and intentionally conservative. The goal of
year one is product-market fit, not revenue maximization. As the
organizer base grows into the tens of thousands, revenue scales linearly
with paying organizers while infrastructure cost stays low due to the
serverless stack.

### 8.5 Future Revenue Levers (Phase 4+)

- **Annual plans** at a discount (for example, 10 months for the price
  of 12) to improve retention and cash flow.
- **Team/agent accounts** for people who run committees as a small
  business.
- **Optional add-ons** such as branded PDF reports or premium reminder
  templates.

Payment processing for subscriptions will be added in Phase 3+ using a
gateway appropriate to each market (for example, a local aggregator in
Pakistan, Stripe for international users).

---

## 9. Implementation Roadmap

CommitteeKart is built in phases. Each phase delivers usable value.

### Phase 1: Foundation (Complete)

- Project scaffold (Next.js 16, TypeScript, Tailwind v4).
- Supabase project, database schema, Row Level Security.
- Authentication (signup, login, logout) with protected routes.
- Dashboard placeholder with user greeting.
- Landing page with CommitteeKart branding.

### Phase 2: Core Features

- Organizer dashboard with real committee data and stats.
- Committee creation flow with automatic draw schedule generation
  (lottery, fixed, auction).
- Committee detail page: members list and contribution tracking.
- Mark contributions as paid, pending, late, or skipped.
- Draw schedule viewer.
- Member transparency view.

### Phase 3: Polish and Deploy

- Member invite links and profile claiming.
- CSV report export.
- WhatsApp-friendly reminders for late payers.
- Landing page polish.
- Vercel deployment.
- Progressive Web App setup (installable).

### Phase 4: Growth (Future)

- Subscription billing integration (Pro and Premium).
- Reminders via WhatsApp Business API.
- Advanced reporting and analytics.
- Localization (Urdu, Hindi, Bengali).
- Mobile app wrappers if demand justifies it.

---

## 10. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low conversion from Free to Paid | Medium | High | Make Pro features genuinely valuable (export, reminders, more committees); gather feedback before hard paywalls |
| Users want the app to hold money | Medium | Medium | Clearly communicate the Track, Don't Hold benefit; consider optional payment partner integration later without taking custody |
| Competitor copies the model | Medium | Medium | Move fast on cultural fit and trust; build network effects within committees |
| Supabase free tier limits hit | Low | Medium | Monitor usage; upgrade to Pro tier once paying users cover the cost |
| Solo developer bandwidth | High | Medium | Strict phase-based scope; avoid gold plating; automate deploys and tests |
| Trust and data loss concerns | Medium | High | Daily Supabase backups, clear data export, transparent privacy policy |
| Regulatory confusion (users assume app holds money) | Low | Medium | Prominent "Track, Don't Hold" messaging on landing and in-app |

---

## 11. Success Metrics

### 11.1 Phase 2 (Core Features)

- Number of committees created.
- Number of organizers who create at least one committee.
- Percentage of created committees that remain active after 30 days.

### 11.2 Phase 3 (Deploy and Polish)

- Weekly active organizers.
- Number of members who claim their profile.
- Number of reminders sent.
- CSV exports generated.

### 11.3 Phase 4 (Growth and Revenue)

- Number of paying organizers (Pro and Premium).
- Monthly recurring revenue.
- Free to Paid conversion rate.
- Net retention (organizers who keep using the app month over month).
- Organic signups from member-to-organizer conversion.

---

## Appendix A: Glossary

- **Committee:** A rotating savings and credit association (ROSCA),
  known locally as "committee". A group contributes monthly and one
  member receives the pot each month.
- **ROSCA:** Rotating Savings and Credit Association, the academic term
  for committees, chit funds, kitties, tontines, and similar groups.
- **Pot:** The total amount collected in a given month
  (monthly amount multiplied by member count), paid to that month's
  draw winner.
- **Draw:** The scheduled payout of the pot to a specific member in a
  specific month.
- **Draw type:** How the draw winner is decided: lottery (random),
  fixed (organizer set order), or auction (discount bidding).
- **Organizer:** The person who creates and manages a committee.
- **Member:** A participant in a committee. May or may not have a user
  account.
- **Track, Don't Hold:** The core principle that the app records money
  but never moves or stores it.

## Appendix B: Related Documents

- `README.md` - Project overview and quick start.
- `docs/ARCHITECTURE.md` - System design and data model.
- `docs/DECISIONS.md` - Technical decision records.
- `docs/PROGRESS.md` - Progress tracker.
- `docs/SRS.md` - Software Requirements Specification.
- `docs/USER_STORIES.md` - User stories by role and phase.
- `docs/USE_CASE_DIAGRAM.md` - Use case diagrams and descriptions.
