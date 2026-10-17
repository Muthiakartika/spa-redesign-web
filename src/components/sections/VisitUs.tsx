/* eslint-disable @next/next/no-img-element -- the site serves its photos as plain <img> */
import Link from "next/link";
import type { ReactNode } from "react";
import SectionShapes from "@/components/ui/SectionShapes";
import { business } from "@/data/business";
import { whatsappChatUrl } from "@/lib/whatsapp";

/** "IDR 75.000": the price, with a space that never breaks after "IDR". */
const fee = `IDR ${String(business.homeService.feePerTherapist).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const directions = (
  <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
    Get directions
  </a>
);

const villaLinks = (
  <>
    <Link prefetch={false} href="/villa-hotel-massage/">
      villa &amp; hotel massage in Seminyak
    </Link>
    , or{" "}
    <Link prefetch={false} href="/outcall-home-service-massage/">
      home service elsewhere in Bali
    </Link>
  </>
);

/**
 * `treatment` is how the heading names it: "Where Can I Book {treatment} in
 * Seminyak?", e.g. "Balinese Massage", "a Facial".
 *
 * "Visit us" on every treatment page and the About page (AEO roadmap R17 and
 * R40, 17 Oct): the address, the hours, in the spa or at your villa, the home
 * service fee and the booking line, in the page itself rather than only in
 * the header and footer, with links to the villa, home service and price
 * pages. Every fact comes from src/data/business.ts, so the pages never
 * disagree. Added by the treatment page template, not the page's tree: the
 * admin does not need to keep it.
 *
 * The looks follow luxury spa sites (Four Seasons Sayan, Belmond): the facts
 * as label and value rows on gold hairlines, one gold button and a text link.
 *  split  a spa photo across half the width, beside a warm paper panel
 *         (default, tried 17 Oct)
 *  light  the heading centred on white (17 Oct; a dark band was turned down)
 * A frangipani and a leaf hang over the card's corners, as on the theme's
 * other sections (owner, 17 Oct).
 */
export default function VisitUs({
  treatment,
  title,
  homeService = true,
  variant = "split",
  photo = "/images/services/dayspaseminyak/dayspa-2.webp",
  leftShapeSrc = "/images/shape/testimonial-two-shape-left.png",
  rightShapeSrc = "/images/shape/leaf/2a.png",
}: {
  treatment: string;
  /** In place of "Where Can I Book … in Seminyak?" (the About page). */
  title?: string;
  homeService?: boolean;
  variant?: "split" | "light";
  /** The split look's photo; the About page, which shows the default one higher up, passes another. */
  photo?: string;
  /** Corner decorations (components/ui/SectionShapes.tsx); `null` leaves a side empty. */
  leftShapeSrc?: string | null;
  rightShapeSrc?: string | null;
}) {
  const rows: { label: string; body: ReactNode }[] = [
    {
      label: "Address",
      body: (
        <>
          {business.address.full}. {directions}
        </>
      ),
    },
    { label: "Open daily", body: "9am – 11pm" },
    ...(homeService
      ? [
          {
            label: "In your villa",
            body: (
              <>
                +{fee} per therapist: {villaLinks}
              </>
            ),
          },
        ]
      : []),
    {
      label: "Booking",
      body: (
        <>
          WhatsApp{" "}
          <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer">
            {business.phoneDisplay}
          </a>
        </>
      ),
    },
    {
      label: "Prices",
      body: (
        <Link prefetch={false} href="/seminyak/">
          Full Spa Bali Moon price list
        </Link>
      ),
    },
  ];

  const content = (
    <>
      <p className="visit-us__kicker">Visit Spa Bali Moon</p>
      <h2 className="title">{title ?? `Where Can I Book ${treatment} in Seminyak?`}</h2>
      <p className="visit-us__lead">
        You can book {treatment} at Spa Bali Moon, {business.address.short}, open daily from 9am to 11pm
        {homeService ? (
          <>
            , or have it at your villa or hotel for an extra {fee} per therapist. Prices are the same in the spa and at
            your villa.
          </>
        ) : (
          "."
        )}
      </p>
      <dl className="visit-us__rows">
        {rows.map((r) => (
          <div key={r.label} className="visit-us__line">
            <dt>{r.label}</dt>
            <dd>{r.body}</dd>
          </div>
        ))}
      </dl>
      <div className="visit-us__actions">
        <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="visit-us__btn">
          Book on WhatsApp
        </a>
        <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="visit-us__more">
          Get directions <span aria-hidden="true">→</span>
        </a>
      </div>
    </>
  );

  if (variant === "light") {
    return (
      <section className="visit-us">
        <SectionShapes left={leftShapeSrc} right={rightShapeSrc} />
        <div className="container">
          <div className="visit-us__band">{content}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="visit-us visit-us--split">
      <SectionShapes left={leftShapeSrc} right={rightShapeSrc} />
      <div className="visit-us__split">
        <div className="visit-us__split-photo">
          <img
            loading="lazy"
            decoding="async"
            src={photo}
            alt={`A massage at ${business.name} in Seminyak`}
            width={578}
            height={601}
          />
        </div>
        <div className="visit-us__split-body">{content}</div>
      </div>
    </section>
  );
}
