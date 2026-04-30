import { NextResponse } from "next/server";
import { parseCsvText } from "@/lib/parse/csv";
import { parseExcelBuffer } from "@/lib/parse/excel";
import {
  validateMarksRow,
  type RowError,
  type ValidatedMarksRow,
} from "@/lib/parse/validate";
import { dedupeRows } from "@/lib/parse/normalize";
import { lookupEnrollments } from "@/lib/parse/lookupEnrollment";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export interface ResolvedRow extends ValidatedMarksRow {
  enrollment: string;
  registry_class: string;
  registry_section: string | null;
  roll_number: string | null;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'file' field" },
      { status: 400 },
    );
  }

  const filename = file.name.toLowerCase();
  let raw: Record<string, unknown>[];
  try {
    if (filename.endsWith(".csv") || file.type === "text/csv") {
      raw = parseCsvText(await file.text());
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      raw = parseExcelBuffer(await file.arrayBuffer());
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .csv or .xlsx." },
        { status: 400 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      {
        error: `Parse failed: ${
          e instanceof Error ? e.message : "unknown error"
        }`,
      },
      { status: 400 },
    );
  }

  const validRows: ValidatedMarksRow[] = [];
  const errors: RowError[] = [];
  raw.forEach((r, idx) => {
    const { row, errors: e } = validateMarksRow(r, idx + 2);
    errors.push(...e);
    if (row) validRows.push(row);
  });

  const deduped = dedupeRows(validRows);
  if (deduped.length === 0) {
    return NextResponse.json({ rows: [], errors });
  }

  const supabase = getAdminClient();
  let lookups;
  try {
    lookups = await lookupEnrollments(supabase, deduped);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Registry lookup failed" },
      { status: 500 },
    );
  }

  const finalRows: ResolvedRow[] = [];
  for (const l of lookups) {
    if (!l.match) {
      errors.push({
        row: 0,
        reason: l.reason ?? `Lookup failed for ${l.row.name}`,
      });
      continue;
    }
    finalRows.push({
      ...l.row,
      enrollment: l.match.enrollment,
      registry_class: l.match.registry_class,
      registry_section: l.match.section,
      roll_number: l.match.roll_number,
    });
  }

  return NextResponse.json({ rows: finalRows, errors });
}
