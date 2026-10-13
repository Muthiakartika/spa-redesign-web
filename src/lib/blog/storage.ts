import { AwsClient } from "aws4fetch";

/**
 * Uploaded blog images (covers and in-article photos) go to a Cloudflare R2
 * bucket through its S3-compatible API. Settings, all server-only:
 *
 *   R2_ACCOUNT_ID         Cloudflare account id (R2 overview page)
 *   R2_ACCESS_KEY_ID      R2 API token: access key id
 *   R2_SECRET_ACCESS_KEY  R2 API token: secret access key
 *   R2_BUCKET             bucket name, e.g. spabalimoon-blog
 *   R2_PUBLIC_URL         where the bucket is public: its r2.dev address or
 *                         a custom domain, e.g. https://images.spabalimoon.com
 *   R2_ENDPOINT           optional; only for EU/FedRAMP buckets, whose API
 *                         address differs from <account>.r2.cloudflarestorage.com
 */

export function isStorageConfigured(): boolean {
  const env = process.env;
  return Boolean(
    (env.R2_ACCOUNT_ID || env.R2_ENDPOINT) &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET &&
      env.R2_PUBLIC_URL
  );
}

let client: AwsClient | null = null;

/** Store `body` under `key` (e.g. "blog/1790-photo.webp") and return its public URL. */
export async function putImage(key: string, body: Uint8Array<ArrayBuffer>, contentType: string): Promise<string> {
  // File names are unique per upload, so browsers and Cloudflare may keep them for good.
  return putObject(key, body, contentType, "public, max-age=31536000, immutable");
}

/** Store any file in the bucket, with its own Cache-Control, and return its public URL. */
export async function putObject(
  key: string,
  body: Uint8Array<ArrayBuffer>,
  contentType: string,
  cacheControl: string
): Promise<string> {
  if (!isStorageConfigured()) throw new Error("Image storage is not configured: set the R2_* variables.");
  const env = process.env;
  client ??= new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
  const endpoint = (env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/$/, "");
  const signed = await client.sign(`${endpoint}/${env.R2_BUCKET}/${key}`, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType, "Cache-Control": cacheControl },
  });
  // Sent as url + init with the bytes themselves, not as the signed Request:
  // Next's fetch rebuilds a Request around its body stream, which drops
  // Content-Length, and R2 refuses a PUT without it.
  const res = await fetch(signed.url, { method: "PUT", headers: signed.headers, body });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).match(/<Message>([^<]*)<\/Message>/)?.[1];
    throw new Error(`R2 upload failed: ${detail || `HTTP ${res.status}`}`);
  }
  return `${env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}
