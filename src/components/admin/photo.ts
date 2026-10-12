/**
 * Photos are made web-ready in the browser before upload (treatment pages):
 * scaled down to the size the page shows and saved as WebP, the format the
 * site's own photos use. A banner also gets its phone version, the 828 × 1000
 * middle cut that PageBanner loads below 768px (as public/images/…-sm.webp).
 */

async function load(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // The decoded image stays usable after the URL is released.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** WebP where the browser can write it, otherwise JPEG. */
async function toFile(canvas: HTMLCanvasElement, name: string, type?: string): Promise<File> {
  let blob = await encode(canvas, type ?? "image/webp", 0.82);
  if (!blob || (type === undefined && blob.type !== "image/webp")) blob = await encode(canvas, "image/jpeg", 0.85);
  if (!blob) throw new Error("This browser could not prepare the photo.");
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${name.replace(/\.[^.]+$/, "") || "photo"}.${ext}`, { type: blob.type });
}

/** The photo at most `maxWidth` wide (never enlarged), as WebP. */
export async function webReady(file: File, maxWidth: number): Promise<File> {
  const img = await load(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return toFile(canvas, file.name);
}

/** The banner's phone version: 828 × 1000 from the middle of the photo, same file type as `like`. */
export async function phoneCut(file: File, like: File): Promise<File> {
  const img = await load(file);
  const W = 828;
  const H = 1000;
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const sw = W / scale;
  const sh = H / scale;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas
    .getContext("2d")!
    .drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, W, H);
  return toFile(canvas, `${file.name.replace(/\.[^.]+$/, "")}-sm`, like.type);
}
