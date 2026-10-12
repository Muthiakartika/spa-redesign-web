import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TreatmentBody from "@/components/treatments/TreatmentBody";
import { treatments } from "@/data/treatments";
import { buildMetadata } from "@/lib/seo";
import { getTreatmentContent } from "@/lib/treatments/content";

/**
 * Treatment pages: /seminyak/balinese-massage/, /seminyak/facial/, …
 *
 * The body of each page is an element tree built from the live page and made
 * of the shared live sections: the built-in one in src/content/treatments/,
 * or the version edited in /admin/treatments/ (lib/treatments/content.ts).
 * Titles and descriptions: src/data/treatments/<slug>.ts, or the edited ones.
 */
type Props = { params: Promise<{ slug: string }> };

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
  return <TreatmentBody tree={content.tree} />;
}
