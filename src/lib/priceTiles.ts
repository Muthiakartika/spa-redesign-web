/** A quick-facts price line read as one price per session length. */
export type PriceTiles = { caption?: string; tiles: { length: string; amount: string }[] };

/**
 * "Per person: 1 hour IDR 159.000 · 1.5 hours IDR 239.000 · 2 hours IDR
 * 330.000" -> its caption ("Per person") and one entry per length, or null
 * when the value is not a list of lengths and prices (the admin's words).
 */
export function priceTiles(value: string): PriceTiles | null {
  const colon = /^([^:·]+):\s*(.+)$/.exec(value);
  const parts = (colon ? colon[2] : value).split(" · ").map((part) => /^(.+?)\s+IDR\s+([\d.]+)$/.exec(part.trim()));
  if (parts.length < 2 || parts.some((p) => !p)) return null;
  return { caption: colon?.[1], tiles: parts.map((p) => ({ length: p![1], amount: p![2] })) };
}
