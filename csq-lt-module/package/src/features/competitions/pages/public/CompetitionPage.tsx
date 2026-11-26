import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useBundle } from "../../data/DataProvider";
import { KIND_LABEL, PHASE_LABEL, knockoutLive, phase, stageDates, targetFor, bracketSlots, tableFor, standingsSide } from "../../engine/derive";
import { Badge, Btn, Empty, Modal, Segmented, Spinner, cx, display, fmtDate, fmtTime } from "../../ui/kit";
import { FollowButton, RulesModal, useRules } from "../../components/shared";
import { CircularBracket } from "../../components/CircularBracket";
import { OverviewTab, ScheduleTab, StandingsTab, TeamsTab, PlayersTab } from "./tabs";
import { paths } from "../../routes";

const TABS = [
  { value: "overview", label: "Overview" }, { value: "schedule", label: "Schedule" }, { value: "standings", label: "Standings" },
  { value: "bracket", label: "Bracket" }, { value: "teams", label: "Teams" }, { value: "players", label: "Players" },
] as const;
type Tab = (typeof TABS)[number]["value"];

/** One page per competition, for any sport. Tabs live in the URL (?tab=standings). */
export function CompetitionPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: b, loading, reload } = useBundle(slug);
  const tab = (params.get("tab") as Tab) || "overview";
  const setTab = (t: Tab) => { const p = new URLSearchParams(params); p.set("tab", t); p.delete("team"); p.delete("player"); setParams(p); };
  const divParam = params.get("div");
  const [divId, setDivId] = useState<string | null>(null);
  useEffect(() => { if (b) setDivId(b.divisions.find((d) => d.id === divParam || d.short_name?.toLowerCase().startsWith(divParam ?? "~"))?.id ?? b.divisions[0]?.id ?? null); }, [b, divParam]);
  const rules = useRules(b ?? null);
  const [koOpen, setKoOpen] = useState(false);

  useEffect(() => {
    if (!b) return;
    const forced = params.get("stage") === "knockouts";
    let seen = false; try { seen = sessionStorage.getItem("csq_ko_" + b.competition.id) === "1"; } catch { /* ignore */ }
    if (knockoutLive(b.competition, forced) && (forced || !seen)) setKoOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.competition.id, params.get("stage")]);
  const closeKo = () => { setKoOpen(false); try { sessionStorage.setItem("csq_ko_" + b!.competition.id, "1"); } catch { /* ignore */ } };

  const division = b?.divisions.find((d) => d.id === divId) ?? null;
  const table = useMemo(() => (b ? tableFor(b, standingsSide(b), division?.id ?? null) : []), [b, division]);
  if (loading) return <Spinner />;
  if (!b) return <div className="mx-auto max-w-3xl p-10"><Empty>This competition isn’t available. It may be unpublished. <Link className="font-bold text-destructive underline" to={paths.list()}>Back to Leagues &amp; Tournaments</Link></Empty></div>;
  const c = b.competition, p = phase(c), target = targetFor(b.sport, division);
  const venue = (id: string | null) => b.venues.find((v) => v.id === id);
  const nextUp = b.fixtures.filter((f) => f.stage === "regular" && f.home_team_id).slice(0, 7);
  const dates = stageDates(b.fixtures, division?.id ?? null, c.bracket_size, c.third_place);
  const slots = bracketSlots(b, table, division?.short_name ?? "");
  const finalDate = dates.final ?? fmtDate(c.ends_on ? c.ends_on + "T12:00:00" : null, { month: "short", day: "numeric" });

  return (
    <div className="bg-background text-primary">
      <nav aria-label="Breadcrumb" className="border-b border-border"><div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-2.5 text-sm text-muted-foreground">
        <Link to="/">Home</Link><span>›</span><Link to={paths.list()}>Leagues &amp; Tournaments</Link><span>›</span><span className="font-medium text-primary">{c.name}</span>
      </div></nav>

      {nextUp.length > 0 && (
        <div className="border-b border-border bg-muted"><div className="csq-scroll-x mx-auto flex max-w-7xl gap-2.5 px-6 py-3">
          {nextUp.map((f) => (
            <div key={f.id} className="w-44 shrink-0 rounded-lg border border-border bg-card px-3 py-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-destructive">{fmtDate(f.starts_at)} · {fmtTime(f.starts_at)}</div>
              <div className="mt-1 text-sm font-semibold">{b.teams.find((t) => t.id === f.home_team_id)?.name}</div>
              <div className="text-sm font-semibold">{b.teams.find((t) => t.id === f.away_team_id)?.name}</div>
            </div>
          ))}
        </div></div>
      )}

      {b.divisions.length > 1 && (
        <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2.5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Division · <span className="text-primary">{division?.name}</span></div>
          <Segmented label="Division" value={divId ?? ""} onChange={(v) => setDivId(v)} options={b.divisions.map((d) => ({ value: d.id, label: d.name + (d.roster_max ? ` · up to ${d.roster_max}` : "") }))} />
        </div></div>
      )}

      <header className="mx-auto flex max-w-7xl flex-wrap gap-10 px-6 pb-4 pt-8">
        <div className="min-w-0 flex-[1_1_560px]">
          <div className="text-xs font-bold uppercase tracking-[.12em] text-destructive">{b.sport.name} · {KIND_LABEL[c.kind]} · {PHASE_LABEL[p]}</div>
          <h1 className={cx(display, "mt-2 text-5xl leading-[.92] md:text-7xl")}>{c.name}</h1>
          {c.summary && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.summary}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <FollowButton entity="competition" id={c.id} label="Follow competition" />
            <Btn variant="primary" onClick={rules.openAll}>Full rules</Btn>
          </div>
          {rules.chips.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-destructive">Rules at a glance</div>
              <div className="flex flex-wrap gap-2">{rules.chips.map((ch) => <button key={ch.id} onClick={() => rules.openRule(ch.id)} className="csq-lift min-h-10 rounded-full border border-border bg-muted px-3.5 text-sm font-semibold">{ch.label} ›</button>)}</div>
            </div>
          )}
        </div>
        <aside className="flex w-full max-w-xs min-w-[240px] flex-[0_1_320px] flex-col gap-4">
          {c.poster_url && <img src={c.poster_url} alt={`${c.name} poster`} className="w-full rounded-lg" />}
          <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 border-t-2 border-primary pt-3 text-sm">
            <dt className="text-muted-foreground">Dates</dt><dd className="font-semibold">{fmtDate(c.starts_on ? c.starts_on + "T12:00:00" : null, { month: "short", day: "numeric" })} – {fmtDate(c.ends_on ? c.ends_on + "T12:00:00" : null, { month: "short", day: "numeric" })}</dd>
            <dt className="text-muted-foreground">Scoring</dt><dd className="font-semibold">{target ? `${b.sport.labels.match ?? "Match"} to ${target} · ` : ""}Win {c.points_win ?? b.sport.points_win}{b.sport.allow_draws ? ` · Draw ${c.points_draw ?? b.sport.points_draw}` : ""} · Loss {c.points_loss ?? b.sport.points_loss}</dd>
            <dt className="text-muted-foreground">Bracket</dt><dd className="font-semibold">Round of {c.bracket_size}{c.playoff_seats ? ` · ${c.playoff_seats} playoff seats` : ""}</dd>
            <dt className="text-muted-foreground">Teams</dt><dd className="font-semibold">{b.teams.length} teams · {b.players.length} players</dd>
          </dl>
        </aside>
      </header>

      <div className="border-y border-border bg-background"><div className="csq-scroll-x mx-auto flex max-w-7xl gap-1 px-6">
        {TABS.map((t) => <button key={t.value} onClick={() => setTab(t.value)} aria-current={tab === t.value ? "page" : undefined}
          className={cx("min-h-12 shrink-0 border-b-[3px] px-4 text-sm", tab === t.value ? "border-primary font-bold" : "border-transparent text-muted-foreground hover:text-primary")}>{t.label}</button>)}
      </div></div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && <OverviewTab b={b} openRules={rules.openAll} venue={venue} />}
        {tab === "schedule" && <ScheduleTab b={b} divisionId={division?.id ?? null} venue={venue} />}
        {tab === "standings" && <StandingsTab b={b} division={division} onSaved={reload} openRule={rules.openRule} />}
        {tab === "bracket" && <div className="csq-pips -mx-6 rounded-none bg-[#0e3546] px-6 py-8 md:mx-0 md:rounded-2xl"><CircularBracket size={c.bracket_size} slots={slots} finalLabel={finalDate} dates={dates} thirdPlace={c.third_place} /></div>}
        {tab === "teams" && <TeamsTab b={b} venue={venue} />}
        {tab === "players" && <PlayersTab b={b} />}
      </main>

      <RulesModal bundle={b} open={rules.open} focus={rules.focus} onClose={rules.close} />
      <Modal open={koOpen} onClose={closeKo} wide kicker="Knockouts are live" title={`${c.name} · Round of ${c.bracket_size}`}>
        <div className="csq-pips bg-[#0e3546] p-5"><CircularBracket size={c.bracket_size} slots={slots} finalLabel={finalDate} dates={dates} thirdPlace={c.third_place} /></div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
          <Btn variant="accent" onClick={() => { closeKo(); setTab("bracket"); }}>Open full bracket</Btn>
          <Btn variant="outline" onClick={closeKo}>Continue to competition</Btn>
        </div>
      </Modal>
    </div>
  );
}
