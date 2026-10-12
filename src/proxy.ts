import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { fetchPublishedMap, type RedirectMap } from "@/lib/redirects/map";

/**
 * Redirects added in /admin/redirects/, live as soon as they are saved, no
 * deploy needed. The list is the small JSON file the admin publishes
 * (lib/redirects/map.ts), kept in memory and refreshed in the background
 * every 30 seconds, so a visit costs one in-memory lookup: no database call.
 * The built-in redirects (src/data/redirects.ts) are answered earlier, by
 * next.config.ts and Cloudflare.
 */

const REFRESH_MS = 30_000;

let current: { map: RedirectMap; at: number } | null = null;
let loading: Promise<RedirectMap> | null = null;

function refresh(): Promise<RedirectMap> {
  loading ??= fetchPublishedMap()
    .then((map) => {
      // Unreadable: keep answering with the last good list.
      const next = map ?? current?.map ?? {};
      current = { map: next, at: Date.now() };
      return next;
    })
    .catch(() => current?.map ?? {})
    .finally(() => {
      loading = null;
    });
  return loading;
}

async function redirectMap(event: NextFetchEvent): Promise<RedirectMap> {
  if (!current) return refresh(); // first request of this instance
  if (Date.now() - current.at > REFRESH_MS) event.waitUntil(refresh());
  return current.map;
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const hit = (await redirectMap(event))[request.nextUrl.pathname];
  if (!hit) return NextResponse.next();
  const [destination, status] = hit;
  const target = new URL(destination, request.nextUrl.origin);
  // Like next.config redirects: the visitor's ?query goes along (utm tags…).
  if (!target.search && request.nextUrl.search) target.search = request.nextUrl.search;
  return NextResponse.redirect(target, status === 302 ? 302 : 301);
}

export const config = {
  // Pages only: not Next's own files, the API, the admin, or site assets.
  matcher: [
    "/((?!_next/|api/|admin/|images/|webfonts/|.*\.(?:css|js|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|txt|xml|json|webmanifest)$).*)",
  ],
};
