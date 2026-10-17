import Link from "next/link";
import { answerParts } from "@/data/guide/answers";

/**
 * The short answer above a guide article's text (src/data/guide/answers.ts,
 * AEO roadmap, 17 Oct): two sentences that name Spa Bali Moon, with the
 * price and links to the treatment page.
 *
 * The look, picked from three options (17 Oct), is a magazine's standfirst:
 * no box, "THE SHORT ANSWER" in small gold capitals, the answer in larger
 * light serif type, a hairline under it.
 */
export default function GuideAnswer({ text }: { text: string }) {
  return (
    <aside className="guide-answer">
      <p className="guide-answer__label">The short answer</p>
      <p className="guide-answer__text">
        {answerParts(text).map((part, i) =>
          typeof part === "string" ? (
            part
          ) : (
            <Link key={i} prefetch={false} href={part.href}>
              {part.text}
            </Link>
          )
        )}
      </p>
    </aside>
  );
}
