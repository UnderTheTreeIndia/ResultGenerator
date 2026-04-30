-- =====================================================================
--  Under The Tree — Result Cum Certificate System
--  Supabase schema. Run this in Supabase SQL Editor (idempotent).
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
--  Students registry — populated by the admin's CSV import.
--  Lookup target for the marks-upload pipeline (matches by name + class).
-- =====================================================================
create table if not exists public.students (
  id                uuid primary key default gen_random_uuid(),
  enrollment        text not null unique,
  admission_number  text,
  name              text not null,
  name_normalized   text generated always as
                       (lower(regexp_replace(name, '\s+', ' ', 'g'))) stored,
  class             text not null,
  class_normalized  text generated always as
                       (lower(regexp_replace(class, '\s+', '', 'g'))) stored,
  section           text,
  roll_number       text,
  gender            text,
  status            int default 1,
  raw_json          jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists students_lookup_idx
  on public.students (name_normalized, class_normalized);

alter table public.students enable row level security;
-- (no public policies; service role only)

-- =====================================================================
--  Results — one row per generated certificate.
-- =====================================================================
create table if not exists public.results (
  id              uuid primary key default gen_random_uuid(),
  certificate_id  text not null unique,
  name            text not null,
  enrollment      text not null,
  class           text not null,
  exam_type       text not null,
  subjects_json   jsonb not null,
  total_marks     numeric not null,
  average         numeric not null,
  overall_grade   text not null,
  remarks_en      text not null,
  remarks_hi      text not null,
  pdf_url         text,
  batch_id        uuid not null,
  created_at      timestamptz not null default now()
);

create unique index if not exists results_unique_run
  on public.results (enrollment, exam_type, class);
create index if not exists results_batch_idx
  on public.results (batch_id);
create index if not exists results_certificate_idx
  on public.results (certificate_id);

alter table public.results enable row level security;

-- Public can SELECT (the verify page is open). The application code reads
-- only display-safe columns — never marks, totals, or percentage.
drop policy if exists "public can read results" on public.results;
create policy "public can read results"
  on public.results for select
  using (true);

-- Writes occur via service role only — no insert/update/delete policies.
