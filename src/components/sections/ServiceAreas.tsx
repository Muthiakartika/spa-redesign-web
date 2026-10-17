import Link from "next/link";
import { business } from "@/data/business";
import { homeServiceAreas } from "@/lib/schema";

const fee = `IDR ${String(business.homeService.feePerTherapist).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/**
 * The areas home service reaches, with the fee and how soon a therapist
 * arrives (AEO roadmap R37, 17 Oct). Only what the site already says: the
 * outcall page's area list, the flat fee per therapist, "usually within 30
 * to 60 minutes" (villa page) for the areas near the spa, and "confirmed
 * before you book" for the rest.
 * TODO (owner): the fee and the arrival time for the areas further out.
 *
 * The look, picked from two options (17 Oct): no card, each zone a row on a
 * hairline, "ZONE 01" in small capitals over the areas in serif type, the
 * fee and arrival time beside them (stacked, with labels, on phones).
 */
export default function ServiceAreas() {
  const rows = [
    {
      areas: homeServiceAreas.near.slice(0, 3).join(", "),
      fee: `${fee} per therapist`,
      arrival: "Usually within 30 to 60 minutes",
    },
    {
      areas: homeServiceAreas.near.slice(3).join(", "),
      fee: `${fee} per therapist`,
      arrival: "Usually within 30 to 60 minutes, depending on traffic",
    },
    {
      areas: homeServiceAreas.further.join(", "),
      fee: `${fee} per therapist, plus any travel cost, confirmed before you book`,
      arrival: "Depends on traffic and therapist availability; confirmed on WhatsApp",
    },
  ];
  return (
    <section className="price-table service-areas pt-100 pb-100">
      <div className="container">
        <div className="section-header center price-table__header">
          <p className="price-table__kicker">Areas We Cover</p>
          <h2 className="title">Which Areas Does Our Home Service Cover?</h2>
          <p className="price-table__text">
            Our therapists travel from the spa in Seminyak, so the areas nearby are reached first. Treatments cost the
            same as in the spa wherever you are. Staying at a hotel or villa in Seminyak? See{" "}
            <Link prefetch={false} href="/villa-hotel-massage/">
              villa &amp; hotel massage in Seminyak
            </Link>
            .
          </p>
        </div>
        <div className="price-table__scroll" role="region" aria-label="Home service areas">
          <table className="price-table__table service-areas__table">
            <caption>Home service areas, fee and arrival time</caption>
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Home service fee</th>
                <th scope="col">Therapist arrives</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.areas}>
                  <th scope="row">{r.areas}</th>
                  {/* The label repeats each column's heading where the rows stack (the zones look on phones). */}
                  <td data-label="Home service fee">{r.fee}</td>
                  <td data-label="Therapist arrives">{r.arrival}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="price-table__note">
          Send your location on WhatsApp ({business.phoneDisplay}), open daily 9am–11pm, and we confirm the fee and the
          arrival time before you book.
        </p>
      </div>
    </section>
  );
}
