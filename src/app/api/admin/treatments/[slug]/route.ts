import { treatmentSeeds } from "@/content/treatments";
import { getTreatment } from "@/data/treatments";
import { isDatabaseConfigured } from "@/lib/blog/db";
import { denyUnlessAdmin } from "@/lib/blog/session";
import { DATABASE_MISSING } from "@/lib/blog/setup";
import { restoreTreatmentContent, saveTreatmentContent } from "@/lib/treatments/content";
import { checkEditedTree } from "@/lib/treatments/merge";
import { refreshTreatmentPage } from "@/lib/treatments/refresh";
import { sameContent, type TreatmentSeo } from "@/lib/treatments/tree";

type Context = { params: Promise<{ slug: string }> };

const failed = (e: unknown, fallback: string) =>
  Response.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 });

async function guard({ params }: Context): Promise<Response | string> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured()) return Response.json({ error: DATABASE_MISSING }, { status: 503 });
  const { slug } = await params;
  return treatmentSeeds[slug] && getTreatment(slug) ? slug : Response.json({ error: "Page not found." }, { status: 404 });
}

/** Photos may come from the site itself (/images/…) or from the image storage (R2). */
const imageBases = () => [process.env.R2_PUBLIC_URL?.replace(/\/$/, "")].filter((b): b is string => Boolean(b));

function readSeo(value: unknown): TreatmentSeo | string {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const title = typeof v.title === "string" ? v.title.trim() : "";
  const description = typeof v.description === "string" ? v.description.trim() : "";
  if (!title) return "SEO title is required.";
  if (title.length > 200) return "SEO title is too long (at most 200 characters).";
  if (description.length > 500) return "SEO description is too long (at most 500 characters).";
  return { title, description };
}

/** PUT — save a treatment page's content and SEO texts; the page updates at once. */
export async function PUT(request: Request, context: Context) {
  const slug = await guard(context);
  if (slug instanceof Response) return slug;
  const body = (await request.json().catch(() => null)) as { tree?: unknown; seo?: unknown } | null;

  const seo = readSeo(body?.seo);
  if (typeof seo === "string") return Response.json({ error: seo }, { status: 400 });
  const seed = treatmentSeeds[slug];
  const checked = checkEditedTree(seed, body?.tree, imageBases());
  if ("errors" in checked) return Response.json({ error: checked.errors.join("\n"), errors: checked.errors }, { status: 400 });

  try {
    const original = getTreatment(slug)!.seo;
    // Saved exactly as built in: no row is kept, the page is simply "Original" again.
    if (sameContent(checked.tree, seed) && sameContent(seo, { title: original.title, description: original.description })) {
      await restoreTreatmentContent(slug);
      return Response.json({ editedAt: null, cache: await refreshTreatmentPage(slug) });
    }
    const editedAt = await saveTreatmentContent(slug, checked.tree, seo);
    return Response.json({ editedAt, cache: await refreshTreatmentPage(slug) });
  } catch (e) {
    return failed(e, "Failed to save.");
  }
}

/** DELETE — "Restore original": the built-in content and SEO texts come back. */
export async function DELETE(_request: Request, context: Context) {
  const slug = await guard(context);
  if (slug instanceof Response) return slug;
  try {
    await restoreTreatmentContent(slug);
    return Response.json({ ok: true, cache: await refreshTreatmentPage(slug) });
  } catch (e) {
    return failed(e, "Failed to restore.");
  }
}
