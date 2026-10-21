import type { CatalogOption } from "@/data/pages/home-catalog";
import { displayPrice, priceValue } from "@/lib/price";

export { displayPrice, priceValue };

/** The drafts (/home-v2/, /home-v4/) stay as they were, without the currency: "IDR 250.000" -> "250.000". */
export const shortPrice = (price: string) => price.replace(/^IDR\s*/i, "");

/** Add-ons ("Additional Body Mask") are not what a treatment starts from. */
const isAddOn = (option: CatalogOption) => /^additional\b/i.test(option.label);

/** The option a treatment starts from: its cheapest, add-ons left out. */
export function startingOption(options: CatalogOption[]): CatalogOption {
  const priced = options.filter((o) => !isAddOn(o));
  return (priced.length ? priced : options).reduce((a, b) => (priceValue(b.price) < priceValue(a.price) ? b : a));
}

/**
 * Minutes of a plain duration option: "1 Hour" -> 60, "1.5 Hours · 2 pax" ->
 * 90, "30 Minutes" -> 30. Anything else ("1 Hour with Aloe Vera",
 * "Chocolate") -> null.
 */
export function durationOf(label: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*(Hours?|Minutes?)(?:\s*·\s*2 pax)?$/i.exec(label.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return /^min/i.test(m[2]) ? n : n * 60;
}

/** 30 -> "30 Mins", 60 -> "60 Mins", 90 -> "90 Mins", 120 -> "120 Mins": always minutes (owner, 21 Oct). */
export const durationLabel = (minutes: number) => `${minutes} Mins`;
