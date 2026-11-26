import { useState } from "react";
import { Link } from "react-router-dom";
import type { Sport, Tiebreaker } from "../../types";
import { useData, useLoad } from "../../data/DataProvider";
import { KIND_LABEL, PHASE_LABEL, phase } from "../../engine/derive";
import { Badge, Btn, Card, Empty, Field, Input, Segmented, Select, Spinner, cx, display, fmtDate } from "../../ui/kit";
import { StatusBadge } from "../manage/EditCompetitionPage";
import { NewCompetitionButton } from "../manage/NewCompetition";
import { paths } from "../../routes";

/** CSQ admin section: every competition, organizer approvals and sport presets. */
export function AdminCompetitionsPage() {
  const { viewer } = useData();
  const [tab, setTab] = useState<"competitions" | "organizers" | "sports">("competitions");
  if (!viewer.isAdmin) return <div className="mx-auto max-w-xl p-10"><Empty>The admin section is for CSQ admins only.</Empty></div>;
  return (
    <div className="min-h-screen bg-muted/50 text-primary">
      <div className="csq-pips bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-7">
        <div><div className="text-xs font-bold uppercase tracking-[.12em] text-accent">CSQ Admin</div><h1 className={cx(display, "text-5xl leading-none")}>Leagues &amp; Tournaments</h1></div>
        <Segmented dark label="Admin area" value={tab} onChange={setTab} options={[{ value: "competitions", label: "Competitions" }, { value: "organizers", label: "Organizer requests" }, { value: "sports", label: "Sports" }]} />
      </div></div>
      <div className="mx-auto max-w-7xl px-6 py-6">
        {tab === "competitions" && <CompetitionsAdmin />}
        {tab === "organizers" && <ApplicationsAdmin />}
        {tab === "sports" && <SportsAdmin />}
      </div>
    </div>
  );
}

function CompetitionsAdmin() {
  const { source } = useData();
  const list = useLoad(() => source.competitions("manage"), []);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const rows = (list.data ?? []).filter((c) => (status === "all" || c.status === status) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  const pending = (list.data ?? []).filter((c) => c.status === "pending_review").length;
  const act = async (fn: () => Promise<unknown>) => { await fn(); list.reload(); };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Competitions", list.data?.length ?? 0], ["Published", (list.data ?? []).filter((c) => c.status === "published").length], ["Waiting for review", pending], ["Players", (list.data ?? []).reduce((n, c) => n + c.player_count, 0)]].map(([l, v]) => (
          <Card key={l as string} className="p-4"><div className={cx(display, "text-4xl leading-none")}>{v}</div><div className="text-sm text-muted-foreground">{l}</div></Card>))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input aria-label="Search" placeholder="Search competitions" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[200px]"><option value="all">All statuses</option><option value="pending_review">Waiting for review</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>
        <div className="ml-auto"><NewCompetitionButton editPath={paths.adminEdit} /></div>
      </div>
      {list.loading ? <Spinner /> : (
        <Card className="csq-scroll-x"><div className="min-w-[980px]">
          <div className="grid grid-cols-[minmax(0,2fr)_100px_130px_90px_130px_300px] gap-3 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>Competition</span><span>Sport</span><span>Status</span><span>Dates</span><span>Entries</span><span /></div>
          {rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,2fr)_100px_130px_90px_130px_300px] items-center gap-3 border-b border-border px-4 py-3 text-sm">
              <span><Link to={paths.adminEdit(c.slug)} className="font-semibold underline-offset-2 hover:underline">{c.name}</Link><span className="block text-xs text-muted-foreground">{KIND_LABEL[c.kind]} · {PHASE_LABEL[phase(c)]}</span></span>
              <span>{c.sport_name}</span><span><StatusBadge status={c.status} /></span>
              <span className="text-xs">{fmtDate(c.starts_on ? c.starts_on + "T12:00:00" : null, { month: "short", day: "numeric" })}</span>
              <span className="text-xs">{c.team_count} teams · {c.player_count} players</span>
              <span className="flex flex-wrap justify-end gap-1">
                {c.status !== "published" && <Btn size="sm" variant="accent" onClick={() => act(() => source.saveCompetition({ id: c.id, status: "published" }))}>{c.status === "pending_review" ? "Approve & publish" : "Publish"}</Btn>}
                {c.status === "published" && <Btn size="sm" variant="outline" onClick={() => act(() => source.saveCompetition({ id: c.id, status: "draft" }))}>Unpublish</Btn>}
                <Link to={paths.adminEdit(c.slug)} className="inline-flex min-h-9 items-center rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground">Manage</Link>
                <Btn size="sm" variant="ghost" onClick={() => confirm(`Delete ${c.name} for good? This cannot be undone.`) && act(() => source.deleteCompetition(c.id))}>Delete</Btn>
              </span>
            </div>))}
          {rows.length === 0 && <div className="p-6 text-sm text-muted-foreground">No competitions match.</div>}
        </div></Card>
      )}
    </div>
  );
}

function ApplicationsAdmin() {
  const { source } = useData();
  const apps = useLoad(() => source.applications(), []);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Approved organizers can create competitions. Their competitions still need your approval before they go public.</p>
      {(apps.data ?? []).length === 0 && <Empty>No organizer requests.</Empty>}
      {(apps.data ?? []).map((a) => (
        <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-lg">{a.organization}</strong><Badge tone={a.status === "approved" ? "success" : a.status === "rejected" ? "danger" : "accent"}>{a.status}</Badge>{a.sport_key && <Badge>{a.sport_key}</Badge>}</div>
            <p className="text-sm text-muted-foreground">{a.contact_name}{a.contact_phone ? ` · ${a.contact_phone}` : ""} · {fmtDate(a.created_at)}</p>{a.message && <p className="mt-1 text-sm">{a.message}</p>}</div>
          {a.status === "pending" && <div className="flex gap-2"><Btn variant="accent" onClick={async () => { await source.reviewApplication(a.id, "approved"); apps.reload(); }}>Approve</Btn><Btn variant="outline" onClick={async () => { await source.reviewApplication(a.id, "rejected"); apps.reload(); }}>Decline</Btn></div>}
        </Card>))}
    </div>
  );
}

const ALL_TB: Tiebreaker[] = ["points", "diff", "for", "wins", "h2h", "time", "name"];
function SportsAdmin() {
  const { source } = useData();
  const sports = useLoad(() => source.sports(), []);
  const [edit, setEdit] = useState<Sport | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const blank: Sport = { key: "", name: "", scoring_mode: "score", participant: "team", allow_draws: true, points_win: 3, points_draw: 1, points_loss: 0, tiebreakers: ["points", "diff", "for", "name"], target_default: null, sets_to_win: null, labels: { match: "Match", score: "Score", for: "F", against: "A" } };
  return (
    <div className="flex flex-wrap gap-5">
      <Card className="w-full p-4 md:w-72">
        <h2 className={cx(display, "text-2xl")}>Sports</h2>
        <p className="mb-2 text-xs text-muted-foreground">Each sport sets how results turn into standings.</p>
        {(sports.data ?? []).map((s) => <button key={s.key} onClick={() => setEdit(s)} className={cx("flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm", edit?.key === s.key ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><span>{s.name}</span><span className="text-xs opacity-70">{s.scoring_mode}</span></button>)}
        <Btn className="mt-3 w-full" variant="outline" onClick={() => setEdit(blank)}>+ Add sport</Btn>
      </Card>
      {edit ? (
        <Card className="min-w-0 flex-1 p-6">
          <h2 className={cx(display, "mb-4 text-3xl")}>{edit.name || "New sport"}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Key" hint="Lowercase, no spaces"><Input value={edit.key} onChange={(e) => setEdit({ ...edit, key: e.target.value.toLowerCase().replace(/\W/g, "") })} /></Field>
            <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="How results work"><Select value={edit.scoring_mode} onChange={(e) => setEdit({ ...edit, scoring_mode: e.target.value as Sport["scoring_mode"] })}><option value="score">Final score (goals, points, runs)</option><option value="target">First to a target (dominoes)</option><option value="sets">Sets won (tennis, volleyball)</option><option value="time">Times (athletics)</option></Select></Field>
            <Field label="Who competes"><Select value={edit.participant} onChange={(e) => setEdit({ ...edit, participant: e.target.value as Sport["participant"] })}><option value="team">Teams</option><option value="player">Individual players</option><option value="both">Both</option></Select></Field>
            <Field label="Points for a win"><Input type="number" value={edit.points_win} onChange={(e) => setEdit({ ...edit, points_win: Number(e.target.value) })} /></Field>
            <Field label="Points for a loss"><Input type="number" value={edit.points_loss} onChange={(e) => setEdit({ ...edit, points_loss: Number(e.target.value) })} /></Field>
            <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" className="size-5" checked={edit.allow_draws} onChange={(e) => setEdit({ ...edit, allow_draws: e.target.checked })} />Draws allowed</label>
            {edit.allow_draws && <Field label="Points for a draw"><Input type="number" value={edit.points_draw} onChange={(e) => setEdit({ ...edit, points_draw: Number(e.target.value) })} /></Field>}
            {edit.scoring_mode === "target" && <Field label="Default target"><Input type="number" value={edit.target_default ?? ""} onChange={(e) => setEdit({ ...edit, target_default: e.target.value ? Number(e.target.value) : null })} /></Field>}
            {edit.scoring_mode === "sets" && <Field label="Sets to win"><Input type="number" value={edit.sets_to_win ?? ""} onChange={(e) => setEdit({ ...edit, sets_to_win: e.target.value ? Number(e.target.value) : null })} /></Field>}
            <Field label="Word for a match"><Input value={edit.labels.match ?? ""} onChange={(e) => setEdit({ ...edit, labels: { ...edit.labels, match: e.target.value } })} /></Field>
            <Field label="Column: scored"><Input value={edit.labels.for ?? ""} onChange={(e) => setEdit({ ...edit, labels: { ...edit.labels, for: e.target.value } })} /></Field>
            <Field label="Column: conceded"><Input value={edit.labels.against ?? ""} onChange={(e) => setEdit({ ...edit, labels: { ...edit.labels, against: e.target.value } })} /></Field>
          </div>
          <div className="mt-4"><div className="mb-1 text-sm font-semibold text-muted-foreground">Tiebreakers, in order</div>
            <div className="flex flex-wrap gap-2">{ALL_TB.map((t) => { const i = edit.tiebreakers.indexOf(t); return <button key={t} onClick={() => setEdit({ ...edit, tiebreakers: i >= 0 ? edit.tiebreakers.filter((x) => x !== t) : [...edit.tiebreakers, t] })} className={cx("min-h-9 rounded-full border px-3 text-sm", i >= 0 ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{i >= 0 ? `${i + 1}. ` : ""}{t}</button>; })}</div></div>
          {msg && <p className="mt-3 text-sm font-semibold">{msg}</p>}
          <Btn className="mt-5" disabled={!edit.key || !edit.name} onClick={async () => { try { await source.saveSport(edit); setMsg("Saved"); sports.reload(); } catch (e) { setMsg((e as Error).message); } }}>Save sport</Btn>
        </Card>
      ) : <div className="min-w-0 flex-1"><Empty>Pick a sport to edit its scoring, or add a new one.</Empty></div>}
    </div>
  );
}
