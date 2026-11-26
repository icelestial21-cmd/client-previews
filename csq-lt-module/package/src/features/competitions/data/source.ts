import type {
  Competition, CompetitionBundle, Division, Fixture, OrganizerApplication, OrganizerLink, OrganizerRole,
  Player, Rule, RuleSection, Sport, Team, Venue, Viewer,
} from "../types";

/** Tables an organizer or admin can edit row by row. */
export type EditableTable = "divisions" | "venues" | "teams" | "players" | "fixtures" | "rule_sections" | "rules";
export type RowOf<T extends EditableTable> =
  T extends "divisions" ? Division : T extends "venues" ? Venue : T extends "teams" ? Team :
  T extends "players" ? Player : T extends "fixtures" ? Fixture : T extends "rule_sections" ? RuleSection : Rule;

export interface CompetitionSummary extends Competition { sport_name: string; team_count: number; player_count: number; my_role: OrganizerRole | "admin" | null }

/**
 * Everything the pages need. There are two implementations:
 *  - supabaseSource.ts for the live CSQ site (Lovable)
 *  - mockSource.ts for the clickable preview (saved in the browser)
 */
export interface DataSource {
  viewer(): Promise<Viewer>;
  sports(): Promise<Sport[]>;
  saveSport(s: Sport): Promise<void>;

  /** scope: "public" = published only; "manage" = what this viewer can manage. */
  competitions(scope: "public" | "manage"): Promise<CompetitionSummary[]>;
  bundle(slug: string): Promise<CompetitionBundle | null>;
  saveCompetition(c: Partial<Competition> & { id?: string }): Promise<Competition>;
  deleteCompetition(id: string): Promise<void>;

  upsert<T extends EditableTable>(table: T, row: Partial<RowOf<T>> & { id?: string }): Promise<RowOf<T>>;
  remove(table: EditableTable, id: string): Promise<void>;

  organizers(competitionId: string): Promise<(OrganizerLink & { label: string })[]>;
  addOrganizer(competitionId: string, email: string, role: OrganizerRole): Promise<boolean>;
  removeOrganizer(competitionId: string, userId: string): Promise<void>;

  applications(): Promise<OrganizerApplication[]>;
  apply(a: Omit<OrganizerApplication, "id" | "user_id" | "status" | "created_at">): Promise<void>;
  reviewApplication(id: string, status: "approved" | "rejected"): Promise<void>;
  isApprovedOrganizer(): Promise<boolean>;

  follows(): Promise<Set<string>>; // "team:<id>", "player:<id>", "competition:<id>"
  toggleFollow(entity: "competition" | "team" | "player", id: string): Promise<boolean>;
}

export const TABLE: Record<EditableTable, string> = {
  divisions: "lt_divisions", venues: "lt_venues", teams: "lt_teams", players: "lt_players",
  fixtures: "lt_fixtures", rule_sections: "lt_rule_sections", rules: "lt_rules",
};

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "competition";
