import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import JsonLd from "@/components/seo/JsonLd";
import TreatmentBody from "@/components/treatments/TreatmentBody";
import { treatments } from "@/data/treatments";
import { treatmentSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { getTreatmentContent } from "@/lib/treatments/content";
import { faqItems, insertBefore, withProps, type TreeNode } from "@/lib/treatments/tree";

/**
 * Treatment pages: /seminyak/balinese-massage/, /seminyak/facial/, …
 *
 * The body of each page is an element tree built from the live page and made
 * of the shared live sections: the built-in one in src/content/treatments/,
 * or the version edited in /admin/treatments/ (lib/treatments/content.ts).
 * Titles and descriptions: src/data/treatments/<slug>.ts, or the edited ones.
 */
type Props = { params: Promise<{ slug: string }> };

/**
 * How the "Visit us" heading ("Where Can I Book … in Seminyak?") and the
 * Service data name a treatment, where its menu name does not read well there.
 */
const NAMES: Record<string, { heading: string; service: string }> = {
  "body-scrub": { heading: "a Body Scrub", service: "Body Scrub" },
  "couple-spa": { heading: "a Couples Massage", service: "Couples Massage" },
  creambath: { heading: "a Cream Bath", service: "Cream Bath" },
  "day-spa": { heading: "a Day Spa Visit", service: "Day Spa" },
  "ear-candle": { heading: "an Ear Candle Treatment", service: "Ear Candle Treatment" },
  facial: { heading: "a Facial", service: "Facial" },
  "lymphatic-drainage-massage": { heading: "Lymphatic Drainage Massage", service: "Lymphatic Drainage Massage" },
  "manicure-pedicure": { heading: "a Manicure and Pedicure", service: "Manicure and Pedicure" },
  "nail-spa": { heading: "Gel Nails and Nail Art", service: "Gel Nails and Nail Art" },
  "sunburn-massage": { heading: "a Sunburn Treatment", service: "Sunburn Treatment (Aloe Vera Massage)" },
};

/**
 * Corner decorations for the sections the page data leaves bare: every
 * section of a treatment page has its leaves or flowers, on laptops too
 * (owner, 17 Oct). Placed in decorations.css; "Visit us" brings its own.
 */
const SHAPES: Record<string, { leftShapeSrc: string; rightShapeSrc: string }> = {
  QuickFacts: {
    leftShapeSrc: "/images/shape/feature-six-shape.png",
    rightShapeSrc: "/images/shape/service-shape-right.png",
  },
  FaqSection: { leftShapeSrc: "/images/shape/banner-five-shape1.png", rightShapeSrc: "/images/shape/leaf/10a.png" },
  ReserveCta: {
    leftShapeSrc: "/images/shape/banner-six-shape2.png",
    rightShapeSrc: "/images/shape/step-shape-left.png",
  },
  TreatmentLinks: {
    leftShapeSrc: "/images/shape/banner-three-shape.png",
    rightShapeSrc: "/images/shape/service-four-shape-right.png",
  },
};

/** The banner photo, for the Service data. */
function bannerImage(tree: TreeNode): string | undefined {
  if (tree.type === "PageBanner" && typeof tree.props?.image === "string") return tree.props.image;
  for (const child of tree.children ?? []) {
    const found = typeof child === "string" ? undefined : bannerImage(child);
    if (found) return found;
  }
  return undefined;
}

// Built once and kept until the page is saved in /admin/ (which rebuilds it),
// as the guide pages. A database error is thrown on purpose: Next then keeps
// serving the last good page instead of the built-in version.
export const revalidate = false;

export function generateStaticParams() {
  return treatments.map((treatment) => ({ slug: treatment.slug }));
}

// Any other /seminyak/<something>/ address shows the 404 page through
// notFound() below. Not `dynamicParams = false`: with it, `next start`
// answered 404 for a page right after the admin had refreshed it (Next 16.3:
// the refreshed page counts as "not prerendered" and has no fallback).

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getTreatmentContent(slug);
  if (!content) return {};
  return buildMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: `/seminyak/${slug}/`,
  });
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params;
  const content = await getTreatmentContent(slug);
  if (!content) notFound();
  const names = NAMES[slug] ?? { heading: content.name, service: content.name };
  // The quick facts end with the date the page last changed; "Visit us"
  // (AEO roadmap, 17 Oct) sits before the related treatments.
  const decorated = Object.entries(SHAPES).reduce(
    (t, [type, props]) => withProps(t, type, props),
    withProps(content.tree, "QuickFacts", { updated: content.updatedAt }),
  );
  const visited = insertBefore(decorated, ["ServiceSlider", "TreatmentLinks"], {
    type: "VisitUs",
    props: { treatment: names.heading },
  });
  // "treatment-page" scopes the laptop decoration rules (decorations.css).
  const className = typeof visited.props?.className === "string" ? visited.props.className : "";
  const tree = { ...visited, props: { ...visited.props, className: `${className} treatment-page`.trim() } };
  return (
    <>
      <JsonLd
        data={treatmentSchema({
          slug,
          name: names.service,
          description: content.seo.description,
          image: bannerImage(content.tree),
        })}
      />
      <FaqJsonLd items={faqItems(content.tree)} />
      <TreatmentBody tree={tree} />
    </>
  );
}
