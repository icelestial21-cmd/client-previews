import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Competition, CompetitionBundle, Fixture, OrganizerRole, Player, RuleTag } from "../../types";
import { useBundle, useData, useLoad } from "../../data/DataProvider";
import { slugify } from "../../data/source";
import { STAGE_LABEL, targetFor } from "../../engine/derive";
import { validateScore } from "../../engine/standings";
import { roundNames } from "../../engine/bracket";
import { Badge, Btn, Card, Empty, Field, Input, Select, Spinner, TextArea, cx, display, fmtDate } from "../../ui/kit";
import { paths } from "../../routes";

type Section = "details" | "format" | "divisions" | "venues" | "teams" | "fixtures" | "results" | "rules" | "organizers";
const SECTIONS: { key: Section; label: string; min: OrganizerRole | "admin" }[] = [
  { key: "details", label: "Details", min: "editor" }, { key: "format", label: "Format & scoring", min: "editor" },
  { key: "divisions", label: "Divisions", min: "editor" }, { key: "venues", label: "Venues", min: "editor" },
  { key: "teams", label: "Teams & players", min: "editor" }, { key: "fixtures", label: "Fixtures", min: "editor" },
  { key: "results", label: "Results", min: "scorekeeper" }, { key: "rules", label: "Rules", min: "editor" },
  { key: "organizers", label: "Organizers", min: "owner" },
];
const RANK = { scorekeeper: 1, editor: 2, owner: 3, admin: 4 } as const;

/** Shared editor for the admin section and the organizer section. */
export function EditCompetitionPage({ area }: { area: "admin" | "organizer" }) {
  const { slug } = useParams();
  const { source, viewer } = useData();
  const { data: b, loading, reload } = useBundle(slug);
  const mine = useLoad(() => source.competitions("manage"), [viewer.id]);
  const role = (mine.data ?? []).find((c) => c.slug === slug)?.my_role ?? null;
  const allowed = SECTIONS.filter((s) => role && RANK[role] >= RANK[s.min as keyof typeof RANK]);
  const [sec, setSec] = useState<Section>("details");
  useEffect(() => { if (allowed.length && !allowed.some((s) => s.key === sec)) setSec(allowed[0].key); }, [allowed, sec]);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (fn: () => Promise<unknown>, okText = "Saved") => {
    try { await fn(); setFlash({ ok: true, text: okText }); reload(); } catch (e) { setFlash({ ok: false, text: (e as Error).message }); }
    setTimeout(() => setFlash(null), 3500);
  };

  if (loading || mine.loading) return <Spinner />;
  if (!viewer.id) return <Gate>Sign in to manage competitions.</Gate>;
  if (area === "admin" && !viewer.isAdmin) return <Gate>The admin section is for CSQ admins only.</Gate>;
  if (!b || !role) return <Gate>You don’t have access to this competition.</Gate>;
  const back = area === "admin" ? paths.admin() : paths.organizer();
  const c = b.competition;

  return (
    <div className="min-h-screen bg-muted/50 text-primary">
      <div className="csq-pips bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-6">
        <div>
          <Link to={back} className="text-sm text-white/80">← {area === "admin" ? "Admin · Competitions" : "Organizer dashboard"}</Link>
          <h1 className={cx(display, "mt-1 text-5xl leading-none")}>{c.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={c.status} /><Badge tone="muted">{b.sport.name}</Badge><Badge tone="muted">Your role: {role}</Badge></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={paths.competition(c.slug)} className="inline-flex min-h-11 items-center rounded-full border-2 border-white px-4 text-sm font-semibold">View public page</Link>
          {c.status !== "published" && (viewer.isAdmin
            ? <Btn variant="accent" onClick={() => run(() => source.saveCompetition({ id: c.id, status: "published" }), "Published")}>Publish</Btn>
            : c.status !== "pending_review" && <Btn variant="accent" onClick={() => run(() => source.saveCompetition({ id: c.id, status: "published" }), "Sent to CSQ for review")}>Submit for review</Btn>)}
        </div>
      </div></div>
      {c.status === "pending_review" && <div className="bg-accent/30 px-6 py-2 text-center text-sm font-semibold">Waiting for a CSQ admin to review and publish.</div>}

      <div className="mx-auto flex max-w-7xl flex-wrap gap-6 px-6 py-6">
        <nav aria-label="Editor sections" className="flex w-full flex-row flex-wrap gap-1 md:w-52 md:flex-col">
          {allowed.map((s) => <button key={s.key} onClick={() => setSec(s.key)} className={cx("min-h-11 rounded-xl px-4 text-left text-sm", sec === s.key ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-card")}>{s.label}</button>)}
        </nav>
        <div className="min-w-0 flex-1">
          {flash && <div role="status" className={cx("mb-4 rounded-xl px-4 py-3 text-sm font-semibold", flash.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900")}>{flash.text}</div>}
          {sec === "details" && <DetailsForm b={b} run={run} isAdmin={viewer.isAdmin} />}
          {sec === "format" && <FormatForm b={b} run={run} />}
          {sec === "divisions" && <DivisionsEditor b={b} run={run} />}
          {sec === "venues" && <VenuesEditor b={b} run={run} />}
          {sec === "teams" && <TeamsEditor b={b} run={run} />}
          {sec === "fixtures" && <FixturesEditor b={b} run={run} />}
          {sec === "results" && <ResultsEditor b={b} run={run} />}
          {sec === "rules" && <RulesEditor b={b} run={run} />}
          {sec === "organizers" && <OrganizersEditor b={b} run={run} />}
        </div>
      </div>
    </div>
  );
}

type Run = (fn: () => Promise<unknown>, ok?: string) => Promise<void>;
const Gate = ({ children }: { children: ReactNode }) => <div className="mx-auto max-w-xl p-10"><Empty>{children}</Empty></div>;
export const StatusBadge = ({ status }: { status: Competition["status"] }) => <Badge tone={status === "published" ? "success" : status === "pending_review" ? "accent" : "muted"}>{status.replace("_", " ")}</Badge>;
const H = ({ children, sub }: { children: ReactNode; sub?: string }) => <div className="mb-4"><h2 className={cx(display, "text-3xl")}>{children}</h2>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</div>;

function DetailsForm({ b, run, isAdmin }: { b: CompetitionBundle; run: Run; isAdmin: boolean }) {
  const { source } = useData();
  const sports = useLoad(() => source.sports(), []);
  const [f, setF] = useState(b.competition);
  const nav = useNavigate();
  const set = <K extends keyof Competition>(k: K, v: Competition[K]) => setF((x) => ({ ...x, [k]: v }));
  const save = () => run(async () => { const saved = await source.saveCompetition({ id: f.id, name: f.name, slug: slugify(f.slug), kind: f.kind, sport_key: f.sport_key, country: f.country, starts_on: f.starts_on, ends_on: f.ends_on, summary: f.summary, poster_url: f.poster_url, about: f.about, eligibility: f.eligibility, ...(isAdmin ? { status: f.status } : {}) }); if (saved.slug !== b.competition.slug) nav(location.pathname.replace(b.competition.slug, saved.slug), { replace: true }); });
  return (
    <Card className="p-6"><H sub="What the public sees at the top of the competition page.">Details</H>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Web address" hint={`/leagues/${slugify(f.slug)}`}><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
        <Field label="Type"><Select value={f.kind} onChange={(e) => set("kind", e.target.value as Competition["kind"])}><option value="league">League</option><option value="tournament">Tournament</option><option value="hybrid">League + knockouts</option></Select></Field>
        <Field label="Sport" hint="The sport decides how results become standings."><Select value={f.sport_key} onChange={(e) => set("sport_key", e.target.value)}>{(sports.data ?? []).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</Select></Field>
        <Field label="Starts"><Input type="date" value={f.starts_on ?? ""} onChange={(e) => set("starts_on", e.target.value || null)} /></Field>
        <Field label="Ends"><Input type="date" value={f.ends_on ?? ""} onChange={(e) => set("ends_on", e.target.value || null)} /></Field>
        <Field label="Country"><Input value={f.country ?? ""} onChange={(e) => set("country", e.target.value)} /></Field>
        <Field label="Poster image URL"><Input value={f.poster_url ?? ""} onChange={(e) => set("poster_url", e.target.value || null)} placeholder="https://…" /></Field>
        {isAdmin && <Field label="Status (admin)"><Select value={f.status} onChange={(e) => set("status", e.target.value as Competition["status"])}><option value="draft">Draft</option><option value="pending_review">Pending review</option><option value="published">Published</option><option value="archived">Archived</option></Select></Field>}
      </div>
      <div className="mt-4 space-y-4">
        <Field label="Short summary"><TextArea value={f.summary ?? ""} onChange={(e) => set("summary", e.target.value)} /></Field>
        <div>
          <div className="mb-1 text-sm font-semibold text-muted-foreground">About sections</div>
          {f.about.map((a, i) => (
            <div key={i} className="mb-3 rounded-xl border border-border p-3">
              <div className="flex gap-2"><Input aria-label="Heading" value={a.heading} onChange={(e) => set("about", f.about.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))} /><Btn variant="ghost" onClick={() => set("about", f.about.filter((_, j) => j !== i))}>Remove</Btn></div>
              <TextArea aria-label="Text" className="mt-2" value={a.body} onChange={(e) => set("about", f.about.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
            </div>))}
          <Btn variant="outline" size="sm" onClick={() => set("about", [...f.about, { heading: "", body: "" }])}>+ Add section</Btn>
        </div>
        <Field label="Who can take part" hint="One requirement per line."><TextArea value={f.eligibility.join("\n")} onChange={(e) => set("eligibility", e.target.value.split("\n").filter((l) => l.trim()))} /></Field>
      </div>
      <div className="mt-6"><Btn onClick={save}>Save details</Btn></div>
    </Card>
  );
}

function FormatForm({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const [f, setF] = useState(b.competition);
  const s = b.sport;
  const num = (v: string) => (v === "" ? null : Number(v));
  return (
    <Card className="p-6"><H sub={`Defaults come from the ${s.name} preset. Leave a points box empty to use the default.`}>Format &amp; scoring</H>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Current stage" hint="Knockouts switch on the bracket pop-up."><Select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value as Competition["stage"] })}>{["registration", "regular", "second_round", "playoffs", "knockouts", "completed"].map((x) => <option key={x} value={x}>{x.replace("_", " ")}</option>)}</Select></Field>
        <Field label="Bracket size"><Select value={f.bracket_size} onChange={(e) => setF({ ...f, bracket_size: Number(e.target.value) })}>{[4, 8, 16, 32, 64, 128].map((n) => <option key={n} value={n}>{n === 4 ? "Semifinals (4)" : n === 8 ? "Quarterfinals (8)" : `Round of ${n}`}</option>)}</Select></Field>
        <Field label="Seats decided by playoff" hint="E.g. 4: places 29–36 play for the last 4 of 32."><Input type="number" min={0} max={f.bracket_size} value={f.playoff_seats} onChange={(e) => setF({ ...f, playoff_seats: Number(e.target.value) })} /></Field>
        <Field label={`Points for a win (default ${s.points_win})`}><Input type="number" value={f.points_win ?? ""} onChange={(e) => setF({ ...f, points_win: num(e.target.value) })} /></Field>
        {s.allow_draws && <Field label={`Points for a draw (default ${s.points_draw})`}><Input type="number" value={f.points_draw ?? ""} onChange={(e) => setF({ ...f, points_draw: num(e.target.value) })} /></Field>}
        <Field label={`Points for a loss (default ${s.points_loss})`}><Input type="number" value={f.points_loss ?? ""} onChange={(e) => setF({ ...f, points_loss: num(e.target.value) })} /></Field>
        <Field label="Knockouts start"><Input type="date" value={f.knockout_starts_on ?? ""} onChange={(e) => setF({ ...f, knockout_starts_on: e.target.value || null })} /></Field>
        <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={f.third_place} onChange={(e) => setF({ ...f, third_place: e.target.checked })} className="size-5" />Third-place match</label>
        <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={f.knockout_popup} onChange={(e) => setF({ ...f, knockout_popup: e.target.checked })} className="size-5" />Show bracket pop-up when knockouts start</label>
      </div>
      <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">Rounds: {roundNames(f.bracket_size, f.third_place).map((r) => r.name).join(" → ")}. Tiebreakers for {s.name}: {s.tiebreakers.join(", ")}.</p>
      <div className="mt-6"><Btn onClick={() => run(() => source.saveCompetition({ id: f.id, stage: f.stage, bracket_size: f.bracket_size, playoff_seats: f.playoff_seats, points_win: f.points_win, points_draw: f.points_draw, points_loss: f.points_loss, knockout_starts_on: f.knockout_starts_on, third_place: f.third_place, knockout_popup: f.knockout_popup }))}>Save format</Btn></div>
    </Card>
  );
}

function DivisionsEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const [rows, setRows] = useState(b.divisions);
  useEffect(() => setRows(b.divisions), [b.divisions]);
  return (
    <Card className="p-6"><H sub="Men’s, women’s, age groups… Each can have its own roster size and set target.">Divisions</H>
      <div className="space-y-2">
        {rows.map((d, i) => (
          <div key={d.id} className="grid items-end gap-2 rounded-xl border border-border p-3 md:grid-cols-[1.4fr_1fr_100px_120px_auto]">
            <Field label="Name"><Input value={d.name} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></Field>
            <Field label="Short name"><Input value={d.short_name ?? ""} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, short_name: e.target.value } : x)))} /></Field>
            <Field label="Roster max"><Input type="number" value={d.roster_max ?? ""} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, roster_max: e.target.value ? Number(e.target.value) : null } : x)))} /></Field>
            <Field label={`Target (${b.sport.target_default ?? "none"})`}><Input type="number" value={d.target_points ?? ""} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, target_points: e.target.value ? Number(e.target.value) : null } : x)))} /></Field>
            <div className="flex gap-1"><Btn size="sm" onClick={() => run(() => source.upsert("divisions", rows[i]))}>Save</Btn><Btn size="sm" variant="ghost" onClick={() => run(() => source.remove("divisions", d.id), "Removed")}>Delete</Btn></div>
          </div>))}
      </div>
      <Btn className="mt-3" variant="outline" onClick={() => run(() => source.upsert("divisions", { competition_id: b.competition.id, name: "New division", short_name: null, roster_max: null, target_points: null, sort: rows.length }), "Division added")}>+ Add division</Btn>
    </Card>
  );
}

function VenuesEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const [n, setN] = useState(""); const [a, setA] = useState("");
  return (
    <Card className="p-6"><H>Venues</H>
      <div className="divide-y divide-border rounded-xl border border-border">
        {b.venues.map((v) => <div key={v.id} className="flex items-center justify-between gap-3 p-3 text-sm"><span><strong>{v.name}</strong><span className="block text-muted-foreground">{v.address}</span></span><Btn size="sm" variant="ghost" onClick={() => run(() => source.remove("venues", v.id), "Removed")}>Delete</Btn></div>)}
        {b.venues.length === 0 && <p className="p-3 text-sm text-muted-foreground">No venues yet.</p>}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1.4fr_auto]"><Input placeholder="Venue name" value={n} onChange={(e) => setN(e.target.value)} /><Input placeholder="Address" value={a} onChange={(e) => setA(e.target.value)} />
        <Btn disabled={!n.trim()} onClick={() => run(async () => { await source.upsert("venues", { competition_id: b.competition.id, name: n.trim(), address: a.trim() || null, map_url: null }); setN(""); setA(""); }, "Venue added")}>Add venue</Btn></div>
    </Card>
  );
}

/** Parses pasted lists: one player per line, "Name “Nick”" or "Name (Nick)". */
export function parsePlayers(text: string) {
  return text.split("\n").map((l) => l.replace(/^\s*\d+[.)]?\s*/, "").replace(/^\*/, "").trim()).filter(Boolean).map((line) => {
    let name = line, nickname: string | null = null;
    const q = name.match(/[“"]([^”"]+)[”"]/); if (q) { nickname = q[1]; name = name.replace(q[0], "").trim(); }
    const p = name.match(/\(([^)]+)\)\s*$/); if (!nickname && p) { nickname = p[1]; name = name.replace(p[0], "").trim(); }
    return { name, nickname };
  });
}

function TeamsEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const [sel, setSel] = useState<string | null>(b.teams[0]?.id ?? null);
  const [newTeam, setNewTeam] = useState("");
  const [paste, setPaste] = useState(""); const [pasteDiv, setPasteDiv] = useState(b.divisions[0]?.id ?? "");
  const team = b.teams.find((t) => t.id === sel);
  const players = b.players.filter((p) => p.team_id === sel);
  const [edit, setEdit] = useState<Record<string, Partial<Player>>>({});
  const parsed = useMemo(() => parsePlayers(paste), [paste]);
  return (
    <div className="flex flex-wrap gap-5">
      <Card className="w-full p-4 md:w-72">
        <H>Teams</H>
        <div className="space-y-1">{b.teams.map((t) => <button key={t.id} onClick={() => setSel(t.id)} className={cx("flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm", sel === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><span>{t.name}</span><span className="text-xs opacity-70">{b.players.filter((p) => p.team_id === t.id).length}</span></button>)}</div>
        <div className="mt-3 flex gap-2"><Input placeholder="New team" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} /><Btn disabled={!newTeam.trim()} onClick={() => run(async () => { const t = await source.upsert("teams", { competition_id: b.competition.id, name: newTeam.trim(), short_name: null, logo_url: null, home_venue_id: null }); setNewTeam(""); setSel(t.id); }, "Team added")}>Add</Btn></div>
      </Card>
      <div className="min-w-0 flex-1 space-y-5">
        {!team ? <Empty>Add a team to start.</Empty> : <>
          <Card className="p-5">
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Team name"><Input defaultValue={team.name} key={team.id} onBlur={(e) => e.target.value.trim() && e.target.value !== team.name && run(() => source.upsert("teams", { id: team.id, name: e.target.value.trim() }), "Team renamed")} /></Field>
              <Btn variant="ghost" onClick={() => confirm(`Delete ${team.name}? Its players stay but lose their team.`) && run(() => source.remove("teams", team.id), "Team deleted")}>Delete team</Btn>
            </div>
            <h3 className={cx(display, "mt-5 text-2xl")}>Players ({players.length})</h3>
            <div className="mt-2 space-y-2">
              {players.map((p) => { const e = edit[p.id] ?? {}; const v = { ...p, ...e }; const dirty = Object.keys(e).length > 0; return (
                <div key={p.id} className="grid items-center gap-2 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
                  <Input aria-label="Name" value={v.name} onChange={(x) => setEdit({ ...edit, [p.id]: { ...e, name: x.target.value } })} />
                  <Input aria-label="Nickname" placeholder="Nickname" value={v.nickname ?? ""} onChange={(x) => setEdit({ ...edit, [p.id]: { ...e, nickname: x.target.value || null } })} />
                  <Select aria-label="Division" value={v.division_id ?? ""} onChange={(x) => setEdit({ ...edit, [p.id]: { ...e, division_id: x.target.value || null } })}>{b.divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
                  <Input aria-label="Note" placeholder="Note (e.g. Captain)" value={v.note ?? ""} onChange={(x) => setEdit({ ...edit, [p.id]: { ...e, note: x.target.value || null } })} />
                  <div className="flex gap-1">{dirty && <Btn size="sm" onClick={() => run(async () => { await source.upsert("players", { id: p.id, ...e }); const n = { ...edit }; delete n[p.id]; setEdit(n); })}>Save</Btn>}<Btn size="sm" variant="ghost" aria-label={`Remove ${p.name}`} onClick={() => run(() => source.remove("players", p.id), "Player removed")}>✕</Btn></div>
                </div>); })}
              {players.length === 0 && <p className="text-sm text-muted-foreground">No players yet. Paste a list below.</p>}
            </div>
          </Card>
          <Card className="p-5"><H sub="Paste straight from WhatsApp: one player per line. Nicknames in “quotes” or (brackets) are picked up.">Add players in bulk</H>
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <TextArea rows={7} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"1. Marvin Dawkins (Brukkie)\n2. Ravoy Creary (Zozo)\n3. Sparrow"} />
              <div className="space-y-3"><Field label="Division"><Select value={pasteDiv} onChange={(e) => setPasteDiv(e.target.value)}>{b.divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
                <p className="text-xs text-muted-foreground">{parsed.length} players found{parsed[0] ? `, e.g. ${parsed[0].name}${parsed[0].nickname ? ` “${parsed[0].nickname}”` : ""}` : ""}.</p>
                <Btn disabled={!parsed.length} onClick={() => run(async () => { for (const p of parsed) await source.upsert("players", { competition_id: b.competition.id, team_id: team.id, division_id: pasteDiv || null, name: p.name, nickname: p.nickname, photo_url: null, note: null }); setPaste(""); }, `${parsed.length} players added`)}>Add {parsed.length || ""} players</Btn></div>
            </div>
          </Card>
        </>}
      </div>
    </div>
  );
}

function entrantOptions(b: CompetitionBundle, divisionId: string | null) {
  const useTeams = b.sport.participant !== "player";
  const usePlayers = b.sport.participant !== "team";
  return { useTeams, usePlayers, players: b.players.filter((p) => !divisionId || p.division_id === divisionId) };
}

function FixturesEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const stages = ["regular", "second_round", "playoff", ...roundNames(b.competition.bracket_size, b.competition.third_place).map((r) => r.key)];
  const blank = { stage: "regular", round_label: "", date: "", time: "19:45", venue_id: "", division_id: "", kind: b.sport.participant === "player" ? "player" : "team", home: "", away: "" };
  const [f, setF] = useState(blank);
  const opts = entrantOptions(b, f.division_id || null);
  const add = () => run(async () => {
    const starts_at = f.date ? new Date(`${f.date}T${f.time || "19:45"}:00-05:00`).toISOString() : null;
    const row: Partial<Fixture> = { competition_id: b.competition.id, stage: f.stage, round_label: f.round_label || STAGE_LABEL[f.stage] || null, starts_at, venue_id: f.venue_id || null, division_id: f.division_id || null, status: "scheduled", detail: {}, bracket_slot: null, home_score: null, away_score: null,
      home_team_id: f.kind === "team" ? f.home || null : null, away_team_id: f.kind === "team" ? f.away || null : null, home_player_id: f.kind === "player" ? f.home || null : null, away_player_id: f.kind === "player" ? f.away || null : null };
    await source.upsert("fixtures", row); setF({ ...blank, stage: f.stage, date: f.date, venue_id: f.venue_id, division_id: f.division_id });
  }, "Fixture added");
  const name = (x: Fixture) => { const t = (id: string | null) => b.teams.find((y) => y.id === id)?.name; const p = (id: string | null) => b.players.find((y) => y.id === id)?.name; const h = t(x.home_team_id) ?? p(x.home_player_id), a = t(x.away_team_id) ?? p(x.away_player_id); return h && a ? `${h} vs ${a}` : "Draw to be announced"; };
  return (
    <div className="space-y-5">
      <Card className="p-6"><H sub="Leave the sides empty for rounds that are drawn later.">Add a fixture</H>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Stage"><Select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>{stages.map((s) => <option key={s} value={s}>{STAGE_LABEL[s] ?? s}</option>)}</Select></Field>
          <Field label="Round label"><Input placeholder="e.g. Matchday 3" value={f.round_label} onChange={(e) => setF({ ...f, round_label: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Time"><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
          <Field label="Venue"><Select value={f.venue_id} onChange={(e) => setF({ ...f, venue_id: e.target.value })}><option value="">—</option>{b.venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</Select></Field>
          <Field label="Division"><Select value={f.division_id} onChange={(e) => setF({ ...f, division_id: e.target.value })}><option value="">All divisions</option>{b.divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
          {opts.useTeams && opts.usePlayers && <Field label="Between"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value, home: "", away: "" })}><option value="team">Teams</option><option value="player">Players</option></Select></Field>}
          {(["home", "away"] as const).map((side) => (
            <Field key={side} label={side === "home" ? "Side A" : "Side B"}><Select value={f[side]} onChange={(e) => setF({ ...f, [side]: e.target.value })}><option value="">To be decided</option>
              {f.kind === "team" ? b.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>) : opts.players.map((p) => <option key={p.id} value={p.id}>{p.name}{p.nickname ? ` “${p.nickname}”` : ""}</option>)}</Select></Field>))}
        </div>
        <Btn className="mt-4" disabled={f.home !== "" && f.home === f.away} onClick={add}>Add fixture</Btn>
      </Card>
      <Card className="p-6"><H>All fixtures ({b.fixtures.length})</H>
        <div className="csq-scroll-x"><div className="min-w-[640px] divide-y divide-border">
          {b.fixtures.map((x) => <div key={x.id} className="grid grid-cols-[110px_130px_1fr_auto] items-center gap-3 py-2.5 text-sm"><span>{fmtDate(x.starts_at)}</span><span className="text-muted-foreground">{x.round_label ?? STAGE_LABEL[x.stage]}</span><span>{name(x)}{x.division_id && <span className="text-xs text-muted-foreground"> · {b.divisions.find((d) => d.id === x.division_id)?.short_name}</span>}</span><Btn size="sm" variant="ghost" onClick={() => run(() => source.remove("fixtures", x.id), "Fixture removed")}>Delete</Btn></div>)}
        </div></div>
      </Card>
    </div>
  );
}

function ResultsEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const ready = b.fixtures.filter((x) => (x.home_team_id && x.away_team_id) || (x.home_player_id && x.away_player_id));
  const [scores, setScores] = useState<Record<string, [string, string]>>({});
  const [quick, setQuick] = useState({ division_id: b.divisions[0]?.id ?? "", a: "", b: "", sa: "", sb: "", stage: "regular" });
  const nm = (x: Fixture, side: "home" | "away") => b.teams.find((t) => t.id === x[`${side}_team_id`])?.name ?? b.players.find((p) => p.id === x[`${side}_player_id`])?.name ?? "?";
  const save = (x: Fixture) => { const [h, a] = scores[x.id] ?? [String(x.home_score ?? ""), String(x.away_score ?? "")]; const target = targetFor(b.sport, b.divisions.find((d) => d.id === x.division_id));
    const err = validateScore(b.sport, target, Number(h), Number(a)); if (err) return run(async () => { throw new Error(err); });
    return run(() => source.upsert("fixtures", { id: x.id, home_score: Number(h), away_score: Number(a), status: "final" }), "Result saved"); };
  const qp = b.players.filter((p) => p.division_id === quick.division_id);
  const qTarget = targetFor(b.sport, b.divisions.find((d) => d.id === quick.division_id));
  return (
    <div className="space-y-5">
      {b.sport.participant !== "team" && b.players.length > 0 && (
        <Card className="p-6"><H sub={`Record a ${b.sport.labels.match?.toLowerCase() ?? "match"} between two players${qTarget ? `: first to ${qTarget}` : ""}. It goes straight into the standings.`}>Quick result</H>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_90px_1fr_90px_auto]">
            <Field label="Division"><Select value={quick.division_id} onChange={(e) => setQuick({ ...quick, division_id: e.target.value, a: "", b: "" })}>{b.divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
            <Field label="Player A"><Select value={quick.a} onChange={(e) => setQuick({ ...quick, a: e.target.value })}><option value="">Choose…</option>{qp.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            <Field label="A score"><Input type="number" min={0} value={quick.sa} onChange={(e) => setQuick({ ...quick, sa: e.target.value })} /></Field>
            <Field label="Player B"><Select value={quick.b} onChange={(e) => setQuick({ ...quick, b: e.target.value })}><option value="">Choose…</option>{qp.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            <Field label="B score"><Input type="number" min={0} value={quick.sb} onChange={(e) => setQuick({ ...quick, sb: e.target.value })} /></Field>
            <div className="flex items-end"><Btn onClick={() => { if (!quick.a || !quick.b || quick.a === quick.b) return run(async () => { throw new Error("Pick two different players."); }); const err = validateScore(b.sport, qTarget, Number(quick.sa), Number(quick.sb)); if (err) return run(async () => { throw new Error(err); });
              return run(async () => { await source.upsert("fixtures", { competition_id: b.competition.id, division_id: quick.division_id, stage: quick.stage, round_label: "Result", starts_at: new Date().toISOString(), venue_id: null, home_team_id: null, away_team_id: null, home_player_id: quick.a, away_player_id: quick.b, bracket_slot: null, status: "final", home_score: Number(quick.sa), away_score: Number(quick.sb), detail: {} }); setQuick({ ...quick, a: "", b: "", sa: "", sb: "" }); }, "Result saved"); }}>Save</Btn></div>
          </div>
        </Card>
      )}
      <Card className="p-6"><H sub="Fixtures with both sides set. Saving marks the fixture final.">Enter scores</H>
        {ready.length === 0 ? <Empty>No fixtures with both sides set yet.</Empty> : (
          <div className="divide-y divide-border">
            {ready.map((x) => { const v = scores[x.id] ?? [String(x.home_score ?? ""), String(x.away_score ?? "")]; return (
              <div key={x.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="w-24 text-muted-foreground">{fmtDate(x.starts_at)}</span>
                <span className="min-w-[140px] flex-1 text-right font-semibold">{nm(x, "home")}</span>
                <Input aria-label={`${nm(x, "home")} score`} className="w-20 text-center" type="number" min={0} value={v[0]} onChange={(e) => setScores({ ...scores, [x.id]: [e.target.value, v[1]] })} />
                <span>–</span>
                <Input aria-label={`${nm(x, "away")} score`} className="w-20 text-center" type="number" min={0} value={v[1]} onChange={(e) => setScores({ ...scores, [x.id]: [v[0], e.target.value] })} />
                <span className="min-w-[140px] flex-1 font-semibold">{nm(x, "away")}</span>
                {x.status === "final" && <Badge tone="success">Final</Badge>}
                <Btn size="sm" onClick={() => save(x)}>Save</Btn>
              </div>); })}
          </div>)}
      </Card>
    </div>
  );
}

function RulesEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const [newSec, setNewSec] = useState("");
  const tags: (RuleTag | "")[] = ["", "scoring", "schedule", "bracket", "cards"];
  return (
    <div className="space-y-5">
      <Card className="p-5"><H sub="Rules tagged “scoring” show next to the standings. Tick “Show as quick rule” to put a rule in Rules at a glance.">Rules</H>
        <div className="flex gap-2"><Input placeholder="New section, e.g. Dress code" value={newSec} onChange={(e) => setNewSec(e.target.value)} /><Btn disabled={!newSec.trim()} onClick={() => run(async () => { await source.upsert("rule_sections", { competition_id: b.competition.id, title: newSec.trim(), sort: b.ruleSections.length }); setNewSec(""); }, "Section added")}>Add section</Btn></div>
      </Card>
      {b.ruleSections.map((s) => (
        <Card key={s.id} className="p-5">
          <div className="flex flex-wrap items-center gap-2"><Input className="max-w-md font-semibold" defaultValue={s.title} onBlur={(e) => e.target.value !== s.title && run(() => source.upsert("rule_sections", { id: s.id, title: e.target.value }), "Section renamed")} />
            <Btn variant="ghost" size="sm" onClick={() => confirm(`Delete “${s.title}” and its rules?`) && run(() => source.remove("rule_sections", s.id), "Section deleted")}>Delete section</Btn></div>
          <div className="mt-3 space-y-3">
            {s.rules.map((r) => <RuleRow key={r.id} r={r} tags={tags} run={run} />)}
            <Btn variant="outline" size="sm" onClick={() => run(() => source.upsert("rules", { section_id: s.id, body: "New rule", bullets: [], tag: null, highlight: false, chip_label: null, sort: s.rules.length }), "Rule added")}>+ Add rule</Btn>
          </div>
        </Card>))}
    </div>
  );
}
function RuleRow({ r, tags, run }: { r: CompetitionBundle["ruleSections"][number]["rules"][number]; tags: (RuleTag | "")[]; run: Run }) {
  const { source } = useData();
  const [v, setV] = useState(r);
  const dirty = JSON.stringify(v) !== JSON.stringify(r);
  return (
    <div className="rounded-xl border border-border p-3">
      <TextArea aria-label="Rule" value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} />
      <div className="mt-2 grid gap-2 md:grid-cols-[1.4fr_160px_1fr_auto]">
        <TextArea aria-label="Bullet points" className="min-h-11" placeholder="Bullet points, one per line (optional)" value={v.bullets.join("\n")} onChange={(e) => setV({ ...v, bullets: e.target.value.split("\n").filter((x) => x.trim()) })} />
        <Select aria-label="Tag" value={v.tag ?? ""} onChange={(e) => setV({ ...v, tag: (e.target.value || null) as RuleTag | null })}>{tags.map((t) => <option key={t} value={t}>{t ? t[0].toUpperCase() + t.slice(1) : "No tag"}</option>)}</Select>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={v.highlight} onChange={(e) => setV({ ...v, highlight: e.target.checked })} />Show as quick rule</label>{v.highlight && <Input aria-label="Quick rule label" placeholder="Short label" value={v.chip_label ?? ""} onChange={(e) => setV({ ...v, chip_label: e.target.value })} />}</div>
        <div className="flex gap-1">{dirty && <Btn size="sm" onClick={() => run(() => source.upsert("rules", v), "Rule saved")}>Save</Btn>}<Btn size="sm" variant="ghost" onClick={() => run(() => source.remove("rules", r.id), "Rule removed")}>Delete</Btn></div>
      </div>
    </div>
  );
}

function OrganizersEditor({ b, run }: { b: CompetitionBundle; run: Run }) {
  const { source } = useData();
  const list = useLoad(() => source.organizers(b.competition.id), [b]);
  const [email, setEmail] = useState(""); const [role, setRole] = useState<OrganizerRole>("editor");
  return (
    <Card className="p-6"><H sub="Owners manage everything, editors manage content, scorekeepers can only enter results.">Organizers</H>
      <div className="divide-y divide-border rounded-xl border border-border">
        {(list.data ?? []).map((o) => <div key={o.user_id} className="flex items-center justify-between gap-3 p-3 text-sm"><span><strong>{o.label}</strong> <Badge className="ml-2">{o.role}</Badge></span><Btn size="sm" variant="ghost" onClick={() => run(async () => { await source.removeOrganizer(b.competition.id, o.user_id); list.reload(); }, "Removed")}>Remove</Btn></div>)}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_180px_auto]"><Input type="email" placeholder="Their CSQ account email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value as OrganizerRole)}><option value="owner">Owner</option><option value="editor">Editor</option><option value="scorekeeper">Scorekeeper</option></Select>
        <Btn disabled={!email.includes("@")} onClick={() => run(async () => { const ok = await source.addOrganizer(b.competition.id, email, role); if (!ok) throw new Error("No CSQ account uses that email yet. Ask them to sign up first."); setEmail(""); list.reload(); }, "Organizer added")}>Add</Btn></div>
    </Card>
  );
}
