export const RESERVED_KEYS = new Set(["name", "class", "section", "exam_type"]);

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^\w]/g, "");
}

export function normalizeRow(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    const nk = normalizeHeader(k);
    if (!nk) continue;
    out[nk] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

export function classKey(cls: string): string {
  return cls.toLowerCase().replace(/\s+/g, "");
}

export function nameKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

export function dedupeRows<
  T extends { name: string; class: string; section?: string | null },
>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const r of rows) {
    const key = `${nameKey(r.name)}|${classKey(r.class)}|${r.section ?? ""}`;
    map.set(key, r);
  }
  return [...map.values()];
}
