import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ResultRow {
  id: string;
  certificate_id: string;
  name: string;
  enrollment: string;
  class: string;
  exam_type: string;
  overall_grade: string;
  pdf_url: string | null;
  created_at: string;
}

export default async function BatchDetail({
  params,
}: {
  params: Promise<{ batch_id: string }>;
}) {
  const { batch_id } = await params;
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("results")
    .select(
      "id, certificate_id, name, enrollment, class, exam_type, overall_grade, pdf_url, created_at",
    )
    .eq("batch_id", batch_id)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error.message}
        </div>
      </main>
    );
  }
  if (!data || data.length === 0) notFound();

  const rows = data as ResultRow[];
  const created = new Date(rows[0].created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xs text-utt-green hover:underline"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-utt-green">
            Batch
          </h1>
          <div className="font-mono text-xs text-gray-500">{batch_id}</div>
          <p className="mt-1 text-sm text-gray-700">
            {rows.length} certificate{rows.length === 1 ? "" : "s"} &middot;{" "}
            {created}
          </p>
        </div>
        <a
          href={`/api/admin/batches/${batch_id}/zip`}
          className="rounded bg-utt-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-utt-green-deep"
        >
          Download all as ZIP
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded border border-utt-gold/20 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-utt-beige-deep/40 text-left text-xs uppercase tracking-wider text-utt-green">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Enrollment</th>
              <th className="px-3 py-2">Class</th>
              <th className="px-3 py-2">Exam</th>
              <th className="px-3 py-2">Overall</th>
              <th className="px-3 py-2">Certificate ID</th>
              <th className="px-3 py-2">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-utt-gold/15">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.enrollment}</td>
                <td className="px-3 py-2">{r.class}</td>
                <td className="px-3 py-2">{r.exam_type}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-utt-green/10 px-2 py-0.5 text-sm font-semibold text-utt-green">
                    {r.overall_grade}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {r.certificate_id}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-3 text-xs">
                    {r.pdf_url && (
                      <a
                        href={r.pdf_url}
                        target="_blank"
                        rel="noopener"
                        className="text-utt-green underline"
                      >
                        PDF
                      </a>
                    )}
                    <Link
                      href={`/verify/${r.certificate_id}`}
                      target="_blank"
                      className="text-utt-green underline"
                    >
                      Verify
                    </Link>
                    <Link
                      href={`/admin/results/${r.id}/edit`}
                      className="text-utt-gold underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
