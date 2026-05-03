"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { GRADE_BANDS } from "@/lib/grading/grade";

interface ResultData {
  id: string;
  certificate_id: string;
  name: string;
  enrollment: string;
  class: string;
  exam_type: string;
  overall_grade: string;
  remarks_en: string;
  remarks_hi: string;
  batch_id: string;
  pdf_url: string | null;
}

export default function EditForm({ result }: { result: ResultData }) {
  const [overallGrade, setOverallGrade] = useState(result.overall_grade);
  const [remarksEn, setRemarksEn] = useState(result.remarks_en);
  const [remarksHi, setRemarksHi] = useState(result.remarks_hi);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const basePreviewUrl = `/api/admin/results/${result.id}/html`;

  const refreshPreview = useCallback(() => {
    if (!iframeRef.current) return;
    const url = new URL(basePreviewUrl, window.location.origin);
    url.searchParams.set("remarks_en", remarksEn);
    url.searchParams.set("remarks_hi", remarksHi);
    url.searchParams.set("overall_grade", overallGrade);
    iframeRef.current.src = url.toString();
  }, [basePreviewUrl, remarksEn, remarksHi, overallGrade]);

  const saveAndRerender = async () => {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/results/${result.id}/rerender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remarks_en: remarksEn,
          remarks_hi: remarksHi,
          overall_grade: overallGrade,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Re-render failed");
      }
      setStatus("success");
      if (iframeRef.current) iframeRef.current.src = basePreviewUrl;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      {/* Header */}
      <div className="mb-5">
        <Link
          href={`/admin/batches/${result.batch_id}`}
          className="text-xs text-utt-green hover:underline"
        >
          &larr; Back to Batch
        </Link>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-utt-green">
              Edit Certificate
            </h1>
            <p className="text-sm text-gray-600">
              {result.name} &middot; Class {result.class} &middot;{" "}
              {result.exam_type}
            </p>
            <p className="font-mono text-xs text-gray-400">
              {result.certificate_id}
            </p>
          </div>
          {result.pdf_url && (
            <a
              href={result.pdf_url}
              target="_blank"
              rel="noopener"
              className="text-sm text-utt-green underline"
            >
              View current PDF ↗
            </a>
          )}
        </div>
      </div>

      {/* Split panel */}
      <div className="flex gap-5">
        {/* Form panel */}
        <aside className="w-72 shrink-0 space-y-4">
          <div className="rounded border border-utt-gold/20 bg-white p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-utt-green mb-1.5">
                Overall Grade
              </label>
              <select
                value={overallGrade}
                onChange={(e) => setOverallGrade(e.target.value)}
                className="w-full rounded border border-utt-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-utt-green"
              >
                {GRADE_BANDS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-utt-green mb-1.5">
                English Remark
              </label>
              <textarea
                value={remarksEn}
                onChange={(e) => setRemarksEn(e.target.value)}
                rows={6}
                className="w-full rounded border border-utt-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-utt-green resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-utt-green mb-1.5">
                Hindi Remark
              </label>
              <textarea
                value={remarksHi}
                onChange={(e) => setRemarksHi(e.target.value)}
                rows={6}
                className="w-full rounded border border-utt-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-utt-green resize-y"
                lang="hi"
              />
            </div>
          </div>

          <button
            onClick={refreshPreview}
            className="w-full rounded border border-utt-green px-4 py-2 text-sm font-medium text-utt-green hover:bg-utt-green/10"
          >
            Refresh Preview
          </button>

          <button
            onClick={saveAndRerender}
            disabled={status === "saving"}
            className="w-full rounded bg-utt-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-utt-green-deep disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save & Re-render PDF"}
          </button>

          {status === "success" && (
            <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
              Saved — PDF re-rendered successfully.
            </p>
          )}
          {status === "error" && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </p>
          )}
        </aside>

        {/* Preview iframe */}
        <div className="flex-1 min-w-0">
          <iframe
            ref={iframeRef}
            src={basePreviewUrl}
            title="Certificate Preview"
            className="w-full rounded border border-utt-gold/20 shadow-sm bg-white"
            style={{ height: "calc(100vh - 220px)" }}
          />
        </div>
      </div>
    </main>
  );
}
