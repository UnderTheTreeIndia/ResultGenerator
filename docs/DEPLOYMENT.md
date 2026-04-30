# Deployment Guide — Under The Tree Result Cum Certificate System

End-to-end setup: Supabase project, GitHub repo, Vercel project, env vars, and a smoke test.

## 1. Supabase project

1. Sign in at <https://supabase.com> and create a new project.
   - Region: choose `ap-south-1` (Mumbai) for low latency from India.
   - Save the database password somewhere safe — you may need it later.
2. From **Project Settings → API**, copy the three values you'll need:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` secret key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret; never commit)
3. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and click **Run**. You should see a "Success. No rows returned." message.
4. Open **Storage → Create a new bucket**:
   - Name: `certificates`
   - Public bucket: **on**
   - File size limit: 5 MB (typical certificate ≈ 0.5 MB)
   - Allowed MIME types: `application/pdf`
5. Back in **SQL Editor**, paste `supabase/storage-policies.sql` and click **Run**. This adds the public-read policy for the bucket's objects.

> Re-running `schema.sql` and `storage-policies.sql` is safe — both are idempotent.

## 2. GitHub repository

The empty repo already exists at <https://github.com/UnderTheTreeIndia/ResultGenerator>. From this project folder:

```bash
git init
git add .
git commit -m "Initial scaffold"
git branch -M main
git remote add origin https://github.com/UnderTheTreeIndia/ResultGenerator.git
git push -u origin main
```

## 3. Vercel project

1. Open <https://vercel.com/new> and import `UnderTheTreeIndia/ResultGenerator`.
2. Framework: **Next.js** (auto-detected).
3. Region: **Mumbai (`bom1`)** under "Build & Development Settings → Functions Region" (or set in `vercel.json` if preferred).
4. Add **Environment Variables** under **Settings → Environment Variables**. Add each to **Production**, **Preview**, and **Development**:

   | Name                            | Value                                                  |
   | ------------------------------- | ------------------------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`      | from Supabase                                          |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase                                          |
   | `SUPABASE_SERVICE_ROLE_KEY`     | from Supabase                                          |
   | `SUPABASE_STORAGE_BUCKET`       | `certificates`                                         |
   | `ADMIN_PASSWORD`                | choose a strong password                               |
   | `SESSION_SECRET`                | 32+ byte hex (see below)                               |
   | `PUBLIC_BASE_URL`               | the Vercel URL once known (e.g. `https://utt.vercel.app`) |

   To generate `SESSION_SECRET` locally:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **Deploy**. The first deploy installs Chromium (`@sparticuz/chromium`) — it can take 60–90s.

## 4. Smoke test

Once the deploy is live:

1. Visit `https://<your-vercel-url>/admin/login` and sign in with `ADMIN_PASSWORD`.
2. Go to **Students** and import `samples/student-registry-reference.csv` (download from the repo or commit-history). Confirm "Imported 99 students."
3. Go back to **Dashboard** and upload `samples/sample-template.csv`. The preview should show 5 rows with enrollment numbers populated from the registry.
4. Click **Generate 5 certificates**. Wait for the progress bar to complete.
5. Click **Download ZIP** → 5 PDFs land in your Downloads folder.
6. Open one of the PDFs:
   - UTT logo at top, Meetali signature at bottom right.
   - Subject column with grade letters only (no marks anywhere).
   - Overall grade letter, no percentage beside it.
   - Bilingual remark (English + Devanagari Hindi).
7. Copy the **Certificate ID** from any row and visit `https://<your-vercel-url>/verify/<id>` in a private window. The verify page should load with the same details and a "View Certificate PDF" link.

## 5. Performance notes

- The `/api/admin/generate` route is configured with `maxDuration = 30` and processes up to 15 rows per request. Larger uploads are chunked client-side.
- The `/api/admin/batches/[id]/zip` route is configured with `maxDuration = 60`. Vercel Hobby plan caps at 60s; Pro caps at 300s. For batches above ~50 PDFs on Hobby, generate in smaller chunks and download per batch.
- Puppeteer cold start adds ~3.5s to the first request after idle. The route opens one browser per request and reuses it across all rows in that request.

## 6. Renaming or rotating credentials

- Rotating `ADMIN_PASSWORD`: change the env var in Vercel and redeploy. All current sessions remain valid until the cookie expires (7 days) or the user logs out.
- Rotating `SESSION_SECRET`: change the env var. **All existing sessions invalidate immediately** (cookies signed with the old secret will not decrypt). Use this if a session leak is suspected.
- Rotating Supabase service-role key: change in **Supabase → Project Settings → API** → "Reset" — then update Vercel env var and redeploy.

## 7. Backups

- The `results` table is small but precious. Enable **Supabase Daily Backups** under your project's Settings.
- The `certificates` storage bucket holds the actual PDFs. They are reproducible from the `results` table data + the deployed code, but enabling Storage backups (Pro plan) is recommended.
