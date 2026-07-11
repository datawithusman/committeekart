# LinkedIn Post - Phase 1 Complete

## Post

Just shipped Phase 1 of CommitteeKart, a digital tracker for South Asian savings circles (ROSCAs/committees).

The problem: Millions of families run informal savings groups via WhatsApp and Excel. Payments get missed, disputes happen, nobody knows whose turn it is.

My approach: "Track, Don't Hold." The app never touches money. It only records contributions, generates draw schedules, and provides full transparency to every member. No payment gateway means no regulatory barriers.

What I built this phase:
- Next.js 16 + TypeScript + Tailwind CSS foundation
- Supabase backend (PostgreSQL with Row Level Security)
- User authentication (signup, login, logout)
- Database schema for committees, members, contributions, and draws
- Protected routes with session management
- Landing page and dashboard scaffold

Key decision: Members can exist without user accounts. Organizers add people by name and phone. Zero friction for non-tech-savvy participants (like older relatives).

Full project is open source: github.com/datawithusman/committeekart

Next up: Committee creation flow, payment tracking, and auto-generated draw schedules.

#BuildInPublic #NextJS #Supabase #TypeScript #IndieHacking #WebDev #OpenSource
