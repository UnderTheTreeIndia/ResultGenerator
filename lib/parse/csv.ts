import "server-only";
import Papa from "papaparse";
import { normalizeRow } from "./normalize";

export function parseCsvText(text: string): Record<string, unknown>[] {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data.map(normalizeRow);
}
