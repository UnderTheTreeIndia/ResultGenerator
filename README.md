# Under The Tree — Result Cum Certificate System

A Next.js app that takes student marks (CSV/Excel), looks up enrollment from a school registry, generates branded PDF Result Cum Certificates, stores them in Supabase, and exposes a public verification page per certificate.

- **Marks visibility on the certificate**: subject names with subject-wise grades only, plus an overall grade letter. **No marks, totals, average, or percentage are ever rendered** on the PDF or the public verify page.
- **Enrollment is derived**, not entered: a student registry is imported once; marks rows match by name + class.
- Branded with the UTT logo (page watermark + header) and the Chief Mentor's signature.

## Stack

- Next.js 16.2.4 (App Router) · React 19 · TypeScript · Tailwind CSS v3
- Supabase (Postgres + Storage)
- Puppeteer-core + `@sparticuz/chromium` for headless PDF
- `xlsx` + `papaparse` for spreadsheet parsing
- `iron-session` for the single-password admin gate
- `archiver` for ZIP downloads

## Project layout

```
app/
  page.tsx                            landing
  admin/                              gated by middleware
    page.tsx                          dashboard + upload + generate
    login/page.tsx
    students/page.tsx                 registry import + browse
    batches/[batch_id]/page.tsx
  api/
    auth/                             login + logout
    admin/{students,upload,generate,batches/[id]/zip}/route.ts
    certificate/[id]/route.ts         redirect to PDF
    verify/[certificate_id]/route.ts  public JSON
  verify/[certificate_id]/page.tsx    public page
components/                           AdminWorkflow, LogoutButton
lib/
  env.ts                              zod-validated env
  supabase/{server,admin,browser}.ts
  auth/session.ts                     iron-session helper
  parse/                              normalize, validate, csv, excel, students, lookupEnrollment
  grading/                            grade band, totals, 42 bilingual remarks
  certificate/                        id minting, HTML render, Puppeteer
supabase/                             schema.sql, storage-policies.sql
scripts/                              make-sample-template.ts, render-smoke.ts
samples/                              sample-template.{csv,xlsx} + reference originals
docs/DEPLOYMENT.md                    Supabase + Vercel walk-through
proxy.ts                              Next 16 proxy (was `middleware.ts`)
```

## Local quickstart

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials, ADMIN_PASSWORD, and a 32-byte SESSION_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run gen:sample          # writes samples/sample-template.{csv,xlsx}
npm run render:smoke        # writes tmp/cert.{html,pdf} via local Chrome
npm run dev                 # http://localhost:3000
```

The first time, log in at `/admin/login`, then go to **Students → Import registry CSV** and upload `samples/student-registry-reference.csv`. After that, **Dashboard → Upload marks template** with `samples/sample-template.csv` (the sample names match the registry on purpose) and click Generate.

## Workflows

### Admin

1. **Login** at `/admin/login` (single shared password).
2. **Import registry** at `/admin/students` — re-importable; rows are upserted by enrollment.
3. **Upload marks** at `/admin` — template is parsed, validated, and matched against the registry. Rows that fail lookup are listed but excluded from generation. Per-row marks can be edited inline.
4. **Generate** — the client chunks rows in batches of 15 and posts to `/api/admin/generate`. PDFs are rendered, uploaded to the `certificates` storage bucket, and a row is inserted into `results`.
5. **Download ZIP** at `/admin/batches/{batch_id}` or via the deep link shown on completion.

### Public verification

Anyone visits `/verify/UTT-2025-Cclass-XXXXXX` to confirm the certificate. The page exposes only display-safe fields; marks are stripped server-side from the response.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for a step-by-step Supabase + Vercel walk-through.

## Hardening TODOs

- Rate-limit `/api/auth` (none in v1).
- Optional: replace single-password gate with Supabase Auth for multiple admins.
- Optional: Google Sheets import (deferred from spec).
