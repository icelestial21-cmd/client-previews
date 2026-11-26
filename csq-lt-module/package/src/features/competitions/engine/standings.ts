import type { Competition, Fixture, Sport, Tiebreaker } from "../types";

/** Stages that count towards the table. Knockout rounds never do. */
export const TABLE_STAGES = ["regular", "second_round", "group"];
export const KNOCKOUT_STAGES = ["playoff", "r128", "r64", "r32", "r16", "qf", "sf", "third", "final"];

export interface ScoringRules {
  win: number;
  draw: number;
  loss: number;
  allowDraws: boolean;
  tiebreakers: Tiebreaker[];
}

/** Competition overrides win over the sport preset. */
export function scoringFor(sport: Sport, comp: Competition): ScoringRules {
  return {
    win: comp.points_win ?? sport.points_win,
    draw: comp.points_draw ?? sport.points_draw,
    loss: comp.points_loss ?? sport.points_loss,
    allowDraws: sport.allow_draws,
    tiebreakers: sport.tiebreakers.length ? sport.tiebreakers : ["points", "diff", "for", "name"],
  };
}

export interface Row {
  id: string;          // team or player id
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  for: number;
  against: number;
  diff: number;
  points: number;
}

export interface Entrant { id: string; name: string }

/**
 * Build a table from final fixtures.
 * `side` picks team or player fixtures, so the same engine serves team leagues
 * (football, netball) and individual competitions (dominoes, tennis).
 */
export function computeStandings(
  entrants: Entrant[],
  fixtures: Fixture[],
  rules: ScoringRules,
  side: "team" | "player",
): Row[] {
  const rows = new Map<string, Row>();
  for (const e of entrants) rows.set(e.id, { id: e.id, name: e.name, played: 0, wins: 0, draws: 0, losses: 0, for: 0, against: 0, diff: 0, points: 0 });
  const h2h = new Map<string, number>(); // "a|b" -> points a took from b

  for (const f of fixtures) {
    if (f.status !== "final" || f.home_score == null || f.away_score == null) continue;
    if (!TABLE_STAGES.includes(f.stage)) continue;
    const a = side === "team" ? f.home_team_id : f.home_player_id;
    const b = side === "team" ? f.away_team_id : f.away_player_id;
    if (!a || !b) continue;
    const A = rows.get(a), B = rows.get(b);
    if (!A || !B) continue;
    const sa = f.home_score, sb = f.away_score;
    A.played++; B.played++;
    A.for += sa; A.against += sb; B.for += sb; B.against += sa;
    let pa: number, pb: number;
    if (sa > sb) { A.wins++; B.losses++; pa = rules.win; pb = rules.loss; }
    else if (sb > sa) { B.wins++; A.losses++; pb = rules.win; pa = rules.loss; }
    else if (rules.allowDraws) { A.draws++; B.draws++; pa = pb = rules.draw; }
    else continue; // a tie where the sport has no draws is treated as not yet decided
    A.points += pa; B.points += pb;
    h2h.set(a + "|" + b, (h2h.get(a + "|" + b) ?? 0) + pa);
    h2h.set(b + "|" + a, (h2h.get(b + "|" + a) ?? 0) + pb);
  }

  const list = [...rows.values()].map((r) => ({ ...r, diff: r.for - r.against }));
  const cmp = (x: Row, y: Row): number => {
    for (const t of rules.tiebreakers) {
      let d = 0;
      if (t === "points") d = y.points - x.points;
      else if (t === "diff") d = y.diff - x.diff;
      else if (t === "for") d = y.for - x.for;
      else if (t === "wins") d = y.wins - x.wins;
      else if (t === "h2h") d = (h2h.get(y.id + "|" + x.id) ?? 0) - (h2h.get(x.id + "|" + y.id) ?? 0);
      else if (t === "name") d = x.name.localeCompare(y.name);
      if (d !== 0) return d;
    }
    return 0;
  };
  return list.sort(cmp);
}

/** Checks a submitted score against the sport, e.g. "one side must reach 15". */
export function validateScore(sport: Sport, target: number | null, home: number, away: number): string | null {
  if (!Number.isFinite(home) || !Number.isFinite(away) || home < 0 || away < 0) return "Scores must be zero or more.";
  if (sport.scoring_mode === "target" && target) {
    if (Math.max(home, away) !== target || home === away) return `One side must reach exactly ${target} and the other must have fewer.`;
  }
  if (sport.scoring_mode === "sets" && sport.sets_to_win) {
    if (Math.max(home, away) !== sport.sets_to_win || home === away) return `The winner must take ${sport.sets_to_win} sets.`;
  }
  if (!sport.allow_draws && home === away && sport.scoring_mode === "score") return `${sport.name} has no draws. Enter the final score after any tie-break.`;
  return null;
}
