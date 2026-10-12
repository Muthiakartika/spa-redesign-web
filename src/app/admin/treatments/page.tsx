import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TreatmentList, { type TreatmentListItem } from "@/components/admin/treatments/TreatmentList";
import { treatments } from "@/data/treatments";
import { isAdmin } from "@/lib/blog/session";
import { blogSetup } from "@/lib/blog/setup";
import { listEditedTreatments } from "@/lib/treatments/content";

export const metadata: Metadata = { title: { absolute: "Treatment Pages" } };

/** /admin/treatments/ — the 24 treatment pages, in menu order. */
export default async function AdminTreatmentsPage() {
  if (!(await isAdmin())) redirect("/admin/login/");

  let edited: Record<string, string> = {};
  let loadError: string | undefined;
  try {
    edited = await listEditedTreatments();
  } catch (e) {
    loadError = `Could not load which pages were edited: ${e instanceof Error ? e.message : e}`;
  }

  const items: TreatmentListItem[] = treatments.map((t) => ({
    slug: t.slug,
    name: t.name,
    image: t.cardImage.src,
    editedAt: edited[t.slug] ?? null,
  }));

  return <TreatmentList items={items} setup={blogSetup()} loadError={loadError} />;
}
