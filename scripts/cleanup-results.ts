/**
 * Deletes rows from the `results` table and their PDF files from Storage.
 *
 * Usage:
 *   npx tsx scripts/cleanup-results.ts              # delete ALL results
 *   npx tsx scripts/cleanup-results.ts --class 3rd  # delete only Class 3rd
 *
 * Reads credentials from .env.local in the project root.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("No .env.local found — aborting.");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= val;
  }
}

// Parse --class <value> from argv
function parseClassFilter(): string | null {
  const idx = process.argv.indexOf("--class");
  return idx !== -1 ? (process.argv[idx + 1] ?? null) : null;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "certificates";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function deleteStorageFilesForRows(
  rows: { pdf_url: string | null }[],
): Promise<number> {
  const paths: string[] = [];
  for (const row of rows) {
    if (!row.pdf_url) continue;
    try {
      const u = new URL(row.pdf_url);
      const prefix = `/storage/v1/object/public/${bucket}/`;
      if (u.pathname.startsWith(prefix)) {
        paths.push(u.pathname.slice(prefix.length));
      }
    } catch {
      // skip malformed URLs
    }
  }
  if (paths.length === 0) return 0;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error("Storage delete error:", error.message);
    return 0;
  }
  return paths.length;
}

async function deleteAllStorageFiles(): Promise<number> {
  let totalDeleted = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list("", { limit, offset });

    if (error) { console.error("Storage list error:", error.message); break; }
    if (!files || files.length === 0) break;

    const allPaths: string[] = [];
    for (const folder of files) {
      const { data: inner, error: innerErr } = await supabase.storage
        .from(bucket)
        .list(folder.name, { limit: 1000 });
      if (innerErr) { console.error(`List error for ${folder.name}:`, innerErr.message); continue; }
      for (const f of inner ?? []) allPaths.push(`${folder.name}/${f.name}`);
    }

    if (allPaths.length > 0) {
      const { error: rmErr } = await supabase.storage.from(bucket).remove(allPaths);
      if (rmErr) console.error("Storage delete error:", rmErr.message);
      else { totalDeleted += allPaths.length; console.log(`  Deleted ${allPaths.length} file(s) from storage.`); }
    }

    if (files.length < limit) break;
    offset += limit;
  }
  return totalDeleted;
}

(async () => {
  const classFilter = parseClassFilter();

  if (classFilter) {
    console.log(`Cleaning up results for class "${classFilter}"…\n`);

    // Fetch matching rows to get their pdf_urls
    const { data: rows, error: fetchErr } = await supabase
      .from("results")
      .select("id, pdf_url, class")
      .ilike("class", classFilter);

    if (fetchErr) { console.error("Fetch error:", fetchErr.message); process.exit(1); }
    if (!rows || rows.length === 0) { console.log("No results found for that class."); process.exit(0); }

    console.log(`Found ${rows.length} result(s): ${rows.map((r) => r.class).join(", ")}`);

    console.log("\nStep 1: Deleting PDF files from storage…");
    const filesDeleted = await deleteStorageFilesForRows(rows);
    console.log(`  Deleted ${filesDeleted} file(s).\n`);

    console.log("Step 2: Deleting rows from results table…");
    const { error: delErr, count } = await supabase
      .from("results")
      .delete({ count: "exact" })
      .ilike("class", classFilter);
    if (delErr) console.error("Delete error:", delErr.message);
    else console.log(`  Deleted ${count} row(s).`);

  } else {
    console.log("Cleaning up ALL results…\n");

    console.log("Step 1: Deleting PDF files from storage bucket:", bucket);
    const filesDeleted = await deleteAllStorageFiles();
    console.log(`  Total storage files deleted: ${filesDeleted}\n`);

    console.log("Step 2: Deleting all rows from results table…");
    const { error, count } = await supabase
      .from("results")
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.error("Results delete error:", error.message);
    else console.log(`  Total result rows deleted: ${count}`);
  }

  console.log("\nDone.");
})();
