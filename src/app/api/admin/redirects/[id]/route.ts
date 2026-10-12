import { isDatabaseConfigured } from "@/lib/blog/db";
import { denyUnlessAdmin } from "@/lib/blog/session";
import { DATABASE_MISSING } from "@/lib/blog/setup";
import { publishRedirects } from "@/lib/redirects/publish";
import { checkRedirect } from "@/lib/redirects/rules";
import { deleteRedirect, isRedirectId, listRedirects, updateRedirect } from "@/lib/redirects/store";

type Context = { params: Promise<{ id: string }> };

const notFound = () => Response.json({ error: "Redirect not found." }, { status: 404 });
const failed = (e: unknown, fallback: string) =>
  Response.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 });

async function guard({ params }: Context): Promise<Response | string> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured()) return Response.json({ error: DATABASE_MISSING }, { status: 503 });
  const { id } = await params;
  return isRedirectId(id) ? id : notFound();
}

/** PUT — change a redirect. */
export async function PUT(request: Request, context: Context) {
  const id = await guard(context);
  if (id instanceof Response) return id;
  const checked = checkRedirect(await request.json().catch(() => null));
  if ("error" in checked) return Response.json({ error: checked.error }, { status: 400 });
  try {
    const before = (await listRedirects()).find((r) => r.id === id);
    const result = await updateRedirect(id, checked.input);
    if (!result) return notFound();
    if ("error" in result) return Response.json({ error: result.error }, { status: 409 });
    const live = await publishRedirects([result.row.source, ...(before ? [before.source] : [])]);
    return Response.json({ ...result, live });
  } catch (e) {
    return failed(e, "Failed to save the redirect.");
  }
}

/** DELETE — remove a redirect: the old address shows its page again, or the 404 page. */
export async function DELETE(_request: Request, context: Context) {
  const id = await guard(context);
  if (id instanceof Response) return id;
  try {
    const doomed = (await listRedirects()).find((r) => r.id === id);
    if (!doomed || !(await deleteRedirect(id))) return notFound();
    return Response.json({ ok: true, live: await publishRedirects([doomed.source]) });
  } catch (e) {
    return failed(e, "Failed to delete the redirect.");
  }
}
