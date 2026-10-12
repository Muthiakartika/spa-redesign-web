/** Upload one image through /api/admin/upload/ and return its public URL (and its key in the bucket). */
export async function uploadPhoto(
  file: File,
  { folder, pairKey }: { folder?: "blog" | "treatments"; pairKey?: string } = {}
): Promise<{ url: string; path: string }> {
  const headers: Record<string, string> = {
    "Content-Type": file.type,
    // Encoded: a header may only carry Latin-1, and file names can hold anything.
    "x-filename": encodeURIComponent(file.name),
  };
  if (folder) headers["x-folder"] = folder;
  if (pairKey) headers["x-pair-key"] = pairKey;
  const res = await fetch("/api/admin/upload/", { method: "POST", headers, body: file });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return { url: data.url as string, path: data.path as string };
}

/** Upload one image through /api/admin/upload/ and return its public URL. */
export async function uploadImage(file: File): Promise<string> {
  return (await uploadPhoto(file)).url;
}
