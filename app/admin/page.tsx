import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { AdminWorkflow } from "@/components/AdminWorkflow";

export const dynamic = "force-dynamic";

interface BatchRow {
  batch_id: string;
  count: number;
  created_at: string;
}

async function loadStats() {
  const supabase = getAdminClient();
  const [{ count: studentsCount }, { count: resultsCount }, recentRes] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("results").select("id", { count: "exact", head: true }),
      supabase
        .from("results")
        .select("batch_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  const recentBatches: BatchRow[] = [];
  const seen = new Map<string, BatchRow>();
  for (const row of recentRes.data ?? []) {
    const id = row.batch_id as string;
    const existing = seen.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      const r: BatchRow = {
        batch_id: id,
        count: 1,
        created_at: row.created_at as string,
      };
      seen.set(id, r);
      recentBatches.push(r);
    }
  }
  return {
    studentsCount: studentsCount ?? 0,
    resultsCount: resultsCount ?? 0,
    recentBatches: recentBatches.slice(0, 6),
  };
}

export default async function AdminHome() {
  let stats: Awaited<ReturnType<typeof loadStats>> | null = null;
  let envOk = true;
  let envError: string | null = null;
  try {
    stats = await loadStats();
  } catch (e) {
    envOk = false;
    envError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-utt-green">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage student records and generate Result Cum Certificates.
          </p>
        </div>
        <Link
          href="/admin/students"
          className="rounded bg-utt-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-utt-green-deep"
        >
          Manage Students
        </Link>
      </div>

      {!envOk && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Environment not yet configured.</div>
          <p className="mt-1">
            Set the variables in <code>.env.local</code> (or your Vercel
            environment) before using the dashboard.
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">
            {envError}
          </pre>
        </div>
      )}

      {envOk && stats && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Stat label="Students in registry" value={stats.studentsCount} />
            <Stat label="Certificates generated" value={stats.resultsCount} />
            <Stat
              label="Recent batches"
              value={stats.recentBatches.length}
            />
          </div>

          <AdminWorkflow />

          <section className="mt-10">
            <h2 className="font-serif text-lg font-semibold text-utt-green">
              Recent batches
            </h2>
            {stats.recentBatches.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No batches yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-utt-gold/20 rounded border border-utt-gold/20 bg-white">
                {stats.recentBatches.map((b) => (
                  <li
                    key={b.batch_id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-mono text-xs text-gray-500">
                        {b.batch_id}
                      </div>
                      <div className="text-gray-700">
                        {b.count} certificate{b.count === 1 ? "" : "s"} &middot;{" "}
                        {new Date(b.created_at).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <Link
                      href={`/admin/batches/${b.batch_id}`}
                      className="text-utt-green hover:underline"
                    >
                      View &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-utt-gold/20 bg-white p-5">
      <div className="text-2xl font-semibold text-utt-green">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}
