import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classKey, nameKey } from "./normalize";

export interface RegistryMatch {
  enrollment: string;
  registry_class: string;
  section: string | null;
  roll_number: string | null;
}

export interface LookupInput {
  name: string;
  class: string;
  section?: string | null;
}

export interface LookupResult<T extends LookupInput> {
  row: T;
  match: RegistryMatch | null;
  reason?: string;
}

interface StudentRow {
  enrollment: string;
  name: string;
  name_normalized: string;
  class: string;
  class_normalized: string;
  section: string | null;
  roll_number: string | null;
}

export async function lookupEnrollments<T extends LookupInput>(
  supabase: SupabaseClient,
  rows: T[],
): Promise<LookupResult<T>[]> {
  if (rows.length === 0) return [];

  const nameKeys = [...new Set(rows.map((r) => nameKey(r.name)))];
  const { data, error } = await supabase
    .from("students")
    .select(
      "enrollment, name, name_normalized, class, class_normalized, section, roll_number",
    )
    .in("name_normalized", nameKeys);
  if (error) throw error;

  const byName = new Map<string, StudentRow[]>();
  for (const s of (data ?? []) as StudentRow[]) {
    const arr = byName.get(s.name_normalized) ?? [];
    arr.push(s);
    byName.set(s.name_normalized, arr);
  }

  return rows.map((r) => {
    const nKey = nameKey(r.name);
    const cKey = classKey(r.class);
    const candidates = (byName.get(nKey) ?? []).filter(
      (c) => c.class_normalized === cKey,
    );

    if (candidates.length === 0) {
      return {
        row: r,
        match: null,
        reason: `Student '${r.name}' (class ${r.class}) not found in registry`,
      };
    }
    if (candidates.length === 1) {
      const m = candidates[0];
      return {
        row: r,
        match: {
          enrollment: m.enrollment,
          registry_class: m.class,
          section: m.section,
          roll_number: m.roll_number,
        },
      };
    }

    if (r.section) {
      const bySection = candidates.filter(
        (c) => (c.section ?? "").toLowerCase() === r.section!.toLowerCase(),
      );
      if (bySection.length === 1) {
        const m = bySection[0];
        return {
          row: r,
          match: {
            enrollment: m.enrollment,
            registry_class: m.class,
            section: m.section,
            roll_number: m.roll_number,
          },
        };
      }
      if (bySection.length === 0) {
        return {
          row: r,
          match: null,
          reason: `No registry student '${r.name}' in class '${r.class}' section '${r.section}'`,
        };
      }
    }
    return {
      row: r,
      match: null,
      reason: `Ambiguous match for '${r.name}' in class '${r.class}'; add 'section' column to disambiguate`,
    };
  });
}
