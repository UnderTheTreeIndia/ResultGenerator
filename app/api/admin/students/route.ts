import { NextResponse } from "next/server";
import { parseStudentRegistryCsv } from "@/lib/parse/students";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors } = parseStudentRegistryCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      { imported: 0, errors, message: "No valid rows in file" },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();
  const CHUNK = 500;
  let imported = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("students")
      .upsert(chunk, { onConflict: "enrollment" });
    if (error) {
      return NextResponse.json(
        {
          imported,
          errors: [...errors, { row: 0, reason: error.message }],
        },
        { status: 500 },
      );
    }
    imported += chunk.length;
  }

  return NextResponse.json({ imported, errors });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const cls = (url.searchParams.get("class") || "").trim();

  const supabase = getAdminClient();
  let query = supabase
    .from("students")
    .select("id, enrollment, name, class, section, roll_number")
    .order("class", { ascending: true })
    .order("name", { ascending: true })
    .limit(500);
  if (q) query = query.ilike("name", `%${q}%`);
  if (cls) query = query.eq("class", cls);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ students: data ?? [], count: count ?? data?.length ?? 0 });
}
