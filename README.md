# CommitteeKart

> A digital committee (ROSCA) tracker for South Asian savings circles.
> Built on the "Track, Don't Hold" principle.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## What is CommitteeKart?

In South Asia, "committees" (also called ROSCAs, chit funds, or savings
circles) are a popular informal way to save money. A group of people
contribute a fixed amount monthly, and one member receives the total
"pot" each month in rotation.

**The problem:** Most committees are managed via WhatsApp messages and
Excel sheets. This leads to disputes, forgotten payments, and confusion
about whose turn it is.

**The solution:** CommitteeKart tracks everything digitally:
contributions, draw schedules, and member transparency. No more arguments.

### Why "Track, Don't Hold"?

CommitteeKart **never touches your money**. There is no payment gateway.
Organizers collect money however they prefer (cash, JazzCash, EasyPaisa,
bank transfer) and the app records it for transparency.

This means:
- No financial regulation needed
- Users keep full control of their money
- The app is a "source of truth", not a bank

---

## Features (Planned)

### Phase 1: Foundation
- User authentication (email/password)
- Database schema for committees, members, contributions, draws

### Phase 2: Core Features
- Create and manage committees
- Add members (name + phone, no signup required)
- Track monthly contributions (paid, pending, late)
- Auto generate draw schedules (lottery, fixed, auction)
- Organizer dashboard with stats
- Member transparency view

### Phase 3: Polish and Deploy
- Member invite links
- WhatsApp reminders
- Reports and CSV export
- Progressive Web App (installable)
- Deploy to Vercel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Auth | Supabase Auth |

---

## Quick Start

### Prerequisites
- Node.js 18+ (built with Node 24)
- npm 10+
- A free [Supabase](https://supabase.com) account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/datawithusman/committeekart.git
cd committeekart
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```
Open `.env.local` and add your Supabase URL and publishable key.

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Copy and run `supabase/migrations/0001_initial_schema.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
committeekart/
├── docs/                        # Project documentation
│   ├── PROGRESS.md              # Progress tracker (what is done, what is next)
│   ├── ARCHITECTURE.md          # System design and data model
│   ├── DECISIONS.md             # Technical decision records
│   └── linkedin-posts/          # LinkedIn post drafts per phase
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/              # Login and signup pages
│   │   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/              # Reusable UI components
│   ├── lib/
│   │   ├── supabase/            # Supabase clients (browser + server)
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── utils.ts             # Helper functions
│   └── middleware.ts            # Auth route protection
├── supabase/
│   ├── migrations/              # SQL schema migrations
│   └── seed.sql                 # Test data template
├── .env.local.example           # Environment variable template
└── package.json
```

---

## Documentation

This project includes comprehensive, production-quality documentation.

### Planning and Requirements
| Document | Description |
|----------|-------------|
| [Project Proposal](docs/PROJECT_PROPOSAL.md) | Idea, problem statement, target users, market analysis, monetization |
| [SRS (Requirements)](docs/SRS.md) | Functional and non-functional requirements specification |
| [User Stories](docs/USER_STORIES.md) | User stories organized by role and phase |
| [Use Case Diagram](docs/USE_CASE_DIAGRAM.md) | Actors, use cases, and system interactions |

### Design
| Document | Description |
|----------|-------------|
| [Flowcharts](docs/FLOWCHARTS.md) | Activity diagrams for all user flows |
| [Wireframes](docs/WIREFRAMES.md) | ASCII wireframes for every screen |
| [Database Design](docs/DATABASE_DESIGN.md) | ERD, table schemas, indexes, RLS policies |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, security, scalability |

### Technical Reference
| Document | Description |
|----------|-------------|
| [API Documentation](docs/API_DOCUMENTATION.md) | Server actions, Supabase queries, data access patterns |
| [Technical Decisions](docs/DECISIONS.md) | Architecture Decision Records (why each choice was made) |

### Operations
| Document | Description |
|----------|-------------|
| [Test Plan](docs/TEST_PLAN.md) | Test strategy, 60+ test cases, known issues |
| [User Manual](docs/USER_MANUAL.md) | End-user guide (English + Roman Urdu) |
| [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) | Vercel, Google Play, App Store deployment steps |
| [Progress Tracker](docs/PROGRESS.md) | Current status, what is done, what is next |

---

## Contributing

This is currently a solo project. If you would like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`feat:`, `fix:`, `docs:`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` maintenance tasks
- `refactor:` code restructuring

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- The millions of South Asian families who run committees every month
- [Supabase](https://supabase.com) for the excellent backend platform
- [Next.js](https://nextjs.org) team for the framework
