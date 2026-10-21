import Link from "next/link";
import type { ReactNode } from "react";

/** A link written in a text as [words](/address/). */
const LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/**
 * A text with [words](/address/) links, as React: strings and links in order.
 * An address that starts with # (a jump on the same page) is a plain <a>.
 * A text without links comes back as the same string.
 *
 * Used where the text is stored as a string (FAQ answers, the homepage hero):
 * the same way treatment pages write links in their paragraphs
 * (lib/treatments/tree.ts) and the guide answers (data/guide/answers.ts).
 */
export function linkedText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, words, href] = m;
    parts.push(
      href.startsWith("#") ? (
        <a key={m.index} href={href}>
          {words}
        </a>
      ) : (
        <Link key={m.index} prefetch={false} href={href}>
          {words}
        </Link>
      )
    );
    last = m.index + m[0].length;
  }
  if (!parts.length) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** The same text without its markup, for structured data: "[words](/address/)" -> "words". */
export function plainText(text: string): string {
  return text.replace(LINK, "$1");
}
