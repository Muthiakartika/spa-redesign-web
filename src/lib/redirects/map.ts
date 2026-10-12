/**
 * The published redirect list that src/proxy.ts answers from: a small JSON
 * file in the R2 bucket (R2_PUBLIC_URL/site/redirects.json), rewritten by
 * the admin on every save (publish.ts). Reading it costs no database query,
 * so visits never wake the Neon database.
 *
 * Kept light on purpose: the proxy runs before every page request.
 */

/** "/old-page/" → [destination, status] */
export type RedirectMap = Record<string, [string, number]>;

export type RedirectSnapshot = { updatedAt: string; redirects: RedirectMap };

export const SNAPSHOT_KEY = "site/redirects.json";

export function snapshotOf(rows: { source: string; destination: string; status_code: number }[]): RedirectMap {
  return Object.fromEntries(
    [...rows].sort((a, b) => a.source.localeCompare(b.source)).map((r) => [r.source, [r.destination, r.status_code]])
  );
}

const snapshotUrl = () => {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}/${SNAPSHOT_KEY}` : null;
};

/** What the website currently answers with, or null when it cannot be read. */
export async function fetchPublishedMap(): Promise<RedirectMap | null> {
  const url = snapshotUrl();
  if (url) {
    // A new query string every 30 s: Cloudflare caches the file, and this way
    // a save shows within half a minute whether or not its purge ran.
    const res = await fetch(`${url}?t=${Math.floor(Date.now() / 30_000)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (res.status === 404) return {}; // nothing published yet
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as RedirectSnapshot | null;
    return data && typeof data.redirects === "object" ? data.redirects : null;
  }
  // No image storage: read the table itself (each proxy instance about once a minute).
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    try {
      const rows = await neon(process.env.DATABASE_URL)`SELECT source, destination, status_code FROM redirects`;
      return snapshotOf(rows as { source: string; destination: string; status_code: number }[]);
    } catch (e) {
      return (e as { code?: string }).code === "42P01" ? {} : null;
    }
  }
  return {};
}
