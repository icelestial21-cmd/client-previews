// Shared types for the CSQ Leagues & Tournaments module.
// They mirror the Supabase tables in supabase/001_leagues_tournaments.sql.

export type ScoringMode = "target" | "score" | "sets" | "time";
export type Tiebreaker = "points" | "diff" | "for" | "wins" | "h2h" | "time" | "name";
export type CompetitionKind = "league" | "tournament" | "hybrid";
export type CompetitionStatus = "draft" | "pending_review" | "published" | "archived";
export type CompetitionStage = "registration" | "regular" | "second_round" | "playoffs" | "knockouts" | "completed";
export type OrganizerRole = "owner" | "editor" | "scorekeeper";
export type RuleTag = "scoring" | "schedule" | "bracket" | "cards";

export interface Sport {
  key: string;
  name: string;
  scoring_mode: ScoringMode;
  participant: "team" | "player" | "both";
  allow_draws: boolean;
  points_win: number;
  points_draw: number;
  points_loss: number;
  tiebreakers: Tiebreaker[];
  target_default: number | null;
  sets_to_win: number | null;
  labels: { match?: string; score?: string; for?: string; against?: string };
}

export interface Competition {
  id: string;
  slug: string;
  name: string;
  kind: CompetitionKind;
  sport_key: string;
  status: CompetitionStatus;
  stage: CompetitionStage;
  country: string | null;
  starts_on: string | null;
  ends_on: string | null;
  summary: string | null;
  about: { heading: string; body: string }[];
  eligibility: string[];
  poster_url: string | null;
  bracket_size: number;
  playoff_seats: number;
  third_place: boolean;
  knockout_popup: boolean;
  knockout_starts_on: string | null;
  points_win: number | null;
  points_draw: number | null;
  points_loss: number | null;
  extra: Record<string, unknown>;
  created_by: string | null;
}

export interface Division { id: string; competition_id: string; name: string; short_name: string | null; roster_max: number | null; target_points: number | null; sort: number }
export interface Venue { id: string; competition_id: string; name: string; address: string | null; map_url: string | null }
export interface Team { id: string; competition_id: string; name: string; short_name: string | null; logo_url: string | null; home_venue_id: string | null }
export interface Player { id: string; competition_id: string; team_id: string | null; division_id: string | null; name: string; nickname: string | null; photo_url: string | null; note: string | null }

export interface Fixture {
  id: string;
  competition_id: string;
  division_id: string | null;
  stage: string;            // regular, second_round, playoff, r64, r32, r16, qf, sf, third, final
  round_label: string | null;
  starts_at: string | null;
  venue_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_player_id: string | null;
  away_player_id: string | null;
  bracket_slot: number | null;
  status: "scheduled" | "live" | "final" | "postponed" | "cancelled";
  home_score: number | null;
  away_score: number | null;
  detail: Record<string, unknown>;
}

export interface RuleSection { id: string; competition_id: string; title: string; sort: number }
export interface Rule { id: string; section_id: string; body: string; bullets: string[]; tag: RuleTag | null; highlight: boolean; chip_label: string | null; sort: number }
export interface OrganizerLink { competition_id: string; user_id: string; role: OrganizerRole }
export interface OrganizerApplication { id: string; user_id: string; organization: string; contact_name: string; contact_phone: string | null; sport_key: string | null; message: string | null; status: "pending" | "approved" | "rejected"; created_at: string }

/** Everything a competition page needs, loaded in one go. */
export interface CompetitionBundle {
  competition: Competition;
  sport: Sport;
  divisions: Division[];
  venues: Venue[];
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
  ruleSections: (RuleSection & { rules: Rule[] })[];
}

export interface Viewer {
  id: string | null;
  name: string;
  isAdmin: boolean;
}
