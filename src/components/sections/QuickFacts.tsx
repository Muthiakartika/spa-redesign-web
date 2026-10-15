import { Fragment, type ReactNode } from "react";

export type QuickFact = { label: string; value: string };

/** "October 15, 2026", as the guide articles print dates (Bali time). */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Makassar" });

/**
 * "1 hour IDR 300.000 · 1.5 hours IDR 440.000 · …": a line breaks between the
 * parts, not inside "IDR / 580.000". Long parts may still wrap (phones).
 */
function FactValue({ value }: { value: string }) {
  // "IDR" never ends a line without its amount.
  const parts = value.replace(/IDR /g, "IDR\u00a0").split(" · ");
  // The dot stays with the part before it; the line may break after it.
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span className={part.length <= 32 ? "quick-facts__part" : undefined}>
        {part}
        {i < parts.length - 1 ? " ·" : null}
      </span>
    </Fragment>
  ));
}

/**
 * The answer-first block under a treatment page's banner (copy rewrite,
 * 15 Oct): an opening paragraph that names the spa, Seminyak, the price and
 * the options, then the quick facts (treatment, length and price, where,
 * booking) as a short list that search and AI answers can lift as it is.
 * No heading of its own, so the page's headings stay as they were.
 */
export default function QuickFacts({
  text,
  items = [],
  updated,
}: {
  text?: ReactNode;
  items?: QuickFact[];
  /** When the page last changed (ISO), shown under the facts. */
  updated?: string;
}) {
  return (
    <section className="quick-facts">
      <div className="container">
        <div className="quick-facts__inner">
          {text ? (
            <p className="quick-facts__lead">{typeof text === "string" ? text.replace(/IDR /g, "IDR ") : text}</p>
          ) : null}
          {items.length > 0 && (
            <div className="quick-facts__card">
              <p className="quick-facts__label">Quick facts</p>
              <dl className="quick-facts__list">
                {items.map((item) => (
                  <div key={item.label} className="quick-facts__row">
                    <dt>{item.label}</dt>
                    <dd>
                      <FactValue value={item.value} />
                    </dd>
                  </div>
                ))}
              </dl>
              {updated ? (
                <p className="quick-facts__updated">
                  Last updated <time dateTime={updated}>{formatDate(updated)}</time>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
