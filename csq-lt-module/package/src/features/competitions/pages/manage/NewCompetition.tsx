import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData, useLoad } from "../../data/DataProvider";
import { slugify } from "../../data/source";
import type { Competition } from "../../types";
import { Btn, Field, Input, Modal, Select } from "../../ui/kit";

/** Create a competition in any sport. Starts as a draft with sensible divisions. */
export function NewCompetitionButton({ editPath, label = "+ New competition" }: { editPath: (slug: string) => string; label?: string }) {
  const { source } = useData();
  const sports = useLoad(() => source.sports(), []);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", sport_key: "football", kind: "league" as Competition["kind"], starts_on: "", ends_on: "", divisions: "Open" });
  const [err, setErr] = useState<string | null>(null);
  const create = async () => {
    try {
      const c = await source.saveCompetition({ name: f.name.trim(), slug: slugify(f.name), sport_key: f.sport_key, kind: f.kind, starts_on: f.starts_on || null, ends_on: f.ends_on || null, status: "draft", stage: "registration", bracket_size: 16, playoff_seats: 0 });
      const divs = f.divisions.split(",").map((d) => d.trim()).filter(Boolean);
      for (const [i, d] of divs.entries()) await source.upsert("divisions", { competition_id: c.id, name: d, short_name: d.replace(/ (league|division)$/i, ""), roster_max: null, target_points: null, sort: i });
      setOpen(false); nav(editPath(c.slug));
    } catch (e) { setErr((e as Error).message); }
  };
  return (
    <>
      <Btn variant="accent" onClick={() => setOpen(true)}>{label}</Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="New competition" kicker="Leagues & Tournaments">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Portmore Netball League 2027" /></Field>
          <Field label="Sport"><Select value={f.sport_key} onChange={(e) => setF({ ...f, sport_key: e.target.value })}>{(sports.data ?? []).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</Select></Field>
          <Field label="Type"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Competition["kind"] })}><option value="league">League</option><option value="tournament">Tournament</option><option value="hybrid">League + knockouts</option></Select></Field>
          <Field label="Divisions" hint="Separate with commas, e.g. Men’s League, Women’s League"><Input value={f.divisions} onChange={(e) => setF({ ...f, divisions: e.target.value })} /></Field>
          <Field label="Starts"><Input type="date" value={f.starts_on} onChange={(e) => setF({ ...f, starts_on: e.target.value })} /></Field>
          <Field label="Ends"><Input type="date" value={f.ends_on} onChange={(e) => setF({ ...f, ends_on: e.target.value })} /></Field>
          {err && <p className="text-sm font-semibold text-destructive md:col-span-2">{err}</p>}
          <div className="md:col-span-2"><Btn disabled={!f.name.trim()} onClick={create}>Create draft</Btn></div>
        </div>
      </Modal>
    </>
  );
}
