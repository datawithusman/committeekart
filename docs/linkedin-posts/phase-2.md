# LinkedIn Post - Phase 2 Complete

## Post

Phase 2 of CommitteeKart is done. The app now has its core engine running.

What I built:

Committee creation flow with dynamic member rows. Organizers add members by name and phone, no signup required for them. The app auto-generates a fair draw schedule using Fisher-Yates shuffle for lottery mode, fixed order, or auction placeholder.

Full contribution tracking. Every member gets a payment row for every month at creation time. Organizers toggle paid or pending with one tap. The system records payment method and timestamp.

Dashboard with live stats. Total committees, total collected, and pending payments, all pulled from the database in real time.

Committee detail page shows everything in one place: members list, current month payments, and the complete draw schedule so every member knows when they get the pot.

What a code review caught and I fixed:

The ROSCA fairness guarantee. Duration must equal member count, enforced both in the UI and server. No member gets the pot twice, no member is left out.

Security gaps. Added ownership verification to prevent IDOR. Fixed cookie secure flags. Tightened server-side validation to catch NaN inputs and invalid enum values.

Silent failures. Error messages now actually show on the create committee form. Contribution actions return typed results so the UI does not lie about success.

Also shipped 14 professional documents this phase: project proposal, SRS with numbered requirements, 33 user stories, use case diagrams, flowcharts, wireframes, database design, architecture, API docs, 60+ test cases, user manual, and deployment guide.

Stack: Next.js 16, TypeScript, Supabase, Tailwind CSS.

Open source: github.com/datawithusman/committeekart

Next: Deploy to production on Vercel and polish the UX.

#BuildInPublic #NextJS #Supabase #TypeScript #IndieHacking #WebDev #OpenSource #FinTech
