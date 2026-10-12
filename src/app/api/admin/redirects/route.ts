import { isDatabaseConfigured } from "@/lib/blog/db";
import { denyUnlessAdmin } from "@/lib/blog/session";
import { DATABASE_MISSING } from "@/lib/blog/setup";
import { publishRedirects } from "@/lib/redirects/publish";
import { checkRedirect } from "@/lib/redirects/rules";
import { createRedirect, listRedirects } from "@/lib/redirects/store";

const failed = (e: unknown, fallback: string) =>
  Response.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 });

async function guard(): Promise<Response | null> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured()) return Response.json({ error: DATABASE_MISSING }, { status: 503 });
  return null;
}

/** GET — every redirect added in the admin, newest first. */
export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    return Response.json({ redirects: await listRedirects() });
  } catch (e) {
    return failed(e, "Failed to load the redirects.");
  }
}

/** POST — add a redirect; it is live on the website within about half a minute. */
export async function POST(request: Request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const checked = checkRedirect(await request.json().catch(() => null));
  if ("error" in checked) return Response.json({ error: checked.error }, { status: 400 });
  try {
    const result = await createRedirect(checked.input);
    if ("error" in result) return Response.json({ error: result.error }, { status: 409 });
    const live = await publishRedirects([result.row.source]);
    return Response.json({ ...result, live }, { status: 201 });
  } catch (e) {
    return failed(e, "Failed to save the redirect.");
  }
}
