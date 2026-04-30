import { z } from "zod";
import { RESERVED_KEYS } from "./normalize";

export const EXAM_TYPES = ["Half-Yearly", "Annual", "Unit Test"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

function normalizeExamType(s: string): ExamType | null {
  const t = s.trim().toLowerCase().replace(/[\s_\-]+/g, "");
  for (const v of EXAM_TYPES) {
    if (v.toLowerCase().replace(/[\s_\-]+/g, "") === t) return v;
  }
  return null;
}

export interface ValidatedMarksRow {
  name: string;
  class: string;
  section: string | null;
  exam_type: ExamType;
  subjects: { subject: string; mark: number }[];
}

export interface RowError {
  row: number;
  field?: string;
  reason: string;
}

const SUBJECT_PRETTY: Record<string, string> = {
  math: "Mathematics",
  maths: "Mathematics",
  mathematics: "Mathematics",
  english: "English",
  hindi: "Hindi",
  science: "Science",
  social_science: "Social Science",
  socialscience: "Social Science",
  social_studies: "Social Studies",
  socialstudies: "Social Studies",
  sst: "Social Studies",
  computer: "Computer",
  computers: "Computer",
  general_knowledge: "General Knowledge",
  gk: "General Knowledge",
  evs: "EVS",
  art: "Art",
  music: "Music",
  sanskrit: "Sanskrit",
  drawing: "Drawing",
};

export function prettifySubject(key: string): string {
  if (SUBJECT_PRETTY[key]) return SUBJECT_PRETTY[key];
  return key
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const baseSchema = z.object({
  name: z.string().min(1, "name is required").max(120),
  class: z.string().min(1, "class is required").max(40),
  section: z.string().max(20).nullable().optional(),
});

export function validateMarksRow(
  raw: Record<string, unknown>,
  rowNum: number,
): { row: ValidatedMarksRow | null; errors: RowError[] } {
  const errors: RowError[] = [];

  const examTypeRaw =
    typeof raw.exam_type === "string" ? raw.exam_type : "";
  const examType = normalizeExamType(examTypeRaw);
  if (!examType) {
    errors.push({
      row: rowNum,
      field: "exam_type",
      reason: `exam_type must be one of: ${EXAM_TYPES.join(", ")}`,
    });
  }

  const parsed = baseSchema.safeParse({
    name: raw.name ?? "",
    class: raw.class ?? "",
    section: raw.section ?? null,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        row: rowNum,
        field: issue.path.join(".") || undefined,
        reason: issue.message,
      });
    }
  }

  if (errors.length > 0 || !examType || !parsed.success) {
    return { row: null, errors };
  }

  const subjects: { subject: string; mark: number }[] = [];
  for (const [k, v] of Object.entries(raw)) {
    if (RESERVED_KEYS.has(k)) continue;
    if (v === "" || v === null || v === undefined) {
      subjects.push({ subject: prettifySubject(k), mark: 0 });
      continue;
    }
    const n = typeof v === "number" ? v : Number(String(v).trim());
    if (Number.isNaN(n)) {
      errors.push({
        row: rowNum,
        field: k,
        reason: `Subject '${k}' must be a number 0–100`,
      });
      continue;
    }
    if (n < 0 || n > 100) {
      errors.push({
        row: rowNum,
        field: k,
        reason: `Subject '${k}' is ${n}; expected 0–100`,
      });
      continue;
    }
    subjects.push({ subject: prettifySubject(k), mark: n });
  }

  if (subjects.length === 0) {
    errors.push({
      row: rowNum,
      reason: "No subject columns found",
    });
    return { row: null, errors };
  }

  return {
    row: {
      name: parsed.data.name,
      class: parsed.data.class,
      section: parsed.data.section ?? null,
      exam_type: examType,
      subjects,
    },
    errors,
  };
}
