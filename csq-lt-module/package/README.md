# CSQ Leagues & Tournaments module

The new Leagues & Tournaments section for caribbeansportsquest.com. It has public pages, an admin section and an organizer section, and it works for any sport. It is written for the CSQ Lovable project: React, Tailwind, Supabase, react-router.

The scoring setup comes from a **sport preset**. Dominoes plays to a target (men 15, women 11), football has draws and goal difference, volleyball and tennis count sets, and so on. Admins can add new sports from the admin section without touching code.

## What's in the package

| Path | What it is |
|---|---|
| `supabase/001_leagues_tournaments.sql` | Tables, access rules (RLS) and nine sport presets. Run once. Safe to re-run. |
| `supabase/002_seed_christmas_domino_league.sql` | Loads the Christmas Domino League 2026: 14 teams, 166 players, fixtures, divisions and the full JDCA rules. Optional. |
| `src/features/competitions/` | The whole module. Copy this folder into the Lovable project as it is. |

## Install in Lovable (no Lovable credits needed)

### 1. Database
1. Open Supabase for the CSQ project, then **SQL editor**.
2. Paste and run `001_leagues_tournaments.sql`.
   - **CSQ already has a `user_roles` table and a `has_role()` function:** delete block 0 at the top first.
   - **Their `app_role` type has no `'admin'` value:** add it.
3. Make yourself an admin (replace the email):
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'info@caribbeansportsquest.com'
   on conflict do nothing;
   ```
4. Optional: run `002_seed_christmas_domino_league.sql` to load the Christmas Domino League.

### 2. Code
1. In the Lovable Code Editor, create the folder `src/features/competitions/` and paste in every file from this package, keeping the folder structure.
2. Do **not** copy `src/integrations/supabase/client.ts`. Lovable already has its own, and the module uses it.
3. Open `src/App.tsx` and add the routes:
   ```tsx
   import { CompetitionDataProvider, competitionRoutes, supabaseSource } from "@/features/competitions";

   // Wrap your existing <Routes> (or the whole app) once:
   <CompetitionDataProvider source={supabaseSource}>
     <Routes>
       {/* ...existing routes... */}
       {competitionRoutes.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
     </Routes>
   </CompetitionDataProvider>
   ```
4. Remove or redirect the old `/leagues` route so the new one takes over.
5. Header: rename the "Leagues" nav item to **Leagues & Tournaments** (link `/leagues`).
6. Admin dashboard: add a link to **/admin/competitions**.
7. User menu: add **Run a competition**, linking to **/organizer**.

### URLs
| URL | Who | What |
|---|---|---|
| `/leagues` | Everyone | Listing with search, League/Tournament switch, sport and status filters |
| `/leagues/:slug` | Everyone | Competition page: Overview, Schedule, Standings, Bracket, Teams, Players, rules pop-up, knockout pop-up |
| `/organizer` | Signed-in members | Organizer dashboard. Members can request organizer access. |
| `/organizer/:slug` | That competition's organizers | Editor (owner/editor), or results only (scorekeeper) |
| `/admin/competitions` | CSQ admins | All competitions, approve and publish, organizer requests, sport presets |
| `/admin/competitions/:slug` | CSQ admins | The same editor, with full rights |

To use different URLs, change `BASE` in `src/features/competitions/routes.tsx`.

## Who can do what (enforced in the database)
- **Visitors:** see published competitions only.
- **Members:** follow competitions, teams and players, and apply to become organizers.
- **Approved organizers:** create competitions. When they press *Submit for review*, the competition waits for a CSQ admin, so it can't go public on its own.
- **Owners:** manage everything in their competition, including adding editors and scorekeepers by email.
- **Editors:** manage content: details, divisions, venues, teams, players, fixtures and rules.
- **Scorekeepers:** can only enter results.
- **CSQ admins:** everything, including publishing, deleting, organizer approvals and sport presets.

## Features
- **Any sport:** the sport preset sets the scoring type (target, final score, sets or times), points for a win/draw/loss, tiebreakers, and column names (PF/PA, GF/GA, sets…). Each competition can override the points.
- **Divisions:** men's, women's, age groups. Each has its own roster limit and set target (for example men 15, women 11).
- **Standings:** worked out automatically from final results. They show the zone that goes straight into the bracket and the **seat playoff** zone (for example places 29–36 play for the last 4 of 32, best against worst). Includes a "how it all connects" map.
- **Circular bracket:** works for any size (4–128). You can rotate it (drag or buttons), and tapping a slot shows its path to the final. A third-place match is optional.
- **Knockout pop-up:** the bracket opens first once the stage is set to Knockouts, or from the knockout start date.
- **Rules:** organizers write rules by section and tag them (scoring, match times, bracket, cards). Tagged scoring rules appear next to the standings, and highlighted rules become "Rules at a glance" chips that open the rules pop-up on that rule.
- **Teams and players:** each team page shows its own schedule, including "if they advance" rounds, and its roster. The player board has search, filters, Cards or Big board layouts and pagination, and player profiles have team-mates and stats. Follow buttons work for competitions, teams and players.
- **Bulk player import:** paste a team list straight from WhatsApp, one name per line. Nicknames in "quotes" or (brackets) are picked up.
- **Score checks:** for example, dominoes won't accept 15–15, or 15 in the women's 11-point game.

## Checks run before handover
- SQL run twice on Postgres 16. Access rules were tested with an admin, two organizers, a scorekeeper and a visitor.
- Engine tests pass: football draws, dominoes targets, tiebreakers, seat playoff pairing and seeding (`npm test`).
- TypeScript strict check passes. The preview was clicked through as every role, at desktop and phone width.

## Things to confirm on the live project
- The module expects the Lovable Supabase client at `@/integrations/supabase/client`.
- After running the SQL, regenerate the Supabase types in Lovable if you want typed queries. The module works without that.
- Fonts: headings use Bebas Neue, which the CSQ site already loads.
