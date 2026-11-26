import { useEffect, useMemo, useState } from "react";
import type { CompetitionBundle, Rule, RuleTag } from "../types";
import { Badge, Btn, Modal, cx, display } from "../ui/kit";
import { useFollows } from "../data/DataProvider";

const TAG_LABEL: Record<RuleTag, string> = { scoring: "Affects scoring", schedule: "Match times", bracket: "Bracket", cards: "Cards & penalties" };

/** Full rules pop-up. Pass `focus` (a rule id) to open on that rule. */
export function RulesModal({ bundle, open, focus, onClose }: { bundle: CompetitionBundle; open: boolean; focus: string | null; onClose: () => void }) {
  const [sec, setSec] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const sid = focus ? bundle.ruleSections.find((s) => s.rules.some((r) => r.id === focus))?.id : bundle.ruleSections[0]?.id;
    setSec(sid ?? null);
    const t = setTimeout(() => document.getElementById("rule-" + (focus ?? sid))?.scrollIntoView({ block: focus ? "center" : "start", behavior: "smooth" }), 80);
    return () => clearTimeout(t);
  }, [open, focus, bundle]);
  let n = 0;
  return (
    <Modal open={open} onClose={onClose} title="Official rules & regulations" kicker={bundle.competition.name}>
      <div role="group" aria-label="Rule sections" className="csq-scroll-x sticky top-0 z-10 flex gap-2 border-b border-border bg-muted px-4 py-2">
        {bundle.ruleSections.map((s) => (
          <button key={s.id} onClick={() => { setSec(s.id); document.getElementById("rule-" + s.id)?.scrollIntoView({ block: "start", behavior: "smooth" }); }}
            className={cx("min-h-9 shrink-0 rounded-full px-3 text-sm", sec === s.id ? "bg-primary font-semibold text-primary-foreground" : "border border-border bg-card")}>{s.title}</button>
        ))}
      </div>
      <div className="px-5 pb-6">
        {bundle.ruleSections.length === 0 && <p className="py-6 text-sm text-muted-foreground">No rules have been added yet.</p>}
        {bundle.ruleSections.map((s) => (
          <section key={s.id}>
            <h3 id={"rule-" + s.id} className={cx(display, "mb-2 mt-5 scroll-mt-16 text-2xl")}>{s.title}</h3>
            {s.rules.map((r) => { n++; const on = r.id === focus; return (
              <div key={r.id} id={"rule-" + r.id} className={cx("mb-2 flex scroll-mt-16 gap-3 rounded-xl border p-3", on ? "border-accent bg-accent/15" : "border-border bg-card")}>
                <span className={cx(display, "grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-base")}>{n}</span>
                <div className="min-w-0 text-sm leading-relaxed">
                  {r.tag && <Badge tone="primary" className="mb-1 text-accent">{TAG_LABEL[r.tag]}</Badge>}
                  <p>{r.body}</p>
                  {r.bullets.length > 0 && <ul className="mt-1 list-disc pl-5">{r.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
                </div>
              </div>); })}
          </section>
        ))}
      </div>
    </Modal>
  );
}

export function useRules(bundle: CompetitionBundle | null) {
  const [state, set] = useState<{ open: boolean; focus: string | null }>({ open: false, focus: null });
  const chips = useMemo(() => (bundle?.ruleSections ?? []).flatMap((s) => s.rules.filter((r) => r.highlight).map((r) => ({ id: r.id, label: r.chip_label || r.body.slice(0, 40) }))), [bundle]);
  return { ...state, chips, openAll: () => set({ open: true, focus: null }), openRule: (id: string) => set({ open: true, focus: id }), close: () => set({ open: false, focus: null }) };
}

export function rulesTagged(bundle: CompetitionBundle, tag: RuleTag): Rule[] {
  return bundle.ruleSections.flatMap((s) => s.rules.filter((r) => r.tag === tag));
}

/** Follow / Following toggle with a small pop when switched on. */
export function FollowButton({ entity, id, label = "Follow", size = "md", dark }: { entity: "competition" | "team" | "player"; id: string; label?: string; size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const f = useFollows();
  const [pop, setPop] = useState(false);
  const on = f.has(entity, id);
  return (
    <span className="inline-flex flex-col items-start">
      <Btn size={size} variant={on ? "accent" : dark ? "light" : "outline"} aria-pressed={on}
        className={cx(pop && on && "csq-pop")} onClick={async (e) => { e.stopPropagation(); setPop(true); await f.toggle(entity, id); }}>
        {on ? "★ Following" : "☆ " + label}
      </Btn>
      {f.msg && <span className="mt-1 text-xs text-destructive">{f.msg}</span>}
    </span>
  );
}

export function StatTile({ value, label }: { value: string | number; label: string }) {
  return <div><div className={cx(display, "text-4xl leading-none")}>{value}</div><div className="text-xs opacity-80">{label}</div></div>;
}
