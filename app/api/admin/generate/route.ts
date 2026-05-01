import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { computeTotals } from "@/lib/grading/totals";
import { pickRemark } from "@/lib/grading/remarks";
import {
  makeUniqueCertificateId,
  getAcademicYear,
  academicYearLabel,
} from "@/lib/certificate/id";
import { renderCertificateHtml } from "@/lib/certificate/renderHtml";
import { launchBrowser, renderPdf } from "@/lib/certificate/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const RowSchema = z.object({
  name: z.string().min(1),
  class: z.string().min(1),
  section: z.string().nullable().optional(),
  exam_type: z.string().min(1),
  enrollment: z.string().min(1),
  registry_class: z.string().optional(),
  registry_section: z.string().nullable().optional(),
  subjects: z
    .array(
      z.object({
        subject: z.string().min(1),
        mark: z.number().min(0).max(100),
      }),
    )
    .min(1),
});

const BodySchema = z.object({
  batch_id: z.string().uuid(),
  rows: z.array(RowSchema).min(1).max(15),
});

interface SuccessRecord {
  certificate_id: string;
  enrollment: string;
  name: string;
  pdf_url: string;
}
interface FailureRecord {
  enrollment: string;
  name: string;
  reason: string;
}

export async function POST(req: Request) {
  try {
    const env = getEnv();
    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }
    const { batch_id, rows } = parsed.data;

    const supabase = getAdminClient();

    let handle: Awaited<ReturnType<typeof launchBrowser>>;
    try {
      handle = await launchBrowser();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      const stack = e instanceof Error ? e.stack : undefined;
      console.error("[generate] launchBrowser failed:", msg, stack);
      return NextResponse.json(
        {
          error: `Browser launch failed: ${msg}`,
          stage: "launchBrowser",
          serverless: !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME,
        },
        { status: 500 },
      );
    }

    const generated: SuccessRecord[] = [];
    const failures: FailureRecord[] = [];

    try {
      for (const row of rows) {
      try {
        const totals = computeTotals(row.subjects);
        const cls = row.registry_class || row.class;
        const certId = await makeUniqueCertificateId(supabase, { cls });
        const remark = pickRemark(totals.overall_grade, certId);

        const html = renderCertificateHtml({
          studentName: row.name,
          className: cls,
          section: row.registry_section ?? row.section ?? null,
          enrollment: row.enrollment,
          examType: row.exam_type,
          academicYearLabel: academicYearLabel(getAcademicYear()),
          certificateId: certId,
          subjectGrades: totals.subject_grades,
          overallGrade: totals.overall_grade,
          remarkEn: remark.en,
          remarkHi: remark.hi,
        });

        const pdf = await renderPdf(handle.browser, html);

        const objectKey = `${batch_id}/${certId}.pdf`;
        const { error: upErr } = await supabase.storage
          .from(env.SUPABASE_STORAGE_BUCKET)
          .upload(objectKey, pdf, {
            contentType: "application/pdf",
            upsert: true,
          });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage
          .from(env.SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(objectKey);
        const pdfUrl = pub.publicUrl;

        const { error: insErr } = await supabase.from("results").insert({
          certificate_id: certId,
          name: row.name,
          enrollment: row.enrollment,
          class: cls,
          exam_type: row.exam_type,
          subjects_json: totals.subject_grades.map((sg, i) => ({
            subject: sg.subject,
            grade: sg.grade,
            mark: row.subjects[i]?.mark ?? null,
          })),
          total_marks: totals.total_marks,
          average: totals.average,
          overall_grade: totals.overall_grade,
          remarks_en: remark.en,
          remarks_hi: remark.hi,
          pdf_url: pdfUrl,
          batch_id,
        });
        if (insErr) {
          if (
            insErr.code === "23505" ||
            insErr.message.toLowerCase().includes("duplicate")
          ) {
            failures.push({
              enrollment: row.enrollment,
              name: row.name,
              reason:
                "Already generated for this enrollment + exam + class. Skipped.",
            });
            continue;
          }
          throw insErr;
        }

        generated.push({
          certificate_id: certId,
          enrollment: row.enrollment,
          name: row.name,
          pdf_url: pdfUrl,
        });
      } catch (e) {
        failures.push({
          enrollment: row.enrollment,
          name: row.name,
          reason: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }
    } finally {
      await handle.close().catch(() => undefined);
    }

    return NextResponse.json({ generated, failures });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("[generate] handler failed:", msg, stack);
    return NextResponse.json(
      { error: msg, stage: "handler", stack },
      { status: 500 },
    );
  }
}
