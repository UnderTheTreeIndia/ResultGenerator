import { v4 as uuidv4 } from "uuid";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Academic year start (calendar year). Apr–Jun returns the previous calendar
 * year (e.g. May 2026 → 2025), Jul–Mar returns the current one.
 */
export function getAcademicYear(now: Date = new Date()): number {
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  if (m >= 7) return y;
  if (m >= 4) return y - 1;
  return y - 1;
}

export function academicYearLabel(year: number): string {
  const next = (year + 1) % 100;
  return `${year}–${next.toString().padStart(2, "0")}`;
}

export function sanitizeClass(cls: string): string {
  return cls.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "X";
}

export function makeCertificateId(opts: {
  cls: string;
  academicYear?: number;
}): string {
  const year = opts.academicYear ?? getAcademicYear();
  const code = uuidv4().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `UTT-${year}-C${sanitizeClass(opts.cls)}-${code}`;
}

export async function makeUniqueCertificateId(
  supabase: SupabaseClient,
  opts: { cls: string; academicYear?: number },
  maxAttempts = 5,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const id = makeCertificateId(opts);
    const { data, error } = await supabase
      .from("results")
      .select("id")
      .eq("certificate_id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return id;
  }
  throw new Error("Could not generate a unique certificate ID after retries");
}
