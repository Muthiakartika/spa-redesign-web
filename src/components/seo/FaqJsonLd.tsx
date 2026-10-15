/**
 * FAQPage structured data for a page's questions (copy rewrite, 15 Oct: the
 * answers are written to stand alone, so search and AI answers can quote
 * them). A question's "1. " number, shown on some pages, is left out.
 */
export default function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question.replace(/^\d+\.\s+/, ""),
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
