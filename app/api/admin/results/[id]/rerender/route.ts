import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { renderCertificateHtml } from "@/lib/certificate/renderHtml";
import { launchBrowser, renderPdf } from "@/lib/certificate/pdf";
import { academicYearLabel } from "@/lib/certificate/id";
import type { GradeBand } from "@/lib/grading/grade";

export const runtime = "nodejs";
export const maxDuration = 60;

const SubjectSchema = z.object({
  subject: z.string(),
  grade: z.string(),
  mark: z.number().nullable(),
});

const BodySchema = z.object({
  name: z.string().min(1),
  cls: z.string().min(1),
  subjects_json: z.array(SubjectSchema),
  remarks_en: z.string().min(1),
  remarks_hi: z.string().min(1),
  overall_grade: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { name, cls, subjects_json, remarks_en, remarks_hi, overall_grade } =
      parsed.data;

    const env = getEnv();
    const supabase = getAdminClient();

    const { data: result, error } = await supabase
      .from("results")
      .select("certificate_id, enrollment, exam_type, pdf_url")
      .eq("id", id)
      .single();

    if (error || !result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const yearMatch = (result.certificate_id as string).match(/^UTT-(\d{4})-/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    const html = renderCertificateHtml({
      studentName: name,
      className: cls,
      section: null,
      enrollment: result.enrollment as string,
      examType: result.exam_type as string,
      academicYearLabel: academicYearLabel(year),
      certificateId: result.certificate_id as string,
      subjectGrades: subjects_json.map((s) => ({
        subject: s.subject,
        grade: s.grade as GradeBand,
      })),
      overallGrade: overall_grade as GradeBand,
      remarkEn: remarks_en,
      remarkHi: remarks_hi,
    });

    const handle = await launchBrowser();
    let pdf: Buffer;
    try {
      pdf = await renderPdf(handle.browser, html);
    } finally {
      await handle.close().catch(() => undefined);
    }

    let objectKey: string;
    try {
      const urlObj = new URL(result.pdf_url as string);
      const prefix = `/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/`;
      objectKey = urlObj.pathname.startsWith(prefix)
        ? urlObj.pathname.slice(prefix.length)
        : `rerendered/${result.certificate_id}.pdf`;
    } catch {
      objectKey = `rerendered/${result.certificate_id}.pdf`;
    }

    const { error: upErr } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(objectKey, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    const { error: updErr } = await supabase
      .from("results")
      .update({ name, class: cls, subjects_json, remarks_en, remarks_hi, overall_grade })
      .eq("id", id);
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
