import Link from "next/link";
import type { ReactNode } from "react";
import SectionShapes from "@/components/ui/SectionShapes";
import { treatmentMenu } from "@/data/navigation";

/**
 * "Seminyak Spa Treatments" on /seminyak/day-spa/ (SEO, 10 Oct): a heading,
 * a line of text, and a link to every treatment page from the menu except
 * `exclude` (the page it is on). A component of its own so the page body can
 * be data (src/content/treatments/day-spa.json) that /admin/ edits.
 *
 * `only` (treatment page addresses) lists just those, in menu order: the
 * five most requested since the copy rewrite (15 Oct), with the text linking
 * to the full price list, instead of the whole menu again.
 */
export default function TreatmentLinks({
  title,
  text,
  exclude,
  only,
  leftShapeSrc,
  rightShapeSrc,
}: {
  title: ReactNode;
  text: ReactNode;
  exclude?: string;
  only?: string[];
  /** Corner decorations (components/ui/SectionShapes.tsx). */
  leftShapeSrc?: string | null;
  rightShapeSrc?: string | null;
}) {
  return (
    <section className="day-spa-links pt-100 pb-100">
      <SectionShapes left={leftShapeSrc} right={rightShapeSrc} />
      <div className="container">
        <div className="section-header center mb-40">
          <h2 className="title">{title}</h2>
          <p>{text}</p>
        </div>
        <ul className="day-spa-links__list">
          {treatmentMenu
            .filter((t) => t.href !== exclude && (!only || only.includes(t.href)))
            .map((t) => (
              <li key={t.href}>
                <Link prefetch={false} href={t.href}>
                  {t.label}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
