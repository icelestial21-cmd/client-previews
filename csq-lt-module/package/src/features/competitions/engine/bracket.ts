import type { Row } from "./standings";

/** Round names from the outside of the bracket in. */
export function roundNames(size: number, thirdPlace: boolean): { key: string; name: string }[] {
  const out: { key: string; name: string }[] = [];
  for (let n = size; n >= 2; n /= 2) {
    if (n === 2) out.push({ key: "final", name: "Final" });
    else if (n === 4) out.push({ key: "sf", name: "Semifinals" });
    else if (n === 8) out.push({ key: "qf", name: "Quarterfinals" });
    else out.push({ key: "r" + n, name: "Round of " + n });
  }
  if (thirdPlace && size >= 4) out.splice(out.length - 1, 0, { key: "third", name: "Third-place match" });
  return out;
}

export interface Qualification {
  direct: Row[];                    // straight into the bracket
  playoff: { seat: number; a: Row; b: Row }[]; // seat playoff pairs, best v worst
  pool: Row[];                      // everyone in the playoff zone
  directCount: number;
  poolFrom: number;
  poolTo: number;
}

/**
 * Splits a table into direct qualifiers and a seat playoff.
 * Example: 32 seats, 4 by playoff -> places 1-28 direct, 29-36 play 29v36, 30v35...
 */
export function qualify(table: Row[], bracketSize: number, playoffSeats: number): Qualification {
  const seats = Math.max(0, Math.min(playoffSeats, bracketSize));
  const directCount = Math.min(bracketSize - seats, table.length);
  const poolSize = Math.max(0, Math.min(seats * 2, table.length - directCount));
  const pool = table.slice(directCount, directCount + poolSize);
  const playoff = [] as Qualification["playoff"];
  for (let k = 0; k < Math.floor(poolSize / 2); k++) {
    playoff.push({ seat: directCount + k + 1, a: pool[k], b: pool[poolSize - 1 - k] });
  }
  return { direct: table.slice(0, directCount), playoff, pool, directCount, poolFrom: directCount + 1, poolTo: directCount + poolSize };
}

/** Standard seeding order so 1 and 2 can only meet in the final. */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const n = order.length * 2;
    order = order.flatMap((s) => [s, n + 1 - s]);
  }
  return order;
}

// ---------------------------------------------------------------------------
// Circular bracket geometry (used by CircularBracket.tsx)
// ---------------------------------------------------------------------------
export interface Segment { d: string; child: { level: number; index: number } }
export interface Dot { x: number; y: number; level: number; index: number }
export interface Slot { x: number; y: number; index: number; angle: number }

export function circleGeometry(size: number, center = 400, outer = 330, inner = 64) {
  const levels = Math.round(Math.log2(size));
  const radii = [outer];
  for (let k = 1; k < levels; k++) radii.push(268 - ((k - 1) * (268 - 112)) / Math.max(1, levels - 2));
  radii.push(inner);
  const pt = (r: number, a: number) => {
    const t = (a * Math.PI) / 180;
    return [+(center + r * Math.sin(t)).toFixed(1), +(center - r * Math.cos(t)).toFixed(1)] as const;
  };
  const ang: number[][] = [[]];
  for (let i = 0; i < size; i++) ang[0].push(((i + 0.5) * 360) / size);
  for (let l = 1; l <= levels; l++) {
    ang[l] = [];
    for (let j = 0; j < size >> l; j++) ang[l].push((ang[l - 1][2 * j] + ang[l - 1][2 * j + 1]) / 2);
  }
  const arc = (r: number, a1: number, a2: number) => {
    const [x1, y1] = pt(r, a1), [x2, y2] = pt(r, a2);
    return `M${x1} ${y1} A${r} ${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2} ${y2}`;
  };
  const segments: Segment[] = [];
  const dots: Dot[] = [];
  for (let l = 1; l <= levels; l++) {
    for (let j = 0; j < size >> l; j++) {
      const pa = ang[l][j];
      for (const c of [2 * j, 2 * j + 1]) {
        const ca = ang[l - 1][c];
        const from = l === 1 ? outer - 24 : radii[l - 1];
        const [x1, y1] = pt(from, ca);
        if (l < levels) {
          const [x2, y2] = pt(radii[l], ca);
          segments.push({ d: `M${x1} ${y1} L${x2} ${y2} ${arc(radii[l], ca, pa)}`, child: { level: l - 1, index: c } });
        } else {
          const [x2, y2] = pt(inner, ca);
          segments.push({ d: `M${x1} ${y1} L${x2} ${y2}`, child: { level: l - 1, index: c } });
        }
      }
      if (l < levels) { const [x, y] = pt(radii[l], pa); dots.push({ x, y, level: l, index: j }); }
    }
  }
  const slots: Slot[] = ang[0].map((a, i) => { const [x, y] = pt(outer, a); return { x, y, index: i, angle: a }; });
  return { segments, dots, slots, levels };
}
