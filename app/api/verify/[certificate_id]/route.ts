import { NextResponse } from "next/server";
import { createServerAnonClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface SubjectGradePublic {
  subject: string;
  grade: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certificate_id: string }> },
) {
  const { certificate_id } = await params;
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from("results")
    .select(
      "certificate_id, name, enrollment, class, exam_type, overall_grade, remarks_en, remarks_hi, subjects_json, pdf_url, created_at",
    )
    .eq("certificate_id", certificate_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip marks before responding — public verify must never expose marks.
  const subjectGrades: SubjectGradePublic[] = (
    Array.isArray(data.subjects_json) ? data.subjects_json : []
  ).map((s: { subject: string; grade: string }) => ({
    subject: s.subject,
    grade: s.grade,
  }));

  return NextResponse.json({
    certificate_id: data.certificate_id,
    name: data.name,
    enrollment: data.enrollment,
    class: data.class,
    exam_type: data.exam_type,
    overall_grade: data.overall_grade,
    subject_grades: subjectGrades,
    remarks_en: data.remarks_en,
    remarks_hi: data.remarks_hi,
    pdf_url: data.pdf_url,
    issued_at: data.created_at,
  });
}
