"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Student {
  id: string;
  enrollment: string;
  name: string;
  class: string;
  section: string | null;
  roll_number: string | null;
}

interface ImportResult {
  imported: number;
  errors: { row: number; reason: string }[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setErr(null);
    const r = await fetch(
      `/api/admin/students?q=${encodeURIComponent(q)}`,
    );
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      setErr(j.error || `Failed to load (${r.status})`);
      return;
    }
    const j = (await r.json()) as { students: Student[]; count: number };
    setStudents(j.students);
    setCount(j.count);
  }, [q]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/students", {
        method: "POST",
        body: fd,
      });
      const j = (await r.json()) as ImportResult & { error?: string };
      if (!r.ok) {
        setErr(j.error || `Import failed (${r.status})`);
      } else {
        setImportResult(j);
        await refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-utt-green">
            Student Registry
          </h1>
          <p className="text-sm text-gray-600">
            Imported students are matched by name + class when uploading marks.
          </p>
        </div>
        <div className="text-sm text-gray-500">{count} in registry</div>
      </div>

      <section className="mt-6 rounded border border-utt-gold/30 bg-white p-5">
        <h2 className="font-serif text-base font-semibold text-utt-green">
          Import registry CSV
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Headers expected: <code>Student Name</code>,{" "}
          <code>Enrollment Number</code>, <code>Class</code> (required),{" "}
          <code>Section</code>, <code>Roll Number</code>,{" "}
          <code>Admission Number</code>, <code>Gender</code>,{" "}
          <code>Status</code>. Re-importing is safe — rows are upserted by
          enrollment number.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-utt-green file:px-3 file:py-2 file:text-white file:shadow-sm hover:file:bg-utt-green-deep"
          />
          {busy && <span className="text-sm text-gray-500">Importing…</span>}
        </div>

        {importResult && (
          <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-900">
            Imported <strong>{importResult.imported}</strong> students.
            {importResult.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-green-800/80">
                  {importResult.errors.length} row(s) skipped
                </summary>
                <ul className="mt-1 list-inside list-disc text-xs">
                  {importResult.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.reason}
                    </li>
                  ))}
                  {importResult.errors.length > 20 && (
                    <li>…and {importResult.errors.length - 20} more</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        )}

        {err && (
          <div className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-utt-green">
            Browse
          </h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className="w-64 rounded border border-utt-gold/40 bg-white px-3 py-1.5 text-sm outline-none focus:border-utt-green"
          />
        </div>

        <div className="mt-3 overflow-hidden rounded border border-utt-gold/20 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-utt-beige-deep/40 text-left text-xs uppercase tracking-wider text-utt-green">
              <tr>
                <th className="px-3 py-2">Enrollment</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Roll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utt-gold/15">
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No students. Import a CSV above to populate the registry.
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 font-mono text-xs">
                    {s.enrollment}
                  </td>
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2">{s.class}</td>
                  <td className="px-3 py-2">{s.section ?? "—"}</td>
                  <td className="px-3 py-2">{s.roll_number ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
