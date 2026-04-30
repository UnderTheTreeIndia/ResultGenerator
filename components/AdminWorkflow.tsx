"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";

interface Subject {
  subject: string;
  mark: number;
}

interface ResolvedRow {
  name: string;
  class: string;
  section: string | null;
  exam_type: string;
  enrollment: string;
  registry_class?: string;
  registry_section?: string | null;
  roll_number?: string | null;
  subjects: Subject[];
}

interface RowError {
  row: number;
  field?: string;
  reason: string;
}

interface GeneratedRecord {
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

const BATCH_SIZE = 15;

type Step = "upload" | "preview" | "generating" | "done";

function gradeOf(mark: number): string {
  if (mark >= 90) return "A+";
  if (mark >= 80) return "A";
  if (mark >= 70) return "B+";
  if (mark >= 60) return "B";
  if (mark >= 50) return "C";
  if (mark >= 33) return "D";
  return "F";
}

function avgGrade(subjects: Subject[]): string {
  if (subjects.length === 0) return "F";
  const avg = subjects.reduce((a, s) => a + s.mark, 0) / subjects.length;
  return gradeOf(avg);
}

export function AdminWorkflow() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadErrors, setUploadErrors] = useState<RowError[]>([]);
  const [rows, setRows] = useState<ResolvedRow[]>([]);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [generated, setGenerated] = useState<GeneratedRecord[]>([]);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const includedRows = useMemo(
    () => rows.filter((_, i) => included[i]),
    [rows, included],
  );

  const upload = useCallback(async (file: File) => {
    setBusy(true);
    setErr(null);
    setUploadErrors([]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = (await r.json().catch(() => ({}))) as {
        rows?: ResolvedRow[];
        errors?: RowError[];
        error?: string;
      };
      if (!r.ok) {
        setErr(j.error || `Upload failed (${r.status})`);
        return;
      }
      const fetched = j.rows ?? [];
      setRows(fetched);
      setIncluded(fetched.map(() => true));
      setUploadErrors(j.errors ?? []);
      setStep(fetched.length > 0 ? "preview" : "upload");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  const editMark = useCallback(
    (rowIdx: number, subjectIdx: number, value: string) => {
      const n = Number(value);
      if (Number.isNaN(n)) return;
      const clamped = Math.max(0, Math.min(100, n));
      setRows((prev) => {
        const next = prev.slice();
        const row = { ...next[rowIdx] };
        row.subjects = row.subjects.slice();
        row.subjects[subjectIdx] = {
          ...row.subjects[subjectIdx],
          mark: clamped,
        };
        next[rowIdx] = row;
        return next;
      });
    },
    [],
  );

  const toggleIncluded = useCallback((idx: number) => {
    setIncluded((prev) => {
      const next = prev.slice();
      next[idx] = !next[idx];
      return next;
    });
  }, []);

  const startGenerate = useCallback(async () => {
    if (includedRows.length === 0) return;
    const id = crypto.randomUUID();
    setBatchId(id);
    setStep("generating");
    setProgress({ done: 0, total: includedRows.length });
    setGenerated([]);
    setFailures([]);
    setErr(null);

    const allGenerated: GeneratedRecord[] = [];
    const allFailures: FailureRecord[] = [];
    for (let i = 0; i < includedRows.length; i += BATCH_SIZE) {
      const chunk = includedRows.slice(i, i + BATCH_SIZE);
      try {
        const r = await fetch("/api/admin/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ batch_id: id, rows: chunk }),
        });
        const j = (await r.json().catch(() => ({}))) as {
          generated?: GeneratedRecord[];
          failures?: FailureRecord[];
          error?: string;
        };
        if (!r.ok) {
          for (const row of chunk) {
            allFailures.push({
              enrollment: row.enrollment,
              name: row.name,
              reason: j.error ?? `Server error (${r.status})`,
            });
          }
        } else {
          allGenerated.push(...(j.generated ?? []));
          allFailures.push(...(j.failures ?? []));
        }
      } catch (e) {
        for (const row of chunk) {
          allFailures.push({
            enrollment: row.enrollment,
            name: row.name,
            reason: e instanceof Error ? e.message : "Network error",
          });
        }
      }
      setGenerated([...allGenerated]);
      setFailures([...allFailures]);
      setProgress({
        done: Math.min(i + chunk.length, includedRows.length),
        total: includedRows.length,
      });
    }
    setStep("done");
  }, [includedRows]);

  const reset = useCallback(() => {
    setStep("upload");
    setRows([]);
    setIncluded([]);
    setUploadErrors([]);
    setGenerated([]);
    setFailures([]);
    setBatchId(null);
    setErr(null);
    setProgress({ done: 0, total: 0 });
  }, []);

  return (
    <section className="mt-8 rounded border border-utt-gold/30 bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-utt-green">
        Generate Certificates
      </h2>

      {step === "upload" && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Upload a marks template (CSV or XLSX). Each row is matched against
            the student registry to resolve enrollment.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Need a template? Run <code>npm run gen:sample</code> locally — it
            writes <code>samples/sample-template.csv</code> and{" "}
            <code>samples/sample-template.xlsx</code>.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
              className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-utt-green file:px-3 file:py-2 file:text-white file:shadow-sm hover:file:bg-utt-green-deep"
            />
            {busy && <span className="text-sm text-gray-500">Parsing…</span>}
          </div>
          {err && (
            <div className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {uploadErrors.length > 0 && (
            <div className="mt-3 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
              <div className="font-medium">
                {uploadErrors.length} row(s) had issues:
              </div>
              <ul className="mt-1 list-inside list-disc text-xs">
                {uploadErrors.slice(0, 12).map((e, i) => (
                  <li key={i}>
                    {e.row > 0 ? `Row ${e.row}: ` : ""}
                    {e.field ? `[${e.field}] ` : ""}
                    {e.reason}
                  </li>
                ))}
                {uploadErrors.length > 12 && (
                  <li>…and {uploadErrors.length - 12} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-700">
                <strong>{rows.length}</strong> row(s) parsed.{" "}
                <strong>{includedRows.length}</strong> selected for generation.
              </p>
              {uploadErrors.length > 0 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-yellow-800">
                    {uploadErrors.length} row(s) skipped during parse
                  </summary>
                  <ul className="mt-1 list-inside list-disc text-xs text-yellow-900">
                    {uploadErrors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        {e.row > 0 ? `Row ${e.row}: ` : ""}
                        {e.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startGenerate}
                disabled={includedRows.length === 0}
                className="rounded bg-utt-green px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-utt-green-deep disabled:opacity-50"
              >
                Generate {includedRows.length} certificate
                {includedRows.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded border border-utt-gold/20">
            <table className="w-full text-sm">
              <thead className="bg-utt-beige-deep/40 text-left text-xs uppercase tracking-wider text-utt-green">
                <tr>
                  <th className="px-2 py-2"></th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Enrollment</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Sec</th>
                  <th className="px-3 py-2">Exam</th>
                  <th className="px-3 py-2">Subjects (marks)</th>
                  <th className="px-3 py-2">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-utt-gold/15">
                {rows.map((row, i) => (
                  <tr
                    key={`${row.enrollment}-${i}`}
                    className={included[i] ? "" : "opacity-40"}
                  >
                    <td className="px-2 py-2 align-top">
                      <input
                        type="checkbox"
                        checked={!!included[i]}
                        onChange={() => toggleIncluded(i)}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">{row.name}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs">
                      {row.enrollment}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.registry_class ?? row.class}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.registry_section ?? row.section ?? "—"}
                    </td>
                    <td className="px-3 py-2 align-top">{row.exam_type}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {row.subjects.map((s, j) => (
                          <label
                            key={s.subject}
                            className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-xs"
                          >
                            <span className="text-gray-700">{s.subject}</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={s.mark}
                              onChange={(e) =>
                                editMark(i, j, e.target.value)
                              }
                              className="w-12 rounded border border-gray-200 px-1 py-0.5 text-right outline-none focus:border-utt-green"
                            />
                            <span className="text-utt-green font-semibold">
                              {gradeOf(s.mark)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="rounded bg-utt-green/10 px-2 py-0.5 text-sm font-semibold text-utt-green">
                        {avgGrade(row.subjects)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="mt-4">
          <div className="text-sm text-gray-700">
            Generating certificates… {progress.done} of {progress.total}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-utt-green transition-all"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
          {failures.length > 0 && (
            <div className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-800">
              {failures.length} failure(s) so far. Will summarise on completion.
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="mt-4">
          <div className="rounded bg-green-50 px-4 py-3 text-sm text-green-900">
            <div className="font-semibold">
              Generated {generated.length} certificate
              {generated.length === 1 ? "" : "s"}
              {failures.length > 0 ? ` (${failures.length} failed)` : ""}.
            </div>
            {batchId && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href={`/admin/batches/${batchId}`}
                  className="text-utt-green underline"
                >
                  View batch &rarr;
                </Link>
                <a
                  href={`/api/admin/batches/${batchId}/zip`}
                  className="text-utt-green underline"
                >
                  Download ZIP
                </a>
                <button
                  onClick={reset}
                  className="ml-auto rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
                >
                  Start another
                </button>
              </div>
            )}
          </div>

          {failures.length > 0 && (
            <details className="mt-4 rounded border border-red-200 bg-red-50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-red-900">
                {failures.length} failure(s)
              </summary>
              <ul className="mt-2 list-inside list-disc text-xs text-red-900">
                {failures.map((f, i) => (
                  <li key={i}>
                    <strong>{f.name}</strong> ({f.enrollment}): {f.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {generated.length > 0 && (
            <div className="mt-4 overflow-hidden rounded border border-utt-gold/20">
              <table className="w-full text-sm">
                <thead className="bg-utt-beige-deep/40 text-left text-xs uppercase tracking-wider text-utt-green">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Enrollment</th>
                    <th className="px-3 py-2">Certificate ID</th>
                    <th className="px-3 py-2">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-utt-gold/15">
                  {generated.map((g) => (
                    <tr key={g.certificate_id}>
                      <td className="px-3 py-2">{g.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {g.enrollment}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {g.certificate_id}
                      </td>
                      <td className="px-3 py-2">
                        <a
                          href={g.pdf_url}
                          target="_blank"
                          rel="noopener"
                          className="text-utt-green underline"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
