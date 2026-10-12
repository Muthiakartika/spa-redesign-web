import { liveRedirects, type OldUrlRedirect } from "@/data/redirects";

/**
 * Redirects the owner adds in /admin/redirects/ (owner, 12 Oct 2026): how an
 * address is written and which ones are allowed. Shared by the admin page
 * (instant hints) and the API (the final say), so no server-only imports.
 *
 * They are answered by src/proxy.ts as soon as they are saved (publish.ts,
 * map.ts). The built-in list in src/data/redirects.ts is answered by
 * next.config.ts and by Cloudflare (tools/cloudflare), before the proxy, so
 * an address on that list cannot be redirected again here.
 */

export type RedirectStatus = 301 | 302;

export type RedirectRow = {
  id: string;
  source: string;
  destination: string;
  status_code: RedirectStatus;
  created_at: string;
  updated_at: string;
};

export type RedirectInput = { source: string; destination: string; statusCode: RedirectStatus };

const SITE_HOSTS = ["spabalimoon.com", "www.spabalimoon.com"];

/** Addresses the website itself needs. */
const RESERVED = ["/admin", "/api", "/_next", "/images", "/webfonts", "/fonts", "/favicon"];

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** "/old-page" → "/old-page/"; a file name ("/old.html") keeps its spelling, as the site's URLs do. */
function withTrailingSlash(path: string) {
  const last = path.split("/").pop() || "";
  return path.endsWith("/") || last.includes(".") ? path : `${path}/`;
}

/** A full address on our own domain becomes its path; anything else is returned as typed. */
function ownPath(value: string): string | null {
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    return SITE_HOSTS.includes(url.host.toLowerCase()) ? url.pathname + url.search + url.hash : null;
  } catch {
    return null;
  }
}

/**
 * The built-in redirect (src/data/redirects.ts) that already answers `path`,
 * matching the way Cloudflare's Bulk Redirect list does: the old address
 * itself and everything below it.
 */
export function builtInRedirectFor(path: string): OldUrlRedirect | null {
  const target = trimSlash(path);
  for (const r of liveRedirects) {
    const pattern = r.from.includes(":");
    const base = pattern ? r.from.replace(/\/:[a-z]+\/?$/i, "") : trimSlash(r.from);
    if (target !== base && !target.startsWith(`${base}/`)) continue;
    // "/news/:slug/" → "/guide/:slug/": name the actual address, e.g. /guide/abc/.
    const rest = target.slice(base.length);
    return pattern && rest ? { from: path, to: withTrailingSlash(r.to.replace(/\/:[a-z]+\/?$/i, "") + rest) } : r;
  }
  return null;
}

type Checked = { value: string } | { error: string };

/** The old address, cleaned up: a path on spabalimoon.com ending in "/". */
export function normalizeSource(raw: string): Checked {
  let value = raw.trim();
  if (!value) return { error: "Enter the old address." };
  if (/^https?:\/\//i.test(value)) {
    const path = ownPath(value);
    if (path === null) return { error: "The old address must be on spabalimoon.com." };
    value = path;
  }
  if (!value.startsWith("/")) value = `/${value}`;
  if (/[?#]/.test(value)) return { error: "Leave out the part after ? or #. A redirect matches the page address only." };
  if (!/^[A-Za-z0-9\-._~/%]+$/.test(value)) {
    return { error: "The old address may only use letters, numbers and - _ . / (no spaces)." };
  }
  value = withTrailingSlash(value.replace(/\/{2,}/g, "/"));
  if (value === "/") return { error: "The homepage cannot be redirected." };
  if (RESERVED.some((r) => value === `${r}/` || value.startsWith(`${r}/`) || value.startsWith(`${r}.`))) {
    return { error: "This address belongs to the website itself and cannot be redirected." };
  }
  const builtIn = builtInRedirectFor(value);
  if (builtIn) {
    return {
      error: `This address is already redirected by the site's built-in list (to ${builtIn.to}). That list also lives in Cloudflare, so it cannot be changed here.`,
    };
  }
  return { value };
}

/** The new address: a path on this site (ending in "/") or a full https:// address elsewhere. */
export function normalizeDestination(raw: string): Checked {
  let value = raw.trim();
  if (!value) return { error: "Enter the new address." };
  if (/\s/.test(value)) return { error: "The new address cannot contain spaces." };
  const own = ownPath(value);
  if (own !== null) value = own;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (/[():*]/.test(url.pathname)) return { error: "The new address contains a character that is not allowed: ( ) : *" };
      return { value: url.toString() };
    } catch {
      return { error: "The new address is not a valid web address." };
    }
  }
  if (!value.startsWith("/")) value = `/${value}`;
  const url = new URL(value, "https://spabalimoon.com");
  if (/[():*]/.test(url.pathname)) return { error: "The new address contains a character that is not allowed: ( ) : *" };
  return { value: withTrailingSlash(url.pathname.replace(/\/{2,}/g, "/")) + url.search + url.hash };
}

/** Check and clean a whole redirect: { input } ready to store, or { error }. */
export function checkRedirect(body: unknown): { input: RedirectInput } | { error: string } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const source = normalizeSource(typeof b.source === "string" ? b.source : "");
  if ("error" in source) return source;
  const destination = normalizeDestination(typeof b.destination === "string" ? b.destination : "");
  if ("error" in destination) return destination;
  if (destination.value.split(/[?#]/)[0] === source.value) return { error: "The new address is the same as the old one." };
  const statusCode = Number(b.statusCode) === 302 ? 302 : 301;
  return { input: { source: source.value, destination: destination.value, statusCode } };
}

/** The path part of an internal destination, or null for an address on another site. */
export const internalPath = (destination: string) =>
  destination.startsWith("/") ? destination.split(/[?#]/)[0] : null;
