// ⚠️  Copied from the live sitemap (spabalimoon.com/sitemap.xml), in its order.

/**
 * SITEMAP: every page except the guide articles, which
 * src/app/sitemap.xml/route.ts adds from the blog database after these.
 * Add a new page here, with the date it last changed and its main photo.
 */
export type SitemapEntry = { loc: string; lastmod: string; image?: string };

export const sitemapPages: SitemapEntry[] = [
  { loc: "https://spabalimoon.com/", lastmod: "2026-07-08T01:37:02+00:00" },
  { loc: "https://spabalimoon.com/contact/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/contact.webp" },
  { loc: "https://spabalimoon.com/guide/", lastmod: "2026-07-06T08:14:14+00:00", image: "https://spabalimoon.com/images/blog/blog-1.webp" },
  { loc: "https://spabalimoon.com/massage-kuta/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/massage-kuta.webp" },
  { loc: "https://spabalimoon.com/outcall-home-service-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/outcall-home-service-massage.webp" },
  { loc: "https://spabalimoon.com/privacy-policy/", lastmod: "2026-03-24T07:03:50+00:00", image: "https://spabalimoon.com/images/bg/page-title-bg.jpg" },
  { loc: "https://spabalimoon.com/reservation/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/reservation.webp" },
  { loc: "https://spabalimoon.com/seminyak/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/pricelist.webp" },
  { loc: "https://spabalimoon.com/seminyak/anti-cellulite-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/anti-cellulite-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/balinese-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/balinese-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/body-scrub/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/body-scrub.webp" },
  { loc: "https://spabalimoon.com/seminyak/coconut-oil-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/coconut-oil-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/couple-spa/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/couple-spa.webp" },
  { loc: "https://spabalimoon.com/seminyak/creambath/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/creambath.webp" },
  { loc: "https://spabalimoon.com/seminyak/day-spa/", lastmod: "2026-07-06T06:39:18+00:00", image: "https://spabalimoon.com/images/services/dayspaseminyak/dayspa-1.webp" },
  { loc: "https://spabalimoon.com/seminyak/deep-tissue-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/deep-tissue-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/ear-candle/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/ear-candle.webp" },
  { loc: "https://spabalimoon.com/seminyak/facial/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/facial.webp" },
  { loc: "https://spabalimoon.com/seminyak/foot-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/foot-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/foot-reflexology/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/foot-reflexology.webp" },
  { loc: "https://spabalimoon.com/seminyak/hair-braiding/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/hair-braiding.webp" },
  { loc: "https://spabalimoon.com/seminyak/head-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/head-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/hot-stone-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/hot-stone-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/lymphatic-drainage-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/lymphatic-drainage-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/manicure-pedicure/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/manicure-pedicure.webp" },
  { loc: "https://spabalimoon.com/seminyak/nail-spa/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/nail-spa.webp" },
  { loc: "https://spabalimoon.com/seminyak/shiatsu-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/shiatsu-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/sport-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/sport-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/sunburn-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/sunburn-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/thai-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/thai-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/traditional-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/traditional-massage.webp" },
  { loc: "https://spabalimoon.com/seminyak/waxing-salon/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/waxing-salon.webp" },
  { loc: "https://spabalimoon.com/terms-and-conditions/", lastmod: "2026-03-24T07:00:23+00:00", image: "https://spabalimoon.com/images/bg/page-title-bg.jpg" },
  { loc: "https://spabalimoon.com/villa-hotel-massage/", lastmod: "2026-10-15T00:00:00+00:00", image: "https://spabalimoon.com/images/banners/villa-hotel-massage.webp" },
];
