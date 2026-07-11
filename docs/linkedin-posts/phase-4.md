# LinkedIn Post - Phase 4 Complete

## Post

Phase 4 of CommitteeKart is done. The app now supports real multi-user interactions.

What shipped this phase:

Member invite system. Organizers generate unique invite links for each member. Members open the link, see the committee details, and claim their profile by signing up or logging in. Their account gets linked to their member row automatically.

Member-side dashboard. When a member logs in, they see a "Joined Committees" section separate from the committees they organize. Each card shows their pot month so they know exactly when they receive the full savings amount.

WhatsApp integration at two touchpoints. First, organizers can share invite links directly to WhatsApp with a pre-filled message. Second, on every pending contribution, there is a WhatsApp button that opens a chat with the member and a reminder message containing their name, the committee name, and the pending amount. This is huge for Pakistan where everyone lives on WhatsApp.

RLS policy fix. Migration 0002 had dropped a policy to fix infinite recursion, but that blocked members from viewing committees. Migration 0004 restores read access for members without reintroducing the recursion. The fix works because the policy chain is now one-directional.

Automated tests. 13 unit tests for the draw schedule generator using Vitest. They verify the ROSCA fairness guarantee: every member appears exactly once, no duplicate months, lottery randomness, fixed order respect, and edge cases like empty or single-member committees.

CI/CD pipeline. GitHub Actions workflow runs lint, type-check, unit tests, and build on every push to main and every pull request. If any step fails, the pipeline stops.

Stack: Next.js 16, TypeScript, Supabase, Tailwind CSS, Vitest, GitHub Actions.

Open source: github.com/datawithusman/committeekart

The app now handles the full social loop: organizer creates, invites members, members join, everyone sees transparent data, and WhatsApp keeps everyone in sync.

#BuildInPublic #NextJS #Supabase #TypeScript #IndieHacking #WebDev #OpenSource #PWA #FinTech #Testing #CICD
