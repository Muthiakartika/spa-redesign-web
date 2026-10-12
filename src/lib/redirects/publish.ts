import { purgeUrls } from "@/lib/blog/cloudflare";
import { isStorageConfigured, putObject } from "@/lib/blog/storage";
import { absoluteUrl } from "@/lib/seo";
import { fetchPublishedMap, SNAPSHOT_KEY, snapshotOf, type RedirectSnapshot } from "./map";
import type { RedirectRow } from "./rules";
import { listRedirects } from "./store";

export type PublishResult = { ok: boolean; error?: string };

/**
 * Make the saved redirects live: write the list the proxy reads (map.ts),
 * then drop Cloudflare's copies of the addresses that changed, which may
 * still hold the old answer (a 404, the page itself, or an earlier
 * redirect). Never throws: the database write already succeeded.
 */
export async function publishRedirects(changedSources: string[] = []): Promise<PublishResult> {
  let result: PublishResult = { ok: true };
  try {
    const rows = await listRedirects();
    if (isStorageConfigured()) {
      const snapshot: RedirectSnapshot = { updatedAt: new Date().toISOString(), redirects: snapshotOf(rows) };
      await putObject(
        SNAPSHOT_KEY,
        new TextEncoder().encode(JSON.stringify(snapshot)),
        "application/json",
        "public, max-age=30"
      );
    }
  } catch (e) {
    result = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  await purgeUrls([...new Set(changedSources)].map((s) => absoluteUrl(s)));
  return result;
}

/**
 * On opening /admin/redirects/: if what the website answers with differs
 * from the saved list (a save whose publishing failed, or rows saved before
 * this existed), publish again. Returns whether the two now agree.
 */
export async function ensurePublished(rows: RedirectRow[]): Promise<PublishResult> {
  const published = await fetchPublishedMap().catch(() => null);
  if (published && JSON.stringify(published) === JSON.stringify(snapshotOf(rows))) return { ok: true };
  return publishRedirects(rows.map((r) => r.source));
}
