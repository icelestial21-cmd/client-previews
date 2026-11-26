// Live data source for the CSQ site. Uses the Supabase client Lovable already provides.
import { supabase } from "@/integrations/supabase/client";
import type { Competition, CompetitionBundle, OrganizerRole, Sport, Viewer } from "../types";
import { TABLE, type CompetitionSummary, type DataSource, type EditableTable } from "./source";

// The generated Supabase types will not know the new lt_* tables until they are
// regenerated, so queries go through an untyped handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function uid(): Promise<string | null> {
  const { data } = await db.auth.getUser();
  return data?.user?.id ?? null;
}
function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const supabaseSource: DataSource = {
  async viewer(): Promise<Viewer> {
    const { data } = await db.auth.getUser();
    const user = data?.user;
    if (!user) return { id: null, name: "Visitor", isAdmin: false };
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: user.id, _role: "admin" });
    return { id: user.id, name: user.user_metadata?.full_name ?? user.email ?? "Member", isAdmin: !!isAdmin };
  },

  async sports() { return must(await db.from("lt_sports").select("*").order("name")) as Sport[]; },
  async saveSport(s) { must(await db.from("lt_sports").upsert(s)); },

  async competitions(scope) {
    const me = await uid();
    let q = db.from("lt_competitions").select("*, lt_sports(name), lt_teams(count), lt_players(count), lt_competition_organizers(user_id, role)").order("starts_on", { ascending: false });
    if (scope === "public") q = q.eq("status", "published");
    const rows = must(await q) as any[];
    const admin = me ? !!(await db.rpc("has_role", { _user_id: me, _role: "admin" })).data : false;
    return rows
      .map((r) => {
        const link = (r.lt_competition_organizers ?? []).find((o: any) => o.user_id === me);
        const { lt_sports, lt_teams, lt_players, lt_competition_organizers, ...c } = r;
        return { ...c, sport_name: lt_sports?.name ?? c.sport_key, team_count: lt_teams?.[0]?.count ?? 0, player_count: lt_players?.[0]?.count ?? 0, my_role: admin ? "admin" : link?.role ?? null } as CompetitionSummary;
      })
      .filter((c) => scope === "public" || c.my_role);
  },

  async bundle(slug): Promise<CompetitionBundle | null> {
    const { data: competition } = await db.from("lt_competitions").select("*").eq("slug", slug).maybeSingle();
    if (!competition) return null;
    const id = competition.id;
    const [sport, divisions, venues, teams, players, fixtures, sections] = await Promise.all([
      db.from("lt_sports").select("*").eq("key", competition.sport_key).single(),
      db.from("lt_divisions").select("*").eq("competition_id", id).order("sort"),
      db.from("lt_venues").select("*").eq("competition_id", id).order("name"),
      db.from("lt_teams").select("*").eq("competition_id", id).order("name"),
      db.from("lt_players").select("*").eq("competition_id", id).order("name"),
      db.from("lt_fixtures").select("*").eq("competition_id", id).order("starts_at"),
      db.from("lt_rule_sections").select("*, lt_rules(*)").eq("competition_id", id).order("sort"),
    ]);
    return {
      competition, sport: must(sport), divisions: must(divisions), venues: must(venues), teams: must(teams),
      players: must(players), fixtures: must(fixtures),
      ruleSections: (must(sections) as any[]).map(({ lt_rules, ...s }) => ({ ...s, rules: (lt_rules ?? []).sort((a: any, b: any) => a.sort - b.sort) })),
    };
  },

  async saveCompetition(c) {
    const me = await uid();
    const row = c.id ? c : { ...c, created_by: me };
    return must(await db.from("lt_competitions").upsert(row).select().single()) as Competition;
  },
  async deleteCompetition(id) { must(await db.from("lt_competitions").delete().eq("id", id)); },

  async upsert(table, row) { return must(await db.from(TABLE[table as EditableTable]).upsert(row).select().single()); },
  async remove(table, id) { must(await db.from(TABLE[table]).delete().eq("id", id)); },

  async organizers(competitionId) {
    const rows = must(await db.from("lt_competition_organizers").select("*").eq("competition_id", competitionId)) as any[];
    return rows.map((r) => ({ ...r, label: r.user_id.slice(0, 8) }));
  },
  async addOrganizer(competitionId, email, role: OrganizerRole) {
    return !!must(await db.rpc("lt_add_organizer_by_email", { _comp: competitionId, _email: email, _role: role }));
  },
  async removeOrganizer(competitionId, userId) {
    must(await db.from("lt_competition_organizers").delete().eq("competition_id", competitionId).eq("user_id", userId));
  },

  async applications() { return must(await db.from("lt_organizer_applications").select("*").order("created_at", { ascending: false })); },
  async apply(a) { const me = await uid(); must(await db.from("lt_organizer_applications").insert({ ...a, user_id: me })); },
  async reviewApplication(id, status) { const me = await uid(); must(await db.from("lt_organizer_applications").update({ status, reviewed_by: me }).eq("id", id)); },
  async isApprovedOrganizer() { const me = await uid(); if (!me) return false; return !!(await db.rpc("lt_is_organizer", { _user: me })).data; },

  async follows() {
    const me = await uid(); if (!me) return new Set<string>();
    const rows = must(await db.from("lt_follows").select("entity, entity_id").eq("user_id", me)) as any[];
    return new Set(rows.map((r) => r.entity + ":" + r.entity_id));
  },
  async toggleFollow(entity, id) {
    const me = await uid(); if (!me) throw new Error("Sign in to follow");
    const { data } = await db.from("lt_follows").select("entity_id").eq("user_id", me).eq("entity", entity).eq("entity_id", id).maybeSingle();
    if (data) { must(await db.from("lt_follows").delete().eq("user_id", me).eq("entity", entity).eq("entity_id", id)); return false; }
    must(await db.from("lt_follows").insert({ user_id: me, entity, entity_id: id })); return true;
  },
};
