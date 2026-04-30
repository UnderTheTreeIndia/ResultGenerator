import { NextResponse } from "next/server";
import { createServerAnonClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from("results")
    .select("pdf_url")
    .eq("certificate_id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.pdf_url) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 },
    );
  }
  return NextResponse.redirect(data.pdf_url, 302);
}
