import "server-only";
import Papa from "papaparse";

export interface ParsedStudent {
  enrollment: string;
  name: string;
  class: string;
  admission_number: string | null;
  section: string | null;
  roll_number: string | null;
  gender: string | null;
  status: number | null;
  raw_json: Record<string, unknown>;
}

export interface ParseResult {
  rows: ParsedStudent[];
  errors: { row: number; reason: string }[];
}

const ENTITY_MAP: Record<string, string> = {
  "&#039;": "'",
  "&apos;": "'",
  "&quot;": '"',
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  if (!s) return s;
  return s.replace(
    /&#039;|&apos;|&quot;|&amp;|&lt;|&gt;|&nbsp;/g,
    (m) => ENTITY_MAP[m] ?? m,
  );
}

function clean(v: unknown): string {
  if (v === null || v === undefined) return "";
  return decodeEntities(String(v).trim());
}

export function parseStudentRegistryCsv(text: string): ParseResult {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => decodeEntities(h.trim()),
  });

  const rows: ParsedStudent[] = [];
  const errors: { row: number; reason: string }[] = [];

  parsed.data.forEach((raw, idx) => {
    const rowNum = idx + 2; // CSV row 1 is the header
    const enrollment = clean(raw["Enrollment Number"]);
    const name = clean(raw["Student Name"]);
    const cls = clean(raw["Class"]);

    if (!enrollment) {
      errors.push({ row: rowNum, reason: "Missing Enrollment Number" });
      return;
    }
    if (!name) {
      errors.push({ row: rowNum, reason: "Missing Student Name" });
      return;
    }
    if (!cls) {
      errors.push({ row: rowNum, reason: "Missing Class" });
      return;
    }

    const decoded: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      decoded[k] = typeof v === "string" ? decodeEntities(v) : v;
    }

    const statusRaw = clean(raw["Status"]);
    const statusNum = statusRaw ? Number(statusRaw) : 1;

    rows.push({
      enrollment,
      name,
      class: cls,
      admission_number: clean(raw["Admission Number"]) || null,
      section: clean(raw["Section"]) || null,
      roll_number: clean(raw["Roll Number"]) || null,
      gender: clean(raw["Gender"]) || null,
      status: Number.isFinite(statusNum) ? statusNum : 1,
      raw_json: decoded,
    });
  });

  // De-duplicate by enrollment, keeping the latest occurrence in the file.
  const dedup = new Map<string, ParsedStudent>();
  for (const r of rows) dedup.set(r.enrollment, r);
  return { rows: [...dedup.values()], errors };
}
