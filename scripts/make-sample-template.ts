/**
 * Generates samples/sample-template.csv and samples/sample-template.xlsx
 *
 * Usage: npm run gen:sample
 *
 * The sample data uses real student names from the UTT registry so that
 * end-to-end smoke tests work after importing the registry.
 */
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface SampleRow {
  name: string;
  class: string;
  section: string;
  exam_type: string;
  english?: number;
  hindi?: number;
  math?: number;
  science?: number;
  social_science?: number;
  general_knowledge?: number;
}

const SAMPLE_ROWS: SampleRow[] = [
  // Outstanding (A+) — Ishaan
  {
    name: "Ishaan",
    class: "6th",
    section: "A",
    exam_type: "Half-Yearly",
    english: 92,
    hindi: 88,
    math: 95,
    science: 89,
    social_science: 90,
  },
  // Excellent (A) — Meenakshi
  {
    name: "Meenakshi",
    class: "Bachelor of Commerce",
    section: "A",
    exam_type: "Half-Yearly",
    english: 88,
    hindi: 79,
    math: 82,
    science: 76,
  },
  // Very Good (B+) — Rashi
  {
    name: "Rashi",
    class: "Bachelor of Commerce",
    section: "A",
    exam_type: "Half-Yearly",
    english: 78,
    hindi: 72,
    math: 71,
    science: 74,
  },
  // Good (B) — Kanak
  {
    name: "Kanak",
    class: "9th",
    section: "A",
    exam_type: "Half-Yearly",
    english: 65,
    hindi: 68,
    math: 60,
    science: 67,
    social_science: 64,
  },
  // Needs Improvement (D) — Kakul
  {
    name: "Kakul",
    class: "12th",
    section: "A",
    exam_type: "Half-Yearly",
    english: 38,
    hindi: 42,
    math: 41,
    science: 39,
    social_science: 45,
  },
];

const HEADER: (keyof SampleRow)[] = [
  "name",
  "class",
  "section",
  "exam_type",
  "english",
  "hindi",
  "math",
  "science",
  "social_science",
];

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const csvText = [
  HEADER.join(","),
  ...SAMPLE_ROWS.map((r) =>
    HEADER.map((h) => csvCell((r as unknown as Record<string, unknown>)[h])).join(","),
  ),
].join("\n");

const samplesDir = join(process.cwd(), "samples");
mkdirSync(samplesDir, { recursive: true });

const csvPath = join(samplesDir, "sample-template.csv");
writeFileSync(csvPath, csvText, "utf-8");

const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, {
  header: HEADER as string[],
});
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Marks");
const xlsxPath = join(samplesDir, "sample-template.xlsx");
XLSX.writeFile(wb, xlsxPath);

console.log(`Wrote: ${csvPath}`);
console.log(`Wrote: ${xlsxPath}`);
