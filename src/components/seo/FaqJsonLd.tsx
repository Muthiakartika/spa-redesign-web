import { plainText } from "@/lib/linkedText";
import JsonLd from "./JsonLd";

/**
 * FAQPage structured data for a page's questions (copy rewrite, 15 Oct: the
 * answers are written to stand alone, so search and AI answers can quote
 * them). A question's "1. " number, shown on some pages, is left out, and an
 * answer's [words](/address/) links are given as their words.
 */
export default function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question.replace(/^\d+\.\s+/, ""),
      acceptedAnswer: { "@type": "Answer", text: plainText(answer) },
    })),
  };
  return <JsonLd data={data} />;
}
