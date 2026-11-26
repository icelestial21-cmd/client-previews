// Small UI kit built on the site's Tailwind theme tokens (primary = CSQ teal,
// accent = CSQ amber, destructive = CSQ red), so it matches the live site.
import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const display = "font-['Bebas_Neue',sans-serif] tracking-wide font-normal";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "light";
export function Btn({ variant = "primary", size = "md", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const v: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    accent: "bg-accent text-primary hover:bg-accent/90",
    outline: "border border-border bg-card text-primary hover:bg-muted",
    ghost: "text-primary hover:bg-muted",
    danger: "bg-destructive text-white hover:bg-destructive/90",
    light: "border-2 border-white/80 text-white hover:bg-white/10",
  };
  const s = { sm: "min-h-9 px-3 text-sm", md: "min-h-11 px-4 text-sm", lg: "min-h-12 px-6 text-base" }[size];
  return <button {...p} className={cx("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent", v[variant], s, className)} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-2xl border border-border bg-card", className)}>{children}</div>;
}

export function Badge({ tone = "muted", children, className }: { tone?: "muted" | "accent" | "primary" | "danger" | "success"; children: ReactNode; className?: string }) {
  const t = { muted: "bg-muted text-primary", accent: "bg-accent text-primary", primary: "bg-primary text-primary-foreground", danger: "bg-destructive text-white", success: "bg-emerald-600 text-white" }[tone];
  return <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", t, className)}>{children}</span>;
}

/** Segmented control used for divisions, layouts and filters. */
export function Segmented<T extends string>({ value, options, onChange, label, dark }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; dark?: boolean }) {
  return (
    <div role="group" aria-label={label} className={cx("inline-flex flex-wrap gap-1 rounded-xl p-1", dark ? "bg-white/10" : "bg-muted")}>
      {options.map((o) => {
        const on = o.value === value;
        return <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)}
          className={cx("min-h-10 rounded-lg px-4 text-sm transition", on ? (dark ? "bg-accent font-bold text-primary" : "bg-primary font-semibold text-primary-foreground") : (dark ? "text-white" : "text-primary hover:bg-card"))}>{o.label}</button>;
      })}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
const inputCls = "w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, p.className)} />;
export const TextArea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx(inputCls, "min-h-24 py-2", p.className)} />;

/** Accessible modal: Esc and backdrop close it, focus moves in and back. */
export function Modal({ open, onClose, title, kicker, children, wide }: { open: boolean; onClose: () => void; title: string; kicker?: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const ov = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ov; prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(7,28,37,.75)] p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={cx("flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-2xl bg-card text-primary shadow-2xl", wide ? "max-w-5xl" : "max-w-3xl")}>
        <div className="csq-pips flex shrink-0 items-center justify-between gap-3 bg-primary px-5 py-4 text-primary-foreground">
          <div>
            {kicker && <div className="text-[11px] font-bold uppercase tracking-[.12em] text-accent">{kicker}</div>}
            <h2 className={cx(display, "text-3xl leading-none")}>{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-white text-lg font-bold">✕</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</div>;
}

export function Spinner() { return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>; }

export const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
export const fmtDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("en-JM", { timeZone: "America/Jamaica", ...opts }) : "Date to be announced";
export const fmtTime = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("en-JM", { timeZone: "America/Jamaica", hour: "numeric", minute: "2-digit" }) : "");
