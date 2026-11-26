import { useMemo, useRef, useState, type PointerEvent } from "react";
import { circleGeometry, roundNames } from "../engine/bracket";
import { Btn, cx, display } from "../ui/kit";

export interface BracketSlotInfo { label: string; title: string; subtitle?: string }

/**
 * Circular, rotatable knockout bracket. Works for any bracket size (4–128).
 * Drag to spin, tap a slot to light its path to the trophy.
 */
export function CircularBracket({ size, slots, finalLabel, dates, thirdPlace }: {
  size: number;
  slots: BracketSlotInfo[];                 // one per slot, outside of the circle
  finalLabel: string;                       // e.g. "Final · Dec 23"
  dates: Record<string, string>;            // round key -> date text
  thirdPlace: boolean;
}) {
  const geo = useMemo(() => circleGeometry(size), [size]);
  const rounds = useMemo(() => roundNames(size, thirdPlace), [size, thirdPlace]);
  const [rot, setRot] = useState(0);
  const [sel, setSel] = useState<number | "final" | null>(null);
  const spinRef = useRef<SVGGElement>(null);
  const drag = useRef<{ cx: number; cy: number; a0: number; r0: number; moved: boolean } | null>(null);
  const live = useRef(0);

  const apply = (r: number) => {
    live.current = r;
    const g = spinRef.current; if (!g) return;
    g.style.transform = `rotate(${r}deg)`;
    g.querySelectorAll<SVGTextElement>(".csq-lbl").forEach((t) => (t.style.transform = `rotate(${-r}deg)`));
  };
  const commit = (r: number) => { live.current = r; setRot(r); };
  const onPath = (level: number, index: number) => sel === "final" || (typeof sel === "number" && index === sel >> level);

  const down = (e: PointerEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    drag.current = { cx, cy, a0: (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI, r0: live.current, moved: false };
    spinRef.current?.classList.add("is-dragging");
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current; if (!d) return;
    const delta = (Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180) / Math.PI - d.a0;
    if (!d.moved && Math.abs(delta) > 2) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); }
    if (d.moved) apply(d.r0 + delta);
  };
  const up = () => { const d = drag.current; drag.current = null; spinRef.current?.classList.remove("is-dragging"); if (d?.moved) commit(live.current); };

  const HI = "hsl(var(--accent))", LO = "#4f8aa3";
  const info = sel === null
    ? { kicker: "How it works", title: "Tap a slot", body: "Drag the wheel to spin it. Tap a slot to light up its path to the final, or tap the trophy." }
    : sel === "final"
      ? { kicker: dates.final ?? "", title: "The final", body: "The two semifinal winners meet for the title." + (thirdPlace ? " The beaten semifinalists play for third." : "") }
      : { kicker: "Slot " + (sel + 1), title: slots[sel]?.title ?? "To be decided", body: (slots[sel]?.subtitle ?? "") + ` Plays slot ${sel % 2 ? sel : sel + 2} in the ${rounds[0]?.name ?? "first round"}.` };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="w-full max-w-[720px] min-w-0 flex-[1_1_520px]">
        <svg viewBox="0 0 800 800" role="img" aria-label={`Circular knockout bracket, ${size} slots`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          className="block h-auto w-full cursor-grab touch-none select-none">
          <circle cx="400" cy="400" r="392" fill="hsl(var(--primary))" stroke="#25607a" strokeWidth="2" />
          <circle cx="400" cy="400" r="330" fill="none" stroke="#1d5a72" strokeDasharray="2 6" />
          <g ref={spinRef} className="csq-spin" style={{ transform: `rotate(${rot}deg)` }}>
            {geo.segments.map((s, i) => { const hot = onPath(s.child.level, s.child.index); return <path key={i} d={s.d} fill="none" stroke={hot ? HI : LO} strokeWidth={hot ? 5 : 2.5} strokeLinecap="round" />; })}
            {geo.dots.map((d, i) => { const hot = onPath(d.level, d.index); return <circle key={i} cx={d.x} cy={d.y} r={hot ? 6 : 4} fill={hot ? HI : "#9cc3d2"} />; })}
            {geo.slots.map((s) => { const hot = sel === "final" || sel === s.index; const r = size > 32 ? 15 : 22; return (
              <g key={s.index} className="csq-slot cursor-pointer" onClick={() => { setSel(s.index); setRot(live.current); }}>
                <circle cx={s.x} cy={s.y} r={r} fill={hot ? HI : "#fff"} stroke={hot ? "#fff" : HI} strokeWidth={3} />
                <text className="csq-lbl" x={s.x} y={s.y} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--primary))" style={{ font: `700 ${size > 32 ? 9 : 12}px Inter, sans-serif`, transform: `rotate(${-rot}deg)` }}>{slots[s.index]?.label ?? s.index + 1}</text>
              </g>); })}
          </g>
          <g className="cursor-pointer" onClick={() => setSel("final")}>
            <circle className="csq-hub" cx="400" cy="400" r="70" fill="#0e3546" stroke={HI} strokeWidth="3" />
            <path d="M383 372h34v14a17 17 0 0 1-34 0zM383 376h-9a9 9 0 0 0 9 12M417 376h9a9 9 0 0 1-9 12M400 403v10M389 418h22" fill="none" stroke={HI} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <text x="400" y="434" textAnchor="middle" fill="#fff" style={{ font: "400 14px 'Bebas Neue', sans-serif", letterSpacing: ".06em" }}>FINAL</text>
            <text x="400" y="449" textAnchor="middle" fill="#b9cfd8" style={{ font: "600 10px Inter, sans-serif" }}>{finalLabel}</text>
          </g>
        </svg>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Btn variant="light" size="sm" aria-label="Rotate left" onClick={() => commit(live.current - 45)}>↺</Btn>
          <Btn variant="light" size="sm" onClick={() => { commit(0); setSel(null); }}>Reset</Btn>
          <Btn variant="light" size="sm" aria-label="Rotate right" onClick={() => commit(live.current + 45)}>↻</Btn>
          <Btn variant="danger" size="sm" onClick={() => { const t = Math.floor(Math.random() * size); commit(live.current + 720 - ((geo.slots[t].angle + live.current) % 360)); setSel(t); }}>Spin the wheel</Btn>
        </div>
      </div>
      <aside className="flex w-full max-w-sm min-w-0 flex-[1_1_280px] flex-col gap-3">
        <div className="rounded-2xl bg-card p-5 text-primary shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-destructive">{info.kicker}</div>
          <div className={cx(display, "mt-1 text-4xl leading-none")}>{info.title}</div>
          <p className="mt-2 text-sm text-muted-foreground">{info.body}</p>
          {typeof sel === "number" && (
            <ol className="mt-3 flex flex-col gap-1.5">
              {rounds.filter((r) => r.key !== "third").map((r) => <li key={r.key} className="flex justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs"><strong>{r.name}</strong><span className="text-muted-foreground">{dates[r.key] ?? "Date to be announced"}</span></li>)}
            </ol>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rounds.map((r) => <div key={r.key} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"><div className={cx(display, "text-lg")}>{r.name}</div><div className="text-xs text-white/70">{dates[r.key] ?? "Date to be announced"}</div></div>)}
        </div>
      </aside>
    </div>
  );
}
