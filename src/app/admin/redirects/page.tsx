import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RedirectManager from "@/components/admin/RedirectManager";
import { liveRedirects } from "@/data/redirects";
import { sitemapPages } from "@/data/sitemap";
import { getPublishedPosts } from "@/lib/blog/posts";
import { isAdmin } from "@/lib/blog/session";
import { blogSetup } from "@/lib/blog/setup";
import { ensurePublished, type PublishResult } from "@/lib/redirects/publish";
import type { RedirectRow } from "@/lib/redirects/rules";
import { listRedirects } from "@/lib/redirects/store";

export const metadata: Metadata = { title: { absolute: "Redirects" } };

/** /admin/redirects/ — send an old address to a new one. */
export default async function AdminRedirectsPage() {
  if (!(await isAdmin())) redirect("/admin/login/");

  const setup = blogSetup();
  let rows: RedirectRow[] = [];
  let loadError: string | undefined;
  let published: PublishResult = { ok: true };
  if (setup.database) {
    try {
      rows = await listRedirects();
      // The website should answer with exactly this list; if not, send it again.
      published = await ensurePublished(rows);
    } catch (e) {
      loadError = `Could not load the redirects: ${e instanceof Error ? e.message : e}`;
    }
  }

  // Every page the site has, for the hints under the form ("this is a live
  // page", "nothing lives at that address").
  const posts = await getPublishedPosts().catch(() => []);
  const pages = [
    ...sitemapPages.map((p) => new URL(p.loc).pathname),
    ...posts.map((p) => `/guide/${p.slug}/`),
  ];

  return (
    <RedirectManager
      initialRows={rows}
      builtIn={liveRedirects}
      pages={pages}
      published={published}
      setup={setup}
      loadError={loadError}
    />
  );
}
