import { NextResponse } from "next/server";
import archiver from "archiver";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

interface BatchRow {
  certificate_id: string;
  name: string;
  enrollment: string;
  pdf_url: string | null;
}

function safeFilename(s: string): string {
  return s.replace(/[^A-Za-z0-9_\- ]/g, "").trim() || "certificate";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ batch_id: string }> },
) {
  const { batch_id } = await params;
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("results")
    .select("certificate_id, name, enrollment, pdf_url")
    .eq("batch_id", batch_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Batch not found or empty" },
      { status: 404 },
    );
  }

  const rows = data as BatchRow[];
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  let appended = 0;
  for (const row of rows) {
    if (!row.pdf_url) continue;
    try {
      const r = await fetch(row.pdf_url);
      if (!r.ok) continue;
      const pdf = Buffer.from(await r.arrayBuffer());
      const filename = `${safeFilename(row.enrollment)}-${safeFilename(row.name)}.pdf`;
      archive.append(pdf, { name: filename });
      appended += 1;
    } catch {
      // Skip individual fetch failures; still produce a partial archive.
    }
  }
  await archive.finalize();
  await done;

  if (appended === 0) {
    return NextResponse.json(
      { error: "No PDFs available for this batch yet" },
      { status: 404 },
    );
  }

  const buf = Buffer.concat(chunks);
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="batch-${batch_id}.zip"`,
      "Content-Length": String(buf.length),
    },
  });
}
