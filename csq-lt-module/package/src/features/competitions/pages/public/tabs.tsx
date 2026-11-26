import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { CompetitionBundle, Division, Fixture, Venue } from "../../types";
import { qualify, roundNames } from "../../engine/bracket";
import { STAGE_LABEL, standingsSide, tableFor, targetFor } from "../../engine/derive";
import { scoringFor } from "../../engine/standings";
import { Badge, Btn, Card, Empty, Input, Segmented, cx, display, fmtDate, fmtTime, initials } from "../../ui/kit";
import { FollowButton, rulesTagged } from "../../components/shared";
import { useData, useFollows } from "../../data/DataProvider";
import { paths } from "../../routes";

type VenueFn = (id: string | null) => Venue | undefined;

export function OverviewTab({ b, openRules, venue }: { b: CompetitionBundle; openRules: () => void; venue: VenueFn }) {
  const c = b.competition;
  return (
    <div className="flex flex-wrap gap-8">
      <div className="min-w-0 flex-[2_1_520px] space-y-6">
        {c.about.map((a, i) => (
          <section key={i}><h2 className={cx(display, "text-4xl")}>{a.heading}</h2><p className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{a.body}</p></section>
        ))}
        {c.eligibility.length > 0 && (
          <Card className="bg-muted p-6"><h2 className={cx(display, "text-3xl")}>Who can take part</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">{c.eligibility.map((e, i) => <li key={i}>{e}</li>)}</ol></Card>
        )}
      </div>
      <aside className="min-w-0 flex-[1_1_300px] space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2"><h2 className={cx(display, "text-2xl")}>Match-night info</h2><Btn size="sm" variant="outline" onClick={openRules}>All rules</Btn></div>
          <ul className="mt-2 space-y-2 text-sm">
            {[...rulesTagged(b, "schedule"), ...rulesTagged(b, "scoring").slice(0, 2)].map((r) => <li key={r.id} className="border-b border-border pb-2">{r.body}</li>)}
            {rulesTagged(b, "schedule").length + rulesTagged(b, "scoring").length === 0 && <li className="text-muted-foreground">Rules will appear here once the organizer adds them.</li>}
          </ul>
        </Card>
        <Card className="p-5"><h2 className={cx(display, "text-2xl")}>Venues</h2>
          <ul className="mt-2 space-y-2 text-sm">{b.venues.map((v) => <li key={v.id}><strong>{v.name}</strong>{v.address && <span className="block text-muted-foreground">{v.address}</span>}</li>)}</ul>
        </Card>
      </aside>
    </div>
  );
}

function fixtureTitle(b: CompetitionBundle, f: Fixture) {
  const t = (id: string | null) => b.teams.find((x) => x.id === id)?.name;
  const p = (id: string | null) => b.players.find((x) => x.id === id)?.name;
  const home = t(f.home_team_id) ?? p(f.home_player_id), away = t(f.away_team_id) ?? p(f.away_player_id);
  return home && away ? { home, away } : null;
}

export function ScheduleTab({ b, divisionId, venue }: { b: CompetitionBundle; divisionId: string | null; venue: VenueFn }) {
  const groups = useMemo(() => {
    const m = new Map<string, Fixture[]>();
    for (const f of b.fixtures.filter((x) => !x.division_id || x.division_id === divisionId)) {
      const k = f.round_label || STAGE_LABEL[f.stage] || f.stage; m.set(k, [...(m.get(k) ?? []), f]);
    }
    return [...m.entries()];
  }, [b, divisionId]);
  if (!groups.length) return <Empty>No fixtures yet.</Empty>;
  return (
    <div className="space-y-8">
      {groups.map(([label, list]) => (
        <section key={label}>
          <h2 className={cx(display, "mb-3 text-3xl")}>{label}</h2>
          <div className="csq-scroll-x rounded-2xl border border-border bg-card"><div className="min-w-[640px]">
            {list.map((f) => { const t = fixtureTitle(b, f); const v = venue(f.venue_id); return (
              <div key={f.id} className="grid grid-cols-[120px_minmax(0,1.5fr)_minmax(0,1fr)_90px] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-0">
                <span className="font-semibold">{fmtDate(f.starts_at)}</span>
                <span>{t ? <><strong>{t.home}</strong> <span className="text-muted-foreground">vs</span> <strong>{t.away}</strong></> : <span className="text-muted-foreground">{STAGE_LABEL[f.stage] ?? f.stage} · draw to be announced</span>}</span>
                <span>{v?.name}<span className="block text-xs text-muted-foreground">{v?.address}</span></span>
                <span className="text-right">{f.status === "final" ? <strong className={cx(display, "text-xl")}>{f.home_score}–{f.away_score}</strong> : fmtTime(f.starts_at)}</span>
              </div>); })}
          </div></div>
        </section>
      ))}
    </div>
  );
}

export function StandingsTab({ b, division, openRule }: { b: CompetitionBundle; division: Division | null; onSaved?: () => void; openRule: (id: string) => void }) {
  const { viewer } = useData();
  const both = b.sport.participant === "both";
  const [side, setSide] = useState<"team" | "player">(standingsSide(b));
  const table = useMemo(() => tableFor(b, side, division?.id ?? null), [b, side, division]);
  const sc = scoringFor(b.sport, b.competition);
  const q = qualify(table, b.competition.bracket_size, b.competition.playoff_seats);
  const [all, setAll] = useState(false);
  const shown = all ? table : table.slice(0, Math.min(table.length, q.poolTo + 6));
  const L = b.sport.labels; const target = targetFor(b.sport, division);
  const zone = (i: number) => (i < q.directCount ? "#1f9d6b" : i < q.poolTo ? "hsl(var(--accent))" : "#c9d4d8");
  const played = table.reduce((n, r) => n + r.played, 0) / 2;
  const scoringRules = rulesTagged(b, "scoring");
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={cx(display, "text-4xl")}>{division?.name ?? ""} standings</h2>
          <p className="text-sm text-muted-foreground">{target ? `${L.match ?? "Match"}es are first to ${target}. ` : ""}Win {sc.win}{sc.allowDraws ? `, draw ${sc.draw}` : ""}, loss {sc.loss}. Updates automatically after every result.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {both && <Segmented label="Table" value={side} onChange={setSide} options={[{ value: "player", label: "Players" }, { value: "team", label: "Teams" }]} />}
          {viewer.id && <Link to={paths.organizer()} className="text-sm font-semibold text-destructive underline">Enter results</Link>}
        </div>
      </div>
      <div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1"><i className="size-2.5 rounded-sm bg-[#1f9d6b]" />Straight to bracket · 1–{q.directCount}</span>
          {q.playoff.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1"><i className="size-2.5 rounded-sm bg-accent" />Seat playoff · {q.poolFrom}–{q.poolTo}</span>}
          <span className="ml-auto text-muted-foreground">{played} results</span>
        </div>
        <div className="csq-scroll-x rounded-2xl border border-border bg-card"><div className="min-w-[760px]">
          <div className="grid grid-cols-[52px_minmax(0,1.8fr)_44px_44px_44px_44px_52px_52px_56px_60px] gap-2 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Pos</span><span>{side === "team" ? "Team" : "Player"}</span><span className="text-center">P</span><span className="text-center">W</span><span className="text-center">{sc.allowDraws ? "D" : ""}</span><span className="text-center">L</span><span className="text-center">{L.for ?? "F"}</span><span className="text-center">{L.against ?? "A"}</span><span className="text-center">+/−</span><span className="text-right">Pts</span>
          </div>
          {shown.map((r, i) => {
            const pl = side === "player" ? b.players.find((p) => p.id === r.id) : null;
            const team = pl ? b.teams.find((t) => t.id === pl.team_id)?.name : null;
            return (
              <div key={r.id}>
                {i === q.directCount && q.playoff.length > 0 && <div className="border-b border-border bg-muted px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">Seat playoff · places {q.poolFrom}–{q.poolTo}</div>}
                {i === q.poolTo && i > 0 && <div className="border-b border-border bg-muted px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Out of the bracket</div>}
                <div className="grid grid-cols-[52px_minmax(0,1.8fr)_44px_44px_44px_44px_52px_52px_56px_60px] items-center gap-2 border-b border-border px-4 py-2.5 text-sm" style={{ boxShadow: `inset 4px 0 0 ${zone(i)}` }}>
                  <span className={cx(display, "text-2xl")}>{i + 1}</span>
                  <span className="truncate"><strong>{r.name}</strong>{pl?.nickname && <span className="text-destructive"> “{pl.nickname}”</span>}{team && <span className="block text-xs text-muted-foreground">{team}</span>}</span>
                  <span className="text-center">{r.played}</span><span className="text-center">{r.wins}</span><span className="text-center">{sc.allowDraws ? r.draws : ""}</span><span className="text-center">{r.losses}</span>
                  <span className="text-center">{r.for}</span><span className="text-center">{r.against}</span>
                  <span className={cx("text-center font-semibold", r.diff > 0 ? "text-emerald-700" : r.diff < 0 ? "text-destructive" : "text-muted-foreground")}>{r.diff > 0 ? "+" : ""}{r.diff}</span>
                  <span className={cx(display, "text-right text-2xl")}>{r.points}</span>
                </div>
              </div>);
          })}
          {table.length === 0 && <div className="p-6 text-sm text-muted-foreground">No entrants yet.</div>}
        </div></div>
        {table.length > shown.length || all ? <div className="mt-3 text-center"><Btn variant="outline" onClick={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${table.length}`}</Btn></div> : null}
      </div>

      {q.playoff.length > 0 && (
        <section>
          <h2 className={cx(display, "text-4xl")}>Seat playoff</h2>
          <p className="mb-4 text-sm text-muted-foreground">Places 1–{q.directCount} go straight in. Places {q.poolFrom}–{q.poolTo} play off for the last {b.competition.playoff_seats} seats: best against worst.</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3">
            {q.playoff.map((m, k) => (
              <Card key={m.seat} className="csq-lift border-2 border-accent p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-destructive">Playoff {k + 1} · winner takes seat {m.seat}</div>
                <div className="mt-2 text-sm"><strong>{q.poolFrom + k}. {m.a.name}</strong> <span className="text-muted-foreground">({m.a.points} pts)</span></div>
                <div className="my-1 text-[11px] font-bold tracking-widest text-muted-foreground">VS</div>
                <div className="text-sm"><strong>{q.poolTo - k}. {m.b.name}</strong> <span className="text-muted-foreground">({m.b.points} pts)</span></div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className={cx(display, "text-4xl")}>How it all connects</h2>
        <div className="csq-scroll-x mt-3 rounded-2xl bg-[#0e3546] p-5 text-white"><div className="grid min-w-[820px] grid-cols-4 gap-4 text-sm">
          {[
            ["1 · Standings", `Every result adds points: win ${sc.win}${sc.allowDraws ? ` · draw ${sc.draw}` : ""} · loss ${sc.loss}.`],
            ["2 · Qualification", `Places 1–${q.directCount} go straight in${q.playoff.length ? `; ${q.poolFrom}–${q.poolTo} play off for ${b.competition.playoff_seats} seats` : ""}.`],
            ["3 · Knockout bracket", `${roundNames(b.competition.bracket_size, false).map((r) => r.name).slice(0, -1).join(" → ")}.`],
            ["4 · Podium", `Final decides 1st and 2nd${b.competition.third_place ? "; beaten semifinalists play for 3rd" : ""}.`],
          ].map(([h, t], i) => (
            <div key={i} className="relative rounded-xl border-2 border-[#3a7590] bg-primary p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-accent">{h}</div><p className="mt-1 text-white/85">{t}</p>
              {i < 3 && <span aria-hidden className="absolute -right-4 top-1/2 -translate-y-1/2 text-xl text-accent">→</span>}
            </div>))}
        </div></div>
      </section>

      {scoringRules.length > 0 && (
        <section><h2 className={cx(display, "text-3xl")}>Scoring rules</h2>
          <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
            {scoringRules.map((r) => <button key={r.id} onClick={() => openRule(r.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted"><span>{r.body}</span><span className="text-destructive">›</span></button>)}
          </div>
        </section>
      )}
    </div>
  );
}

export function TeamsTab({ b, venue }: { b: CompetitionBundle; venue: VenueFn }) {
  const [params, setParams] = useSearchParams();
  const f = useFollows();
  const teamId = params.get("team");
  const team = b.teams.find((t) => t.id === teamId);
  const open = (id: string | null) => { const p = new URLSearchParams(params); if (id) p.set("team", id); else p.delete("team"); setParams(p); window.scrollTo({ top: 0 }); };
  if (team) {
    const fx = b.fixtures.filter((x) => x.home_team_id === team.id || x.away_team_id === team.id);
    const later = b.fixtures.filter((x) => !x.home_team_id && !x.home_player_id);
    return (
      <div className="space-y-5">
        <button onClick={() => open(null)} className="min-h-11 text-sm font-semibold">← All teams</button>
        <div className="csq-pips flex flex-wrap items-center gap-6 rounded-2xl bg-primary p-7 text-primary-foreground">
          <span className={cx(display, "grid size-28 place-items-center rounded-3xl border-2 border-[#3a7590] bg-[#1d5a72] text-5xl text-accent")}>{initials(team.name)}</span>
          <div className="min-w-0 flex-1"><div className="text-xs font-bold uppercase tracking-[.12em] text-accent">{b.competition.name}</div><h1 className={cx(display, "text-6xl leading-none")}>{team.name}</h1>
            <p className="mt-1 text-sm text-white/80">{b.divisions.map((d) => `${b.players.filter((p) => p.team_id === team.id && p.division_id === d.id).length} ${d.short_name ?? d.name}`).join(" · ")}</p></div>
          <FollowButton entity="team" id={team.id} label="Follow team" size="lg" dark />
        </div>
        <div className="flex flex-wrap gap-5">
          <Card className="min-w-0 flex-[2_1_520px] p-5"><h2 className={cx(display, "text-3xl")}>{team.name} schedule</h2>
            <div className="mt-3 space-y-2">
              {fx.map((x) => { const opp = b.teams.find((t) => t.id === (x.home_team_id === team.id ? x.away_team_id : x.home_team_id)); const v = venue(x.venue_id); return (
                <div key={x.id} className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-primary p-4 text-sm">
                  <div className="w-24"><div className="text-[11px] font-bold uppercase text-destructive">{fmtDate(x.starts_at, { weekday: "short" })}</div><div className={cx(display, "text-2xl leading-none")}>{fmtDate(x.starts_at, { month: "short", day: "numeric" })}</div></div>
                  <div className="min-w-0 flex-1"><div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{x.round_label ?? STAGE_LABEL[x.stage]} · confirmed</div><div className={cx(display, "text-2xl")}>{team.name} vs {opp?.name}</div></div>
                  <div className="min-w-[180px] flex-1"><strong>{v?.name}</strong><span className="block text-muted-foreground">{v?.address} · {fmtTime(x.starts_at)}</span></div>
                </div>); })}
              {later.map((x) => (
                <div key={x.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-border bg-muted p-4 text-sm">
                  <div className="w-24"><div className={cx(display, "text-2xl leading-none")}>{fmtDate(x.starts_at, { month: "short", day: "numeric" })}</div></div>
                  <div className="min-w-0 flex-1"><div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">If they advance</div><div className={cx(display, "text-xl")}>{x.round_label ?? STAGE_LABEL[x.stage]}</div></div>
                  <div className="min-w-[180px] flex-1"><strong>{venue(x.venue_id)?.name}</strong></div>
                </div>))}
            </div>
          </Card>
          <Card className="min-w-0 flex-[1_1_300px] p-5"><h2 className={cx(display, "text-3xl")}>Roster</h2>
            {b.divisions.map((d) => { const ps = b.players.filter((p) => p.team_id === team.id && p.division_id === d.id); return (
              <div key={d.id} className="mt-3"><div className="text-xs font-bold uppercase tracking-wider text-destructive">{d.name} · {ps.length}</div>
                {ps.length === 0 ? <p className="py-2 text-sm text-muted-foreground">No players listed yet.</p> : ps.map((p) => (
                  <Link key={p.id} to={`?tab=players&player=${p.id}`} className="flex items-center gap-2.5 border-b border-border py-2 text-sm"><span className={cx(display, "grid size-8 place-items-center rounded-full bg-muted")}>{initials(p.name)}</span><span><strong>{p.name}</strong>{p.nickname && <span className="text-destructive"> “{p.nickname}”</span>}</span></Link>))}
              </div>); })}
          </Card>
        </div>
      </div>
    );
  }
  const sorted = [...b.teams].sort((a, z) => Number(f.has("team", z.id)) - Number(f.has("team", a.id)));
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
      {sorted.map((t) => { const fx = b.fixtures.find((x) => x.home_team_id === t.id || x.away_team_id === t.id); const opp = fx && b.teams.find((o) => o.id === (fx.home_team_id === t.id ? fx.away_team_id : fx.home_team_id)); return (
        <Card key={t.id} className="csq-lift flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3"><span className={cx(display, "grid size-12 place-items-center rounded-xl bg-primary text-xl text-accent")}>{initials(t.name)}</span>
            <div className="min-w-0"><div className={cx(display, "text-2xl leading-none")}>{t.name}</div><div className="text-xs text-muted-foreground">{b.players.filter((p) => p.team_id === t.id).length} players</div></div></div>
          {fx && <div className="rounded-lg bg-muted px-3 py-2 text-sm"><span className="text-[11px] font-bold uppercase tracking-wider text-destructive">{fx.round_label ?? "Next"} · {fmtDate(fx.starts_at)}</span><br />vs <strong>{opp?.name}</strong> · {venue(fx.venue_id)?.name}</div>}
          <div className="flex flex-wrap gap-2"><Btn className="flex-1" onClick={() => open(t.id)}>Schedule &amp; roster</Btn><FollowButton entity="team" id={t.id} /></div>
        </Card>); })}
    </div>
  );
}

export function PlayersTab({ b }: { b: CompetitionBundle }) {
  const [params, setParams] = useSearchParams();
  const f = useFollows();
  const [q, setQ] = useState(""); const [div, setDiv] = useState("all"); const [team, setTeam] = useState("all"); const [layout, setLayout] = useState<"cards" | "table">("cards"); const [page, setPage] = useState(1);
  const pid = params.get("player");
  const pl = b.players.find((p) => p.id === pid);
  const open = (id: string | null) => { const p = new URLSearchParams(params); if (id) p.set("player", id); else p.delete("player"); setParams(p); window.scrollTo({ top: 0 }); };
  const teamName = (id: string | null) => b.teams.find((t) => t.id === id)?.name ?? "";
  const divName = (id: string | null) => b.divisions.find((d) => d.id === id);

  if (pl) {
    const d = divName(pl.division_id); const mates = b.players.filter((p) => p.team_id === pl.team_id && p.division_id === pl.division_id && p.id !== pl.id);
    const side = standingsSide(b); const row = side === "player" ? tableFor(b, "player", pl.division_id).find((r) => r.id === pl.id) : undefined;
    return (
      <div className="space-y-5">
        <button onClick={() => open(null)} className="min-h-11 text-sm font-semibold">← All players</button>
        <div className="csq-pips flex flex-wrap items-center gap-7 rounded-2xl bg-primary p-7 text-primary-foreground">
          <div className="grid size-36 place-items-center rounded-3xl border-2 border-[#3a7590] bg-[#1d5a72] text-center">{pl.photo_url ? <img src={pl.photo_url} alt="" className="size-full rounded-3xl object-cover" /> : <div><div className={cx(display, "text-6xl text-accent")}>{initials(pl.name)}</div><div className="text-[11px] text-white/70">Photo to come</div></div>}</div>
          <div className="min-w-0 flex-[1_1_300px]">
            <div className="flex flex-wrap gap-2">{d && <Badge tone="accent">{d.name}</Badge>}<Link to={`?tab=teams&team=${pl.team_id}`} className="rounded-md border border-[#3a7590] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">{teamName(pl.team_id)} →</Link>{pl.note && <Badge tone="danger">{pl.note}</Badge>}</div>
            <h1 className={cx(display, "mt-2 text-6xl leading-none")}>{pl.name}</h1>
            {pl.nickname && <p className="mt-1 text-xl font-semibold text-accent">“{pl.nickname}”</p>}
            <div className="mt-4"><FollowButton entity="player" id={pl.id} label="Follow player" dark /></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Card className="min-w-0 flex-[2_1_480px] p-5"><h2 className={cx(display, "text-3xl")}>Season stats</h2>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
              {[["Played", row?.played], ["Won", row?.wins], [b.sport.labels.for ?? "For", row?.for], ["Points", row?.points]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-muted p-3"><div className={cx(display, "text-4xl leading-none")}>{v ?? "—"}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}
            </div>
            {!row?.played && <p className="mt-3 text-sm text-muted-foreground">Stats fill in after each result.</p>}
          </Card>
          <Card className="min-w-0 flex-[1_1_280px] p-5"><h2 className={cx(display, "text-3xl")}>{teamName(pl.team_id)} team-mates</h2>
            {mates.map((m) => <button key={m.id} onClick={() => open(m.id)} className="flex w-full items-center gap-2.5 border-b border-border py-2 text-left text-sm"><span className={cx(display, "grid size-8 place-items-center rounded-full bg-muted")}>{initials(m.name)}</span><span><strong>{m.name}</strong>{m.nickname && <span className="text-destructive"> “{m.nickname}”</span>}</span></button>)}
          </Card>
        </div>
      </div>
    );
  }

  const list = b.players.filter((p) => (div === "all" || (div === "following" ? f.has("player", p.id) : p.division_id === div)) && (team === "all" || p.team_id === team) && (!q || (p.name + " " + (p.nickname ?? "") + " " + teamName(p.team_id)).toLowerCase().includes(q.toLowerCase())));
  const per = 24, pages = Math.max(1, Math.ceil(list.length / per)), pg = Math.min(page, pages), shown = list.slice((pg - 1) * per, pg * per);
  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };
  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input type="search" aria-label="Search players" placeholder="Search by name, nickname or team" value={q} onChange={(e) => reset(setQ)(e.target.value)} className="flex-[1_1_280px]" />
          <Segmented label="Division" value={div} onChange={reset(setDiv)} options={[{ value: "all", label: "All" }, ...b.divisions.map((d) => ({ value: d.id, label: d.short_name ?? d.name })), { value: "following", label: `★ Following (${f.count("player")})` }]} />
        </div>
        <div role="group" aria-label="Team" className="flex flex-wrap gap-2">
          {[{ id: "all", name: "All teams" }, ...b.teams].map((t) => <button key={t.id} aria-pressed={team === t.id} onClick={() => reset(setTeam)(t.id)} className={cx("min-h-9 rounded-full border px-3 text-sm", team === t.id ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-border bg-card")}>{t.name}</button>)}
        </div>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground"><strong className={cx(display, "text-2xl text-primary")}>{list.length}</strong> players{pages > 1 && ` · showing ${(pg - 1) * per + 1}–${Math.min(pg * per, list.length)}`}</p>
        <Segmented label="Layout" value={layout} onChange={setLayout} options={[{ value: "cards", label: "Cards" }, { value: "table", label: "Big board" }]} />
      </div>
      {list.length === 0 ? <Empty>No players match.</Empty> : layout === "cards" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3.5">
          {shown.map((p) => { const d = divName(p.division_id); const women = d && b.divisions.indexOf(d) % 2 === 1; return (
            <button key={p.id} onClick={() => open(p.id)} className="csq-lift flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left">
              <div className={cx("csq-pips relative h-24", women ? "bg-destructive" : "bg-primary")}>
                <span className="absolute -bottom-6 left-4 grid size-16 place-items-center rounded-full border-[3px] border-white bg-muted shadow"><span className={cx(display, "text-2xl")}>{initials(p.name)}</span></span>
                {d && <Badge className="absolute right-3 top-3 bg-white/90">{d.short_name ?? d.name}</Badge>}
                {f.has("player", p.id) && <Badge tone="accent" className="absolute left-3 top-3">★ Following</Badge>}
              </div>
              <div className="flex flex-col gap-0.5 px-4 pb-4 pt-8"><span className={cx(display, "text-2xl leading-none")}>{p.name}</span><span className="min-h-5 text-sm font-semibold text-destructive">{p.nickname ? `“${p.nickname}”` : ""}</span><span className="text-sm text-muted-foreground">{teamName(p.team_id)}</span></div>
            </button>); })}
        </div>
      ) : (
        <div className="csq-scroll-x rounded-2xl border border-border bg-card"><div className="min-w-[640px]">
          <div className="grid grid-cols-[48px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_100px] gap-3 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>#</span><span>Player</span><span>Nickname</span><span>Team</span><span>Division</span></div>
          {shown.map((p, i) => <button key={p.id} onClick={() => open(p.id)} className="grid w-full grid-cols-[48px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_100px] items-center gap-3 border-b border-border px-4 py-3 text-left text-sm hover:bg-muted"><span className="text-muted-foreground">{(pg - 1) * per + i + 1}</span><strong>{p.name}</strong><span className="text-destructive">{p.nickname}</span><span>{teamName(p.team_id)}</span><span>{divName(p.division_id)?.short_name}</span></button>)}
        </div></div>
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className="flex flex-wrap justify-center gap-2 pt-4">
          <Btn variant="outline" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>← Previous</Btn>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Btn key={n} variant={n === pg ? "primary" : "outline"} aria-current={n === pg ? "page" : undefined} aria-label={`Page ${n}`} className="min-w-11" onClick={() => setPage(n)}>{n}</Btn>)}
          <Btn disabled={pg >= pages} onClick={() => setPage(pg + 1)}>Next →</Btn>
        </nav>
      )}
    </div>
  );
}
