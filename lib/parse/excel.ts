import "server-only";
import * as XLSX from "xlsx";
import { normalizeRow } from "./normalize";

export function parseExcelBuffer(buf: ArrayBuffer): Record<string, unknown>[] {
  const wb = XLSX.read(buf, { type: "array" });
  if (wb.SheetNames.length === 0) return [];
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });
  return json.map(normalizeRow);
}
