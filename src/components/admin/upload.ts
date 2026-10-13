import { webReady } from "./photo";

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
  // Vercel turns away a body over 4.5MB itself, as plain text, before the route runs.
  if (res.status === 413) throw new Error("The photo is too large to upload: it must be 4MB or smaller.");
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return { url: data.url as string, path: data.path as string };
}

/**
 * Upload one article image (cover or in-text photo) and return its public URL.
 * It is made web-ready first, at most `maxWidth` wide as WebP, so a photo
 * straight from a camera or phone fits the upload limit. A GIF goes as it is,
 * to keep its animation.
 */
export async function uploadImage(file: File, maxWidth = 1200): Promise<string> {
  const photo = file.type === "image/gif" ? file : await webReady(file, maxWidth);
  return (await uploadPhoto(photo)).url;
}
