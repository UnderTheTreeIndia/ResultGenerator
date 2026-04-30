-- =====================================================================
--  Storage policies for the 'certificates' bucket.
--  Run AFTER creating the bucket in Supabase Storage UI (mark it public).
-- =====================================================================

-- Public read on bucket objects so generated PDFs can be opened directly
-- from the verify page and the admin batch view.
drop policy if exists "Public read for certificates bucket"
  on storage.objects;

create policy "Public read for certificates bucket"
  on storage.objects for select
  to public
  using (bucket_id = 'certificates');

-- (Service role bypasses RLS, so no insert/update policies are required.)
