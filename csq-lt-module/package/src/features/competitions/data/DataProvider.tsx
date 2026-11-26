import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { CompetitionBundle, Viewer } from "../types";
import type { DataSource } from "./source";

const Ctx = createContext<{ source: DataSource; viewer: Viewer; refreshViewer: () => void } | null>(null);

/** Wrap the app (or just the competition routes) with the data source to use. */
export function CompetitionDataProvider({ source, children }: { source: DataSource; children: ReactNode }) {
  const [viewer, setViewer] = useState<Viewer>({ id: null, name: "Visitor", isAdmin: false });
  const refreshViewer = useCallback(() => { source.viewer().then(setViewer).catch(() => undefined); }, [source]);
  useEffect(refreshViewer, [refreshViewer]);
  return <Ctx.Provider value={{ source, viewer, refreshViewer }}>{children}</Ctx.Provider>;
}

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData must be inside CompetitionDataProvider");
  return c;
}

/** Loads anything async and gives back { data, loading, error, reload }. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true, error: null }));
    fn().then((data) => live && set({ data, loading: false, error: null })).catch((e) => live && set({ data: null, loading: false, error: String(e?.message ?? e) }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

export function useBundle(slug: string | undefined) {
  const { source, viewer } = useData();
  return useLoad<CompetitionBundle | null>(() => (slug ? source.bundle(slug) : Promise.resolve(null)), [slug, viewer.id]);
}

export function useFollows() {
  const { source, viewer } = useData();
  const [set, setSet] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { source.follows().then(setSet).catch(() => undefined); }, [source, viewer.id]);
  const toggle = async (entity: "competition" | "team" | "player", id: string) => {
    try {
      const on = await source.toggleFollow(entity, id);
      setSet((s) => { const n = new Set(s); const k = entity + ":" + id; if (on) n.add(k); else n.delete(k); return n; });
      setMsg(null);
    } catch (e) { setMsg(String((e as Error).message)); }
  };
  return { has: (entity: string, id: string) => set.has(entity + ":" + id), toggle, count: (entity: string) => [...set].filter((k) => k.startsWith(entity + ":")).length, msg };
}
