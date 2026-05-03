/**
 * Deletes all rows from the `results` table and all PDF files from Storage.
 *
 * Usage: npx tsx scripts/cleanup-results.ts
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

async function deleteStorageFiles() {
  let totalDeleted = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list("", { limit, offset });

    if (error) {
      console.error("Storage list error:", error.message);
      break;
    }
    if (!files || files.length === 0) break;

    // Each top-level entry is a folder (batch_id). List files inside each.
    const allPaths: string[] = [];
    for (const folder of files) {
      const { data: inner, error: innerErr } = await supabase.storage
        .from(bucket)
        .list(folder.name, { limit: 1000 });

      if (innerErr) {
        console.error(`List error for folder ${folder.name}:`, innerErr.message);
        continue;
      }
      for (const f of inner ?? []) {
        allPaths.push(`${folder.name}/${f.name}`);
      }
    }

    if (allPaths.length > 0) {
      const { error: rmErr } = await supabase.storage.from(bucket).remove(allPaths);
      if (rmErr) {
        console.error("Storage delete error:", rmErr.message);
      } else {
        totalDeleted += allPaths.length;
        console.log(`  Deleted ${allPaths.length} file(s) from storage.`);
      }
    }

    if (files.length < limit) break;
    offset += limit;
  }

  return totalDeleted;
}

async function deleteResultRows() {
  // Delete all rows — Supabase requires a filter, so we use neq on a uuid column
  const { error, count } = await supabase
    .from("results")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("Results delete error:", error.message);
    return 0;
  }
  return count ?? 0;
}

(async () => {
  console.log("Cleaning up results…\n");

  console.log("Step 1: Deleting PDF files from storage bucket:", bucket);
  const filesDeleted = await deleteStorageFiles();
  console.log(`  Total storage files deleted: ${filesDeleted}\n`);

  console.log("Step 2: Deleting all rows from results table");
  const rowsDeleted = await deleteResultRows();
  console.log(`  Total result rows deleted: ${rowsDeleted}\n`);

  console.log("Done.");
})();
