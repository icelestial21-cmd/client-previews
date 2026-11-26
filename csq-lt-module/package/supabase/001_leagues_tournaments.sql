-- ============================================================================
-- CSQ Leagues & Tournaments module
-- Works for any sport: the sport preset decides how results become standings.
-- Run once in the Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Roles. Skip this block if CSQ already has public.user_roles + has_role().
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ---------------------------------------------------------------------------
-- 1. Sport presets: one row per sport. Admins can add sports without code.
-- ---------------------------------------------------------------------------
create table if not exists public.lt_sports (
  key text primary key,                      -- 'domino', 'football', ...
  name text not null,
  scoring_mode text not null check (scoring_mode in ('target','score','sets','time')),
  participant text not null default 'team' check (participant in ('team','player','both')),
  allow_draws boolean not null default true,
  points_win numeric not null default 3,
  points_draw numeric not null default 1,
  points_loss numeric not null default 0,
  tiebreakers text[] not null default array['points','diff','for','name'],
  target_default int,                        -- e.g. 15 for domino sets
  sets_to_win int,                           -- e.g. 2 for best of 3
  labels jsonb not null default '{}'::jsonb, -- {"match":"Set","score":"Points","for":"PF","against":"PA"}
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Competitions (a league, a tournament, or both).
-- ---------------------------------------------------------------------------
create table if not exists public.lt_competitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null default 'league' check (kind in ('league','tournament','hybrid')),
  sport_key text not null references public.lt_sports(key),
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','archived')),
  stage text not null default 'registration'
    check (stage in ('registration','regular','second_round','playoffs','knockouts','completed')),
  country text default 'Jamaica',
  starts_on date,
  ends_on date,
  summary text,
  about jsonb not null default '[]'::jsonb,          -- [{"heading":"","body":""}]
  eligibility jsonb not null default '[]'::jsonb,    -- ["criterion", ...]
  poster_url text,
  -- Format and bracket settings
  bracket_size int not null default 32 check (bracket_size in (4,8,16,32,64,128)),
  playoff_seats int not null default 0,              -- seats decided by the seat playoff
  third_place boolean not null default true,
  knockout_popup boolean not null default true,      -- show bracket first when stage = knockouts
  knockout_starts_on date,
  -- Scoring overrides (null = use the sport preset)
  points_win numeric, points_draw numeric, points_loss numeric,
  extra jsonb not null default '{}'::jsonb,          -- sport-specific settings (derby points, etc.)
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- People who run a competition. Owners invite editors and scorekeepers.
create table if not exists public.lt_competition_organizers (
  competition_id uuid references public.lt_competitions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','editor','scorekeeper')),
  created_at timestamptz not null default now(),
  primary key (competition_id, user_id)
);

-- Organizer sign-up requests, approved by a CSQ admin.
create table if not exists public.lt_organizer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  organization text not null,
  contact_name text not null,
  contact_phone text,
  sport_key text references public.lt_sports(key),
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Divisions, venues, teams, players.
-- ---------------------------------------------------------------------------
create table if not exists public.lt_divisions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  name text not null,                 -- "Men's League", "Women's League", "U17"
  short_name text,                    -- "Men's"
  roster_max int,
  target_points int,                  -- overrides sport target (men 15, women 11)
  sort int not null default 0
);

create table if not exists public.lt_venues (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  name text not null,
  address text,
  map_url text
);

create table if not exists public.lt_teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  name text not null,
  short_name text,
  logo_url text,
  home_venue_id uuid references public.lt_venues(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lt_players (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  team_id uuid references public.lt_teams(id) on delete set null,
  division_id uuid references public.lt_divisions(id) on delete set null,
  name text not null,
  nickname text,
  photo_url text,
  note text,                          -- "Defending champion", "Overseas"
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Fixtures and results. A fixture is team v team or player v player.
-- ---------------------------------------------------------------------------
create table if not exists public.lt_fixtures (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  division_id uuid references public.lt_divisions(id) on delete set null,
  stage text not null default 'regular',      -- regular, second_round, playoff, r64, r32, r16, qf, sf, third, final
  round_label text,                           -- "First round", "Round of 32"
  starts_at timestamptz,
  venue_id uuid references public.lt_venues(id) on delete set null,
  home_team_id uuid references public.lt_teams(id) on delete set null,
  away_team_id uuid references public.lt_teams(id) on delete set null,
  home_player_id uuid references public.lt_players(id) on delete set null,
  away_player_id uuid references public.lt_players(id) on delete set null,
  bracket_slot int,                           -- position in the knockout bracket
  status text not null default 'scheduled' check (status in ('scheduled','live','final','postponed','cancelled')),
  home_score int,
  away_score int,
  detail jsonb not null default '{}'::jsonb,  -- sets, periods, cards, derby games...
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Rules (pop-up), follows.
-- ---------------------------------------------------------------------------
create table if not exists public.lt_rule_sections (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.lt_competitions(id) on delete cascade,
  title text not null,
  sort int not null default 0
);

create table if not exists public.lt_rules (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.lt_rule_sections(id) on delete cascade,
  body text not null,
  bullets text[] not null default '{}',
  tag text check (tag in ('scoring','schedule','bracket','cards')),
  highlight boolean not null default false,   -- show as a "rules at a glance" chip
  chip_label text,
  sort int not null default 0
);

create table if not exists public.lt_follows (
  user_id uuid references auth.users(id) on delete cascade,
  entity text not null check (entity in ('competition','team','player')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, entity, entity_id)
);

create index if not exists lt_fixtures_comp_idx on public.lt_fixtures(competition_id, stage);
create index if not exists lt_players_comp_idx on public.lt_players(competition_id, team_id);

-- ---------------------------------------------------------------------------
-- 6. Access rules (RLS)
--    Public: read published competitions and everything in them.
--    Organizers: manage the competitions they are listed on.
--    Scorekeepers: enter results only.  Admins: everything.
-- ---------------------------------------------------------------------------
create or replace function public.lt_can_manage(_comp uuid, _min text default 'editor')
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin') or exists (
    select 1 from public.lt_competition_organizers o
    where o.competition_id = _comp and o.user_id = auth.uid()
      and (case _min when 'scorekeeper' then true
                     when 'editor' then o.role in ('owner','editor')
                     else o.role = 'owner' end))
$$;

-- Approved organizers (or admins) may create competitions.
create or replace function public.lt_is_organizer(_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user, 'admin') or exists (
    select 1 from public.lt_organizer_applications where user_id = _user and status = 'approved')
$$;

create or replace function public.lt_is_public(_comp uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lt_competitions where id = _comp and status = 'published')
$$;

alter table public.lt_sports enable row level security;
alter table public.lt_competitions enable row level security;
alter table public.lt_competition_organizers enable row level security;
alter table public.lt_organizer_applications enable row level security;
alter table public.lt_divisions enable row level security;
alter table public.lt_venues enable row level security;
alter table public.lt_teams enable row level security;
alter table public.lt_players enable row level security;
alter table public.lt_fixtures enable row level security;
alter table public.lt_rule_sections enable row level security;
alter table public.lt_rules enable row level security;
alter table public.lt_follows enable row level security;

-- Sports: everyone reads, admins write.
drop policy if exists lt_sports_read on public.lt_sports;
create policy lt_sports_read on public.lt_sports for select using (true);
drop policy if exists lt_sports_admin on public.lt_sports;
create policy lt_sports_admin on public.lt_sports for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Competitions
drop policy if exists lt_comp_read on public.lt_competitions;
create policy lt_comp_read on public.lt_competitions for select
  using (status = 'published' or public.lt_can_manage(id, 'scorekeeper'));
drop policy if exists lt_comp_insert on public.lt_competitions;
create policy lt_comp_insert on public.lt_competitions for insert
  with check (auth.uid() is not null and created_by = auth.uid() and public.lt_is_organizer(auth.uid()));
drop policy if exists lt_comp_update on public.lt_competitions;
create policy lt_comp_update on public.lt_competitions for update
  using (public.lt_can_manage(id, 'editor'))
  with check (public.has_role(auth.uid(),'admin') or status <> 'published' or public.lt_is_public(id));
drop policy if exists lt_comp_delete on public.lt_competitions;
create policy lt_comp_delete on public.lt_competitions for delete using (public.has_role(auth.uid(),'admin'));

-- Organizer links: owners and admins manage; members can see their own.
drop policy if exists lt_org_read on public.lt_competition_organizers;
create policy lt_org_read on public.lt_competition_organizers for select
  using (user_id = auth.uid() or public.lt_can_manage(competition_id, 'owner'));
drop policy if exists lt_org_write on public.lt_competition_organizers;
create policy lt_org_write on public.lt_competition_organizers for all
  using (public.lt_can_manage(competition_id, 'owner'))
  with check (public.lt_can_manage(competition_id, 'owner'));

-- Applications: applicants see and create their own; admins review.
drop policy if exists lt_app_own on public.lt_organizer_applications;
create policy lt_app_own on public.lt_organizer_applications for select
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists lt_app_create on public.lt_organizer_applications;
create policy lt_app_create on public.lt_organizer_applications for insert
  with check (user_id = auth.uid());
drop policy if exists lt_app_review on public.lt_organizer_applications;
create policy lt_app_review on public.lt_organizer_applications for update
  using (public.has_role(auth.uid(),'admin'));

-- Child tables share one pattern: public read when published, editors write.
do $$
declare t text;
begin
  foreach t in array array['lt_divisions','lt_venues','lt_teams','lt_players','lt_rule_sections'] loop
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format('create policy %I_read on public.%I for select using (public.lt_is_public(competition_id) or public.lt_can_manage(competition_id, ''scorekeeper''))', t, t);
    execute format('drop policy if exists %I_write on public.%I', t, t);
    execute format('create policy %I_write on public.%I for all using (public.lt_can_manage(competition_id, ''editor'')) with check (public.lt_can_manage(competition_id, ''editor''))', t, t);
  end loop;
end $$;

-- Fixtures: editors create/delete; scorekeepers may update results.
drop policy if exists lt_fix_read on public.lt_fixtures;
create policy lt_fix_read on public.lt_fixtures for select
  using (public.lt_is_public(competition_id) or public.lt_can_manage(competition_id, 'scorekeeper'));
drop policy if exists lt_fix_insert on public.lt_fixtures;
create policy lt_fix_insert on public.lt_fixtures for insert with check (public.lt_can_manage(competition_id, 'editor'));
drop policy if exists lt_fix_update on public.lt_fixtures;
create policy lt_fix_update on public.lt_fixtures for update
  using (public.lt_can_manage(competition_id, 'scorekeeper')) with check (public.lt_can_manage(competition_id, 'scorekeeper'));
drop policy if exists lt_fix_delete on public.lt_fixtures;
create policy lt_fix_delete on public.lt_fixtures for delete using (public.lt_can_manage(competition_id, 'editor'));

-- Rules: readable with their section's competition.
drop policy if exists lt_rules_read on public.lt_rules;
create policy lt_rules_read on public.lt_rules for select using (exists (
  select 1 from public.lt_rule_sections s where s.id = section_id
  and (public.lt_is_public(s.competition_id) or public.lt_can_manage(s.competition_id, 'scorekeeper'))));
drop policy if exists lt_rules_write on public.lt_rules;
create policy lt_rules_write on public.lt_rules for all using (exists (
  select 1 from public.lt_rule_sections s where s.id = section_id and public.lt_can_manage(s.competition_id, 'editor')))
  with check (exists (select 1 from public.lt_rule_sections s where s.id = section_id and public.lt_can_manage(s.competition_id, 'editor')));

-- Follows: each user manages their own.
drop policy if exists lt_follow_own on public.lt_follows;
create policy lt_follow_own on public.lt_follows for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Organizers can publish only through review: a non-admin save that tries to
-- publish is turned into pending_review.
create or replace function public.lt_guard_publish() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null in the SQL editor and for the service role: allow those.
  if new.status = 'published' and auth.uid() is not null and not public.has_role(auth.uid(),'admin')
     and (tg_op = 'INSERT' or old.status <> 'published') then
    new.status := 'pending_review';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists lt_guard_publish on public.lt_competitions;
create trigger lt_guard_publish before insert or update on public.lt_competitions
  for each row execute function public.lt_guard_publish();

-- When an organizer creates a competition, make them its owner.
create or replace function public.lt_add_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.lt_competition_organizers(competition_id, user_id, role)
    values (new.id, new.created_by, 'owner') on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists lt_add_owner on public.lt_competitions;
create trigger lt_add_owner after insert on public.lt_competitions
  for each row execute function public.lt_add_owner();

-- Owners (and admins) add a teammate by email.
create or replace function public.lt_add_organizer_by_email(_comp uuid, _email text, _role text default 'editor')
returns boolean language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not public.lt_can_manage(_comp, 'owner') then raise exception 'Only the competition owner can add organizers'; end if;
  if _role not in ('owner','editor','scorekeeper') then raise exception 'Unknown role'; end if;
  select id into uid from auth.users where lower(email) = lower(_email) limit 1;
  if uid is null then return false; end if;
  insert into public.lt_competition_organizers(competition_id, user_id, role) values (_comp, uid, _role)
  on conflict (competition_id, user_id) do update set role = excluded.role;
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Sport presets (edit freely in the admin section later).
-- ---------------------------------------------------------------------------
insert into public.lt_sports (key, name, scoring_mode, participant, allow_draws, points_win, points_draw, points_loss, tiebreakers, target_default, sets_to_win, labels) values
 ('domino','Dominoes','target','both',false,3,0,0,array['points','diff','for','name'],15,null,'{"match":"Set","score":"Points","for":"PF","against":"PA"}'),
 ('football','Football','score','team',true,3,1,0,array['points','diff','for','h2h','name'],null,null,'{"match":"Match","score":"Goals","for":"GF","against":"GA"}'),
 ('basketball','Basketball','score','team',false,2,0,1,array['points','h2h','diff','for','name'],null,null,'{"match":"Game","score":"Points","for":"PF","against":"PA"}'),
 ('netball','Netball','score','team',true,3,1,0,array['points','diff','for','name'],null,null,'{"match":"Match","score":"Goals","for":"GF","against":"GA"}'),
 ('cricket','Cricket','score','team',true,2,1,0,array['points','wins','diff','name'],null,null,'{"match":"Match","score":"Runs","for":"RF","against":"RA"}'),
 ('volleyball','Volleyball','sets','team',false,3,0,0,array['points','wins','diff','name'],25,3,'{"match":"Match","score":"Sets","for":"SW","against":"SL"}'),
 ('tennis','Tennis','sets','player',false,1,0,0,array['wins','diff','name'],null,2,'{"match":"Match","score":"Sets","for":"SW","against":"SL"}'),
 ('athletics','Athletics','time','player',false,0,0,0,array['time','name'],null,null,'{"match":"Heat","score":"Time","for":"","against":""}'),
 ('esports','Esports','score','both',false,3,0,0,array['points','diff','name'],null,null,'{"match":"Match","score":"Maps","for":"MW","against":"ML"}')
on conflict (key) do nothing;
