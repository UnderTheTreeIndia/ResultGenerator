"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      setErr(j.error ?? "Login failed");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="UTT"
          className="h-12 w-12 object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
        <div>
          <h1 className="font-serif text-2xl font-semibold text-utt-green">
            Admin Login
          </h1>
          <p className="text-xs text-gray-500 italic">
            Under The Tree &middot; Result Cum Certificate
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Admin password
          </span>
          <input
            type="password"
            autoFocus
            required
            minLength={6}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password"
            className="mt-1 block w-full rounded border border-utt-gold/40 bg-white px-3 py-2.5 outline-none focus:border-utt-green focus:ring-1 focus:ring-utt-green/40"
          />
        </label>
        {err && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={busy || !pw}
          className="rounded bg-utt-green px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-utt-green-deep disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
