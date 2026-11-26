import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData, useLoad } from "../../data/DataProvider";
import { KIND_LABEL, PHASE_LABEL, phase } from "../../engine/derive";
import { Badge, Empty, Input, Segmented, Select, Spinner, cx, display, fmtDate } from "../../ui/kit";
import { paths } from "../../routes";

/** Listing page: every published league and tournament, any sport. */
export function LeaguesTournamentsPage({ heroImage }: { heroImage?: string }) {
  const { source } = useData();
  const comps = useLoad(() => source.competitions("public"), []);
  const sports = useLoad(() => source.sports(), []);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "league" | "tournament">("all");
  const [sport, setSport] = useState("all");
  const [ph, setPh] = useState("all");

  const list = useMemo(() => (comps.data ?? []).filter((c) => {
    if (kind === "league" && c.kind === "tournament") return false;
    if (kind === "tournament" && c.kind === "league") return false;
    if (sport !== "all" && c.sport_key !== sport) return false;
    if (ph !== "all" && phase(c) !== ph) return false;
    const hay = (c.name + " " + c.sport_name + " " + (c.country ?? "")).toLowerCase();
    return !q || hay.includes(q.toLowerCase());
  }).sort((a, b) => ({ live: 0, upcoming: 1, completed: 2 }[phase(a)] - { live: 0, upcoming: 1, completed: 2 }[phase(b)])), [comps.data, kind, sport, ph, q]);

  return (
    <div className="bg-background text-primary">
      <section className="relative grid h-[300px] place-items-center bg-cover bg-center text-center" style={{ backgroundImage: heroImage ? `linear-gradient(rgba(20,72,93,.25),rgba(20,72,93,.25)), url(${heroImage})` : "linear-gradient(165deg,#f7d2a6,#ef9e6c 45%,#c86a4a 75%,#6e4a3c)" }}>
        <div className="px-6 text-white">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="mx-auto"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></svg>
          <h1 className={cx(display, "mt-2 text-5xl drop-shadow md:text-7xl")}>Leagues &amp; Tournaments</h1>
          <p className="mt-2 text-lg drop-shadow">Explore Caribbean leagues and tournaments: fixtures, standings, teams and players.</p>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Refine</div>
          <div className="flex flex-wrap items-center gap-3">
            <Input aria-label="Search" placeholder="Search by name, sport or country…" value={q} onChange={(e) => setQ(e.target.value)} className="flex-[3_1_280px]" />
            <Segmented label="Type" value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, { value: "league", label: "Leagues" }, { value: "tournament", label: "Tournaments" }]} />
            <Select aria-label="Sport" value={sport} onChange={(e) => setSport(e.target.value)} className="flex-[1_1_160px]">
              <option value="all">All sports</option>
              {(sports.data ?? []).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
            </Select>
            <Select aria-label="Status" value={ph} onChange={(e) => setPh(e.target.value)} className="flex-[1_1_140px]">
              <option value="all">Any status</option><option value="live">Live now</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {comps.loading ? <Spinner /> : list.length === 0 ? <Empty>No competitions match. Try another sport or clear the search.</Empty> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-5">
            {list.map((c) => { const p = phase(c); return (
              <Link key={c.id} to={paths.competition(c.slug)} className="csq-lift flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative h-44 overflow-hidden bg-primary">
                  {c.poster_url ? <img src={c.poster_url} alt="" className="h-full w-full object-cover object-top" /> : <div className={cx("csq-pips grid h-full place-items-center text-accent", display, "text-6xl")}>{c.sport_name}</div>}
                  <Badge tone={p === "live" ? "danger" : "accent"} className="absolute left-3 top-3">{PHASE_LABEL[p]}</Badge>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap gap-1.5"><Badge>{c.sport_name}</Badge><Badge>{KIND_LABEL[c.kind]}</Badge>{c.country && <Badge>{c.country}</Badge>}</div>
                  <div className={cx(display, "text-3xl leading-none")}>{c.name}</div>
                  <div className="text-sm text-muted-foreground">{fmtDate(c.starts_on ? c.starts_on + "T12:00:00" : null, { month: "short", day: "numeric" })} – {fmtDate(c.ends_on ? c.ends_on + "T12:00:00" : null, { month: "short", day: "numeric", year: "numeric" })} · {c.team_count} teams · {c.player_count} players</div>
                  {c.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{c.summary}</p>}
                  <span className="mt-1 font-bold text-destructive">View →</span>
                </div>
              </Link>); })}
          </div>
        )}
      </section>
    </div>
  );
}
