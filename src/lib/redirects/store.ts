import { getSql, toTimestamp } from "@/lib/blog/db";
import { builtInRedirectFor, internalPath, type RedirectInput, type RedirectRow } from "./rules";

/**
 * The `redirects` table (Neon, next to the blog's `posts`): one row per
 * redirect added in /admin/redirects/; see db/schema.sql. Every change is
 * published right away for the proxy (publish.ts).
 */

let tableReady: Promise<unknown> | null = null;

/** Create the table on first use, so no setup step is needed after deploying. */
export function ensureRedirectTable() {
  tableReady ??= getSql()`
    CREATE TABLE IF NOT EXISTS redirects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source text UNIQUE NOT NULL,
      destination text NOT NULL,
      status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`.catch((e) => {
    tableReady = null;
    throw e;
  });
  return tableReady;
}

const toRow = (r: Record<string, unknown>): RedirectRow => ({
  id: String(r.id),
  source: String(r.source),
  destination: String(r.destination),
  status_code: Number(r.status_code) === 302 ? 302 : 301,
  created_at: toTimestamp(r.created_at) ?? "",
  updated_at: toTimestamp(r.updated_at) ?? "",
});

export const isRedirectId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function listRedirects(): Promise<RedirectRow[]> {
  await ensureRedirectTable();
  const rows = await getSql()`SELECT * FROM redirects ORDER BY created_at DESC`;
  return rows.map(toRow);
}

/** A reason this redirect cannot be stored next to the others, or null. */
function conflict(input: RedirectInput, others: RedirectRow[]): string | null {
  const same = others.find((r) => r.source === input.source);
  if (same) return `There is already a redirect from ${input.source} (to ${same.destination}). Edit that one instead.`;
  const path = internalPath(input.destination);
  if (path) {
    const next = others.find((r) => r.source === path);
    if (next) {
      return `${path} is itself redirected to ${next.destination}. Point straight to ${next.destination} instead: one hop is better for Google.`;
    }
    const builtIn = builtInRedirectFor(path);
    if (builtIn) {
      return `${path} is an old address that the site already redirects to ${builtIn.to}. Point straight to ${builtIn.to} instead.`;
    }
  }
  return null;
}

/**
 * Redirects that pointed at `from` now point at `to`, so an old address never
 * goes through two hops (A → B, then B → C, becomes A → C). Returns how many.
 */
async function flattenChains(from: string, to: string, exceptId: string): Promise<number> {
  const rows = await getSql()`
    UPDATE redirects SET destination = ${to}, updated_at = now()
    WHERE destination = ${from} AND id <> ${exceptId} AND source <> ${to}
    RETURNING id`;
  return rows.length;
}

export type SaveResult = { row: RedirectRow; flattened: number } | { error: string };

export async function createRedirect(input: RedirectInput): Promise<SaveResult> {
  const all = await listRedirects();
  const why = conflict(input, all);
  if (why) return { error: why };
  const [row] = await getSql()`
    INSERT INTO redirects (source, destination, status_code)
    VALUES (${input.source}, ${input.destination}, ${input.statusCode})
    RETURNING *`;
  const created = toRow(row);
  return { row: created, flattened: await flattenChains(input.source, input.destination, created.id) };
}

export async function updateRedirect(id: string, input: RedirectInput): Promise<SaveResult | null> {
  const all = await listRedirects();
  if (!all.some((r) => r.id === id)) return null;
  const why = conflict(
    input,
    all.filter((r) => r.id !== id)
  );
  if (why) return { error: why };
  const [row] = await getSql()`
    UPDATE redirects
    SET source = ${input.source}, destination = ${input.destination}, status_code = ${input.statusCode}, updated_at = now()
    WHERE id = ${id}
    RETURNING *`;
  return { row: toRow(row), flattened: await flattenChains(input.source, input.destination, id) };
}

export async function deleteRedirect(id: string): Promise<boolean> {
  await ensureRedirectTable();
  const rows = await getSql()`DELETE FROM redirects WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
