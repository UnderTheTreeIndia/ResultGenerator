"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className="rounded border border-utt-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-gray-700 hover:bg-utt-gold/10 disabled:opacity-50"
    >
      {busy ? "…" : "Logout"}
    </button>
  );
}
