import type { MenuTab } from "@/components/home/MenuDurations";
import type { CatalogOption } from "@/data/pages/home-catalog";
import type { PriceOption, PricedService } from "@/data/pages/pricelist";
import { priceList } from "@/data/pricelist";

/** Names a price page writes differently from src/data/pricelist.ts. */
const PAGE_OF_NAME: Record<string, string> = {
  "Sports Massage": "sport-massage",
  "Couple Package A": "couple-spa",
  "Couple Package B": "couple-spa",
  "Couple Package C": "couple-spa",
  "Couple Package D": "couple-spa",
};

/**
 * The treatment page of a price row, by the name the price page gives it
 * (AEO roadmap R25, 17 Oct: the price hub links to every treatment page).
 * Undefined for treatments without a page of their own (aromatherapy, back
 * massage, …).
 */
export function treatmentHref(name: string): string | undefined {
  const slug =
    PAGE_OF_NAME[name] ??
    priceList.find((p) => p.pricelistName === name || p.homeServiceName === name || p.homeName === name)?.pageSlug;
  return slug ? `/seminyak/${slug}/` : undefined;
}

/**
 * A duration followed by the treatment again ("1 Hour · Balinese Massage ·
 * 2 Pax", "1 Hour – Four Hand Warm Candle") is just that duration. Without a
 * separator ("1 Hour Aloe Vera") it is a variant, and with a "+" (a couple
 * package: "1.5 Hours – Balinese Massage + Ear Candle") it says what is
 * included; both stay as written.
 */
const RESTATED = /^(\d+(?:\.\d+)?\s*(?:Hours?|Minutes?))\s+[·–-]\s+([^+]+)$/i;

/** "1 Hour · Balinese Massage · 2 Pax" -> "1 Hour · 2 pax", the form the menu reads durations from. */
function toOption({ time, price }: PriceOption): CatalogOption {
  const m = RESTATED.exec(time.trim());
  return { label: m ? `${m[1]}${/2 pax/i.test(m[2]) ? " · 2 pax" : ""}` : time, price };
}

/**
 * A one-price treatment's line under its description: its benefits (the
 * facials' descriptions end in "Benefits:"), or what the price is for ("30
 * Minutes", a couple package's contents). "Price" says nothing, so no line.
 */
function details(service: PricedService, options: CatalogOption[]): CatalogOption[] {
  if (options.length !== 1) return options;
  const [only] = options;
  const label = only.label.replace(/\s*·\s*2 pax$/i, "");
  const lines = service.benefits?.length ? service.benefits : /^price$/i.test(label) ? [] : [label];
  return [{ ...only, details: lines }];
}

/**
 * A price page's tabs (the live data in src/data/pages/pricelist.ts and the
 * outcall page) as tabs for the duration price list (MenuDurations): same
 * treatments, texts and prices, in the page's own order. A treatment listed
 * under another (`children`) shows as a line under it.
 */
export function menuTabs(tabs: { label: string; services: PricedService[] }[], plainTitles: string[] = []): MenuTab[] {
  return tabs.map((tab) => {
    const id = tab.label.toLowerCase().replace(/\W+/g, "-");
    return {
      id,
      label: tab.label,
      plainTitles: plainTitles.includes(tab.label) || undefined,
      items: tab.services.map((service) => ({
        id: `${id}-${service.id}`,
        name: service.name,
        href: treatmentHref(service.name),
        image: service.image,
        desc: service.desc ?? "",
        options: details(service, (service.options ?? []).map(toOption)),
        children: service.children?.map((child) => ({ name: child.name, options: child.options.map(toOption) })),
      })),
    };
  });
}
