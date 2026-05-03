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

  // Query param overrides
  const qName = url.searchParams.get("name");
  const qCls = url.searchParams.get("cls");
  const qSubjects = url.searchParams.get("subjects");
  const qOverallGrade = url.searchParams.get("overall_grade");
  const qRemarksEn = url.searchParams.get("remarks_en");
  const qRemarksHi = url.searchParams.get("remarks_hi");

  const dbSubjects = (
    data.subjects_json as { subject: string; grade: string }[]
  ) ?? [];

  let subjectGrades: { subject: string; grade: GradeBand }[];
  if (qSubjects) {
    try {
      subjectGrades = (JSON.parse(qSubjects) as { subject: string; grade: string }[]).map(
        (s) => ({ subject: s.subject, grade: s.grade as GradeBand }),
      );
    } catch {
      subjectGrades = dbSubjects.map((s) => ({
        subject: s.subject,
        grade: s.grade as GradeBand,
      }));
    }
  } else {
    subjectGrades = dbSubjects.map((s) => ({
      subject: s.subject,
      grade: s.grade as GradeBand,
    }));
  }

  const html = renderCertificateHtml({
    studentName: qName ?? (data.name as string),
    className: qCls ?? (data.class as string),
    section: null,
    enrollment: data.enrollment as string,
    examType: data.exam_type as string,
    academicYearLabel: academicYearLabel(year),
    certificateId: data.certificate_id as string,
    subjectGrades,
    overallGrade: (qOverallGrade ?? data.overall_grade) as GradeBand,
    remarkEn: qRemarksEn ?? (data.remarks_en as string),
    remarkHi: qRemarksHi ?? (data.remarks_hi as string),
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
