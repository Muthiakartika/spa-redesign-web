/**
 * Structured data (schema.org JSON-LD) shared by the pages (AEO roadmap,
 * 17 Oct 2026). Search engines and AI answers read the business facts here
 * the same way the visitor reads them on the page.
 *
 *   spaSchema()          the spa itself, on every page (src/app/(site)/layout.tsx)
 *   treatmentSchema()    Service + Offers in IDR + breadcrumb, treatment pages
 *   homeServiceSchema()  Service with the areas served, outcall and villa pages
 *   articleSchema()      Article + breadcrumb, guide articles
 *
 * Other blocks point at the spa by its @id instead of repeating it.
 */
import { business } from "@/data/business";
import { priceList } from "@/data/pricelist";
import { home } from "@/data/pages/home";
import { absoluteUrl } from "@/lib/seo";

export const SPA_ID = `${business.url}/#spa`;

const provider = { "@id": SPA_ID };

/** Home service areas, as the outcall page lists them. */
export const homeServiceAreas = {
  near: ["Seminyak", "Petitenget", "Kerobokan", "Canggu", "North Kuta"],
  further: ["Kuta", "Jimbaran", "Uluwatu", "Nusa Dua", "Sanur", "Denpasar", "Ubud"],
};

/** The spa: DaySpa with address, phone, map position, hours, prices and profiles. */
export function spaSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "DaySpa",
    "@id": SPA_ID,
    name: business.name,
    url: business.url,
    image: absoluteUrl("/images/home/homepage-1.webp"),
    logo: absoluteUrl("/images/logo/sbm.webp"),
    description: home.seo.description,
    foundingDate: String(business.foundedYear),
    telephone: business.phoneDisplay,
    // TODO CONTACT-01: the old homepage schema's email, kept until the owner confirms one.
    email: "info@spabalimoon.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${business.address.street}, Petitenget`,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    // Where Google Maps places the spa (the /contact/ map).
    geo: { "@type": "GeoCoordinates", latitude: -8.6780657, longitude: 115.1607164 },
    hasMap: business.mapsUrl,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: business.openingHours.opens,
      closes: business.openingHours.closes,
    },
    // Lowest and highest prices on the spa menu (the highest is for two guests).
    priceRange: "IDR 69.000 – IDR 999.000",
    currenciesAccepted: "IDR",
    paymentAccepted: business.acceptedPayments.join(", "),
    areaServed: [...homeServiceAreas.near, ...homeServiceAreas.further].map((name) => ({
      "@type": "Place",
      name: `${name}, Bali`,
    })),
    // TODO (roadmap R9): add the Google Business Profile and TripAdvisor links once the owner sends them.
    sameAs: [business.social.facebook, business.social.instagram],
    // TODO (roadmap R11): the live homepage's rating. Keep it equal to the Google profile, or remove it.
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.2,
      reviewCount: 193,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

type Crumb = { name: string; path: string };

function breadcrumb(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

const amount = (price: number) => String(price);

/** "1 Hour · Balinese Massage · 2 Pax" -> "1 hour, for two". */
const offerLabel = (label: string) => {
  const forTwo = /2 pax/i.test(label);
  const time = label.split(/\s+[·–-]\s+/)[0].replace(/\bHours?\b|\bMinutes?\b/g, (w) => w.toLowerCase());
  return forTwo ? `${time}, for two` : time;
};

/**
 * Prices of the pages whose treatments have no row of their own in
 * src/data/pricelist.ts, as their quick facts state them.
 */
const PAGE_OFFERS: Record<string, { name: string; price: number }[]> = {
  "hair-braiding": [
    { name: "Hair braiding, short hair", price: 279_000 },
    { name: "Hair braiding, medium hair", price: 379_000 },
    { name: "Hair braiding, long hair", price: 469_000 },
  ],
  "nail-spa": [
    { name: "Manicure with colour", price: 159_000 },
    { name: "Pedicure with colour", price: 169_000 },
    { name: "Nail gel, hands or feet", price: 219_000 },
  ],
};

function offersFor(slug: string, url: string) {
  const fromPriceList = priceList
    .filter((item) => item.pageSlug === slug)
    .flatMap((item) =>
      item.options
        .filter((o) => !/start from/i.test(o.label))
        .map((o) => ({
          name: `${item.pricelistName ?? item.id} – ${o.label === "Price" ? "per person" : offerLabel(o.label)}`,
          price: o.price,
        }))
    );
  const offers = fromPriceList.length ? fromPriceList : (PAGE_OFFERS[slug] ?? []);
  return offers.map((o) => ({
    "@type": "Offer",
    name: o.name,
    price: amount(o.price),
    priceCurrency: "IDR",
    url,
    seller: provider,
  }));
}

/** A treatment page: the Service with its prices, and where it sits in the site. */
export function treatmentSchema({
  slug,
  name,
  description,
  image,
}: {
  slug: string;
  name: string;
  description: string;
  image?: string;
}) {
  const path = `/seminyak/${slug}/`;
  const url = absoluteUrl(path);
  const offers = offersFor(slug, url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        serviceType: name,
        description,
        url,
        ...(image ? { image: absoluteUrl(image) } : {}),
        provider,
        areaServed: { "@type": "Place", name: "Seminyak, Bali" },
        ...(offers.length ? { offers } : {}),
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Price List", path: "/seminyak/" },
        { name, path },
      ]),
    ],
  };
}

/** The outcall and villa pages: home service, with the areas it reaches. */
export function homeServiceSchema({
  path,
  name,
  description,
  areas,
}: {
  path: string;
  name: string;
  description: string;
  areas: string[];
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        serviceType: "Home service massage",
        description,
        url,
        provider,
        areaServed: areas.map((area) => ({ "@type": "Place", name: `${area}, Bali` })),
        offers: {
          "@type": "Offer",
          name: "Home service fee, per therapist",
          price: amount(business.homeService.feePerTherapist),
          priceCurrency: "IDR",
          url,
          seller: provider,
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name, path },
      ]),
    ],
  };
}

/** A guide article. */
export function articleSchema({
  slug,
  title,
  description,
  image,
  author,
  publishedAt,
  updatedAt,
}: {
  slug: string;
  title: string;
  description?: string | null;
  image?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}) {
  const path = `/guide/${slug}/`;
  const url = absoluteUrl(path);
  const byline = author?.trim() || business.name;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        ...(description ? { description } : {}),
        url,
        mainEntityOfPage: url,
        ...(image ? { image: absoluteUrl(image) } : {}),
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(updatedAt || publishedAt ? { dateModified: updatedAt || publishedAt } : {}),
        // The articles are written by the spa; a person's name, when one is set in the admin, is shown as such.
        author: byline === business.name ? provider : { "@type": "Person", name: byline },
        publisher: provider,
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Guide", path: "/guide/" },
        { name: title, path },
      ]),
    ],
  };
}
