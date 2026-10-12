import { revalidatePath } from "next/cache";
import { purgeUrls } from "@/lib/blog/cloudflare";
import { absoluteUrl } from "@/lib/seo";
import { treatmentPath } from "./content";

/**
 * After a treatment page is saved or restored: rebuild it (it is cached until
 * then, like the guide pages) and drop Cloudflare's copy. Never throws: the
 * database write already succeeded.
 */
export async function refreshTreatmentPage(slug: string) {
  const path = treatmentPath(slug);
  try {
    revalidatePath(path);
  } catch (e) {
    console.error("revalidate failed:", e instanceof Error ? e.message : e);
  }
  return purgeUrls([absoluteUrl(path)]);
}
