import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { renderCertificateHtml } from "@/lib/certificate/renderHtml";
import { academicYearLabel } from "@/lib/certificate/id";
import type { GradeBand } from "@/lib/grading/grade";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const yearMatch = (data.certificate_id as string).match(/^UTT-(\d{4})-/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  const subjects = (
    data.subjects_json as { subject: string; grade: string }[]
  ) ?? [];

  const html = renderCertificateHtml({
    studentName: data.name as string,
    className: data.class as string,
    section: null,
    enrollment: data.enrollment as string,
    examType: data.exam_type as string,
    academicYearLabel: academicYearLabel(year),
    certificateId: data.certificate_id as string,
    subjectGrades: subjects.map((s) => ({
      subject: s.subject,
      grade: s.grade as GradeBand,
    })),
    overallGrade: (url.searchParams.get("overall_grade") ??
      data.overall_grade) as GradeBand,
    remarkEn: url.searchParams.get("remarks_en") ?? (data.remarks_en as string),
    remarkHi: url.searchParams.get("remarks_hi") ?? (data.remarks_hi as string),
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
