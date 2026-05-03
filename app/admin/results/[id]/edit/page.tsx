import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function EditResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("results")
    .select(
      "id, certificate_id, name, enrollment, class, exam_type, overall_grade, remarks_en, remarks_hi, batch_id, pdf_url, subjects_json",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <EditForm result={data as Parameters<typeof EditForm>[0]["result"]} />;
}
