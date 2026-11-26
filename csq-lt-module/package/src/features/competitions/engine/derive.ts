import type { Competition, CompetitionBundle, Division, Fixture, Sport } from "../types";
import { computeStandings, scoringFor, type Entrant, type Row } from "./standings";
import { qualify, roundNames, seedOrder } from "./bracket";

export const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Jamaica" });

export function phase(c: Pick<Competition, "starts_on" | "ends_on" | "stage">): "upcoming" | "live" | "completed" {
  const t = todayISO();
  if (c.stage === "completed" || (c.ends_on && t > c.ends_on)) return "completed";
  if (c.starts_on && t >= c.starts_on) return "live";
  return "upcoming";
}
export const PHASE_LABEL = { upcoming: "Upcoming", live: "Live now", completed: "Completed" } as const;
export const KIND_LABEL = { league: "League", tournament: "Tournament", hybrid: "League + knockouts" } as const;

export function knockoutLive(c: Competition, force = false) {
  if (force) return true;
  if (!c.knockout_popup) return false;
  return c.stage === "knockouts" || (!!c.knockout_starts_on && todayISO() >= c.knockout_starts_on);
}

export function targetFor(sport: Sport, div: Division | undefined | null) {
  return div?.target_points ?? sport.target_default ?? null;
}

/** Who appears in the table: teams for team sports, players for individual ones. */
export function standingsSide(b: CompetitionBundle, prefer?: "team" | "player"): "team" | "player" {
  if (b.sport.participant === "team") return "team";
  if (b.sport.participant === "player") return "player";
  return prefer ?? (b.fixtures.some((f) => f.home_player_id) || b.players.length ? "player" : "team");
}

export function entrantsFor(b: CompetitionBundle, side: "team" | "player", divisionId: string | null): Entrant[] {
  if (side === "team") return b.teams.map((t) => ({ id: t.id, name: t.name }));
  return b.players.filter((p) => !divisionId || p.division_id === divisionId).map((p) => ({ id: p.id, name: p.name }));
}

export function tableFor(b: CompetitionBundle, side: "team" | "player", divisionId: string | null): Row[] {
  const fx = b.fixtures.filter((f) => !divisionId || !f.division_id || f.division_id === divisionId);
  return computeStandings(entrantsFor(b, side, divisionId), fx, scoringFor(b.sport, b.competition), side);
}

/** Labels for each bracket slot: projected from the table once results exist. */
export function bracketSlots(b: CompetitionBundle, table: Row[], divisionShort: string) {
  const size = b.competition.bracket_size;
  const q = qualify(table, size, b.competition.playoff_seats);
  const anyResults = table.some((r) => r.played > 0);
  const order = seedOrder(size);
  return order.map((seed) => {
    const row = seed <= q.directCount ? q.direct[seed - 1] : undefined;
    const isPlayoff = seed > q.directCount;
    return {
      label: (divisionShort ? divisionShort[0] : "") + seed,
      title: anyResults && row ? row.name : isPlayoff ? "Seat playoff winner" : "Qualifier " + seed,
      subtitle: anyResults && row ? `Seed ${seed} on the current table (${row.points} pts).` : isPlayoff ? "Decided by the seat playoff." : "Filled from the standings.",
    };
  });
}

export function stageDates(fixtures: Fixture[], divisionId: string | null, size: number, third: boolean) {
  const out: Record<string, string> = {};
  for (const r of roundNames(size, third)) {
    const f = fixtures.find((x) => x.stage === r.key && (!divisionId || !x.division_id || x.division_id === divisionId) && x.starts_at);
    if (f?.starts_at) out[r.key] = new Date(f.starts_at).toLocaleDateString("en-JM", { timeZone: "America/Jamaica", weekday: "short", month: "short", day: "numeric" });
  }
  return out;
}

export const STAGE_LABEL: Record<string, string> = {
  regular: "Regular season", group: "Group stage", second_round: "Second round", playoff: "Seat playoff",
  r128: "Round of 128", r64: "Round of 64", r32: "Round of 32", r16: "Round of 16", qf: "Quarterfinals", sf: "Semifinals", third: "Third-place match", final: "Final",
};
