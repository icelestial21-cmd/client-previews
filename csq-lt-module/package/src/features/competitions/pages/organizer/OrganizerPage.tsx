import { useState } from "react";
import { Link } from "react-router-dom";
import { useData, useLoad } from "../../data/DataProvider";
import { KIND_LABEL, PHASE_LABEL, phase } from "../../engine/derive";
import { Badge, Btn, Card, Empty, Field, Input, Select, Spinner, TextArea, cx, display } from "../../ui/kit";
import { StatusBadge } from "../manage/EditCompetitionPage";
import { NewCompetitionButton } from "../manage/NewCompetition";
import { paths } from "../../routes";

/** Organizer section: run your own competitions. Publishing goes through CSQ review. */
export function OrganizerPage() {
  const { source, viewer } = useData();
  const mine = useLoad(() => source.competitions("manage"), [viewer.id]);
  const approved = useLoad(() => source.isApprovedOrganizer(), [viewer.id]);
  const apps = useLoad(() => source.applications(), [viewer.id]);
  if (!viewer.id) return <div className="mx-auto max-w-xl p-10"><Empty>Sign in to your CSQ account to run a league or tournament.</Empty></div>;
  const pendingApp = (apps.data ?? []).find((a) => a.status === "pending");
  return (
    <div className="min-h-screen bg-muted/50 text-primary">
      <div className="csq-pips bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-7">
        <div><div className="text-xs font-bold uppercase tracking-[.12em] text-accent">Organizer dashboard</div><h1 className={cx(display, "text-5xl leading-none")}>Your competitions</h1><p className="mt-1 text-sm text-white/80">Signed in as {viewer.name}</p></div>
        {approved.data && <NewCompetitionButton editPath={paths.organizerEdit} />}
      </div></div>
      <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {mine.loading || approved.loading ? <Spinner /> : <>
          {!approved.data && (pendingApp ? <Card className="p-6"><Badge tone="accent">Under review</Badge><p className="mt-2 text-sm">Thanks, {pendingApp.organization}. CSQ is reviewing your organizer request. You can still help run competitions you’ve been added to below.</p></Card> : <ApplyForm onDone={apps.reload} />)}
          {(mine.data ?? []).length === 0 ? <Empty>No competitions yet.{approved.data ? " Create your first one." : ""}</Empty> : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
              {(mine.data ?? []).map((c) => (
                <Card key={c.id} className="csq-lift flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap gap-1.5"><StatusBadge status={c.status} /><Badge>{c.sport_name}</Badge><Badge>{KIND_LABEL[c.kind]}</Badge></div>
                  <div className={cx(display, "text-3xl leading-none")}>{c.name}</div>
                  <div className="text-sm text-muted-foreground">{PHASE_LABEL[phase(c)]} · {c.team_count} teams · {c.player_count} players · your role: <strong>{c.my_role}</strong></div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link to={paths.organizerEdit(c.slug)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">{c.my_role === "scorekeeper" ? "Enter results" : "Manage"}</Link>
                    <Link to={paths.competition(c.slug)} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold">View</Link>
                  </div>
                </Card>))}
            </div>)}
        </>}
      </div>
    </div>
  );
}

function ApplyForm({ onDone }: { onDone: () => void }) {
  const { source } = useData();
  const sports = useLoad(() => source.sports(), []);
  const [f, setF] = useState({ organization: "", contact_name: "", contact_phone: "", sport_key: "", message: "" });
  const [err, setErr] = useState<string | null>(null);
  return (
    <Card className="p-6">
      <h2 className={cx(display, "text-3xl")}>Become an organizer</h2>
      <p className="mb-4 text-sm text-muted-foreground">Run your league or tournament on CSQ: fixtures, standings, brackets and player pages. CSQ approves new organizers.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Organization or club"><Input value={f.organization} onChange={(e) => setF({ ...f, organization: e.target.value })} /></Field>
        <Field label="Contact name"><Input value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} /></Field>
        <Field label="Phone (optional)"><Input value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} /></Field>
        <Field label="Sport"><Select value={f.sport_key} onChange={(e) => setF({ ...f, sport_key: e.target.value })}><option value="">Choose…</option>{(sports.data ?? []).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</Select></Field>
        <div className="md:col-span-2"><Field label="Tell us about your competition"><TextArea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field></div>
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      <Btn className="mt-4" disabled={!f.organization.trim() || !f.contact_name.trim()} onClick={async () => { try { await source.apply({ organization: f.organization, contact_name: f.contact_name, contact_phone: f.contact_phone || null, sport_key: f.sport_key || null, message: f.message || null }); onDone(); } catch (e) { setErr((e as Error).message); } }}>Send request</Btn>
    </Card>
  );
}
