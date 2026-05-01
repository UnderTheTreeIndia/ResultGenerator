import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerAnonClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SubjectGrade {
  subject: string;
  grade: string;
}

interface ResultRecord {
  certificate_id: string;
  name: string;
  enrollment: string;
  class: string;
  exam_type: string;
  overall_grade: string;
  remarks_en: string;
  remarks_hi: string;
  subjects_json: SubjectGrade[];
  pdf_url: string | null;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificate_id: string }>;
}) {
  const { certificate_id } = await params;
  return { title: `Verify ${certificate_id} — Under The Tree` };
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certificate_id: string }>;
}) {
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
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Error loading record: {error.message}
        </div>
      </main>
    );
  }
  if (!data) notFound();

  const r = data as ResultRecord;
  const subjectGrades = Array.isArray(r.subjects_json)
    ? r.subjects_json.map((s) => ({ subject: s.subject, grade: s.grade }))
    : [];
  const issued = new Date(r.created_at).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="UTT"
          className="h-12 w-12 object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
        <div>
          <div className="font-serif text-xl font-semibold text-utt-green">
            Under The Tree
          </div>
          <div className="text-xs italic text-gray-500">
            Result Cum Certificate · Verification
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-utt-gold/30 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-utt-green">
              Verified
            </div>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-gray-900">
              {r.name}
            </h1>
            <div className="mt-1 text-sm text-gray-600">
              Class {r.class} &middot; Enrollment{" "}
              <span className="font-mono text-xs">{r.enrollment}</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {r.exam_type} &middot; issued {issued}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-400">
              Overall
            </div>
            <div className="mt-1 text-4xl font-bold text-utt-green">
              {r.overall_grade}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded border border-utt-gold/20">
          <table className="w-full text-sm">
            <thead className="bg-utt-beige-deep/40 text-left text-xs uppercase tracking-wider text-utt-green">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utt-gold/15">
              {subjectGrades.map((sg) => (
                <tr key={sg.subject}>
                  <td className="px-3 py-2">{sg.subject}</td>
                  <td className="px-3 py-2 text-right font-semibold text-utt-green">
                    {sg.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded border border-utt-gold/20 bg-utt-beige/50 p-4 text-sm leading-relaxed">
          <div className="text-xs uppercase tracking-widest text-utt-green">
            Remarks
          </div>
          <p className="mt-2 italic">{r.remarks_en}</p>
          <p className="mt-2" lang="hi">
            {r.remarks_hi}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              Certificate ID
            </div>
            <div className="font-mono text-sm">{r.certificate_id}</div>
          </div>
          {r.pdf_url && (
            <a
              href={r.pdf_url}
              target="_blank"
              rel="noopener"
              className="rounded bg-utt-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-utt-green-deep"
            >
              View Certificate PDF
            </a>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        This page confirms the authenticity of the certificate above.
        Issued by Under The Tree.
      </p>
      <p className="mt-1 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-utt-green">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
