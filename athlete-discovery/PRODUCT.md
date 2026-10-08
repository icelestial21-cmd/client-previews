# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Apex serves four sides equally; when their needs conflict, no side automatically outranks the others, so the trade-off is decided case by case and made visible.

- **Athletes** (and, for under-18s, their parents or guardians): young Caribbean athletes who want to be seen, verified and represented. Their job is to build a credible profile, apply to trials and scholarships, and sign with an agent.
- **Agents**: find unsigned athletes in their sports, offer representation, and apply to trials on their clients' behalf.
- **Scouts**: search and compare athletes by sport, measurements and verified test results, and keep shortlists.
- **Clubs and organisations** (clubs, leagues, colleges, showcases): list trials and scholarship places, review applicants, and invite athletes who qualify.
- **Platform admin**: oversees agreements, verification and escrow across the exchange.

## Product Purpose

A scouting and representation exchange for Caribbean athletes. It puts verified athlete data, representation agreements, trial applications and payments in one place, so athletes get found and fairly represented and the people recruiting them can trust what they see.

Current stage: a clickable **client pitch demo** shown to the client, partners and investors. There are no real users or accounts yet. Success for this build is a demo that convinces, with every role's journey working end to end.

## Positioning

Four commitments a generic recruiting or highlights site does not make:

1. **Verified data.** Measurements and results carry a verification level (none, ID checked, results checked against official records, measured in person at a partner combine); nothing is presented as verified unless it is.
2. **Commission-only agents.** Agents are paid a share of what the athlete earns, never an upfront fee.
3. **Escrow payments.** Sponsor and contract money is held by a licensed escrow partner (not by the exchange) until released.
4. **Under-18 safeguards.** A parent or guardian approves applications and signs agreements; minors are hidden from signed-out visitors; academic records stay private.

## Operating Context

- **Phones first.** Athletes and guardians mostly use phones; scouts and agents also work on desktops.
- **Slow or costly data.** Parts of the Caribbean have patchy coverage and pay-as-you-go data, so pages must stay light.
- **Plain language.** Copy must be readable by teenagers and parents, not only industry insiders; explain or avoid jargon.
- **Cross-border.** Caribbean athletes are reaching clubs, colleges and sponsors in the UK, Europe and the US.

## Capabilities and Constraints

Confirmed in the current build:

- Demo roles: visitor (signed out), athlete (an adult and an under-18 example), agent, scout, club, platform admin. Each role has its own navigation and landing page; everyone shares the public front page.
- Public front page, prospect board (ranked by scout grade, with filters, comparison and shortlists), athlete profiles, agents directory, representation agreements with e-signature (demo), trials and scholarship listings with eligibility checks, applications and club invitations, payments ledger with escrow status and CSV export, and a recent-results ticker.
- Static site with no build step, hosted on GitHub Pages as part of the `client-previews` portfolio repo. Plain HTML, CSS and JavaScript; demo data lives in `data.js`; changes persist only in the viewer's browser storage.
- Terminology in use: prospect board, scout grade, verification levels (ID verified, results verified, combine verified), shortlist, trial, representation agreement.

Undecided (do not assume): the production stack, real authentication, the escrow partner, verification partners, and pricing for clubs or agents.

## Brand Commitments

- Name: **Apex Athlete Exchange** (AAX).
- A dark mode must remain available.

## Evidence on Hand

- Everything in the demo is **fictional**: athletes, agents, clubs, schools, brands, results, news and payments (`athlete-discovery/data.js`). Real organisations, governing bodies and leagues must not appear; contact details use `@example.com` addresses and 555 numbers.
- No real users, testimonials, customers, case studies, press, partner logos, licences or usage numbers exist. Future work must not invent them or present demo figures as real.
- Assets: `athlete-discovery/og-image.png` (social share image).

## Product Principles

1. **Trust is shown, not claimed.** Every figure says how it was verified; nothing implies a check, licence, partner or compliance status the product does not have.
2. **Protect the youngest user first.** When a design choice affects under-18s, their privacy and their guardian's role win over convenience.
3. **Every role has a reason to be on every page it sees.** No dead ends, empty pages or actions a role cannot take.
4. **Built for the athlete's phone and data plan.** Light pages, plain words, nothing that only works on a fast desktop connection.
5. **Fair money, visible terms.** Who is paid, how much, and when is always clear; no upfront fees from athletes to agents.

## Accessibility & Inclusion

- Target: **WCAG 2.2 AA**.
- Full keyboard use with visible focus, sufficient contrast in both light and dark themes, respect for reduced-motion settings, and a pause control on anything that moves automatically.
- Plain-language copy suitable for teenagers and parents.
