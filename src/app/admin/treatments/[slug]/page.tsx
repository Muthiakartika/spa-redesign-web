import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import TreatmentEditor from "@/components/admin/treatments/TreatmentEditor";
import { isAdmin } from "@/lib/blog/session";
import { blogSetup } from "@/lib/blog/setup";
import { getTreatmentContent } from "@/lib/treatments/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!(await isAdmin())) return {};
  const content = await getTreatmentContent((await params).slug).catch(() => null);
  return { title: { absolute: content ? `Edit: ${content.name}` : "Edit Treatment" } };
}

/** /admin/treatments/<slug>/ — edit one treatment page. */
export default async function EditTreatmentPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/admin/login/");
  const content = await getTreatmentContent((await params).slug);
  if (!content) notFound();
  return (
    <div className="adm-editor-page">
      <TreatmentEditor content={content} setup={blogSetup()} />
    </div>
  );
}
