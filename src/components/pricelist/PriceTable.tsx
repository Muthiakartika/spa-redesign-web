import Link from "next/link";
import { durationOf } from "@/components/home/price";
import type { PricedService } from "@/data/pages/pricelist";
import { displayPrice } from "@/lib/price";
import { treatmentHref } from "./menuTabs";

/** The columns: 30 minutes to 2 hours. */
const COLUMNS = [30, 60, 90, 120];
const HEADINGS: Record<number, string> = { 30: "30 min", 60: "1 hour", 90: "1.5 hours", 120: "2 hours" };

type Row = { name: string; desc?: string; href?: string; prices: (string | null)[] };

/** "IDR 159.000" -> a small "IDR" and the amount, so the amounts line up and read first. */
function Amount({ price }: { price: string }) {
  const m = /^IDR\s+(.*)$/.exec(price);
  if (!m) return <>{price}</>;
  return (
    <span className="price-table__price">
      <span className="price-table__cur">IDR</span> <span className="price-table__amount">{m[1]}</span>
    </span>
  );
}

/** "1 Hour · Four Hand Warm Candle" -> "1 Hour", the part the duration is read from. */
const durationPart = (time: string) => time.split(/\s+[·–-]\s+(?!2 pax)/i)[0];

/** A treatment's price for each column, or null when it has no such session. */
function rowsOf(services: PricedService[]): Row[] {
  const row = (name: string, desc: string | undefined, options: { time: string; price: string }[]): Row => ({
    name,
    desc,
    href: treatmentHref(name),
    prices: COLUMNS.map((m) => {
      const option = options.find((o) => durationOf(durationPart(o.time).replace(/\s*·\s*2 pax$/i, "")) === m);
      return option ? displayPrice(option.price) : null;
    }),
  });
  return services
    .flatMap((s) => [
      row(s.name, s.desc, s.options ?? []),
      ...(s.children ?? []).map((c) => row(c.name, c.desc, c.options)),
    ])
    .filter((r) => r.prices.some(Boolean));
}

/**
 * One table, laid out as a printed spa menu: each treatment's name and short
 * description, then only the lengths it has, "1 HOUR ······ IDR 159.000".
 * CSS grid (custom.css) drops a table's meaning for screen readers; the
 * roles put it back. Search engines read the <table> as it is.
 */
function Table({ caption, rows }: { caption: string; rows: Row[] }) {
  // Only the lengths at least one treatment in this table offers (no 30-minute couple massage).
  const columns = COLUMNS.map((m, i) => ({ m, i })).filter(({ i }) => rows.some((r) => r.prices[i]));
  return (
    <div className="price-table__scroll" role="region" aria-label={caption}>
      <table className="price-table__table" role="table">
        <caption>{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Treatment
            </th>
            {columns.map(({ m }) => (
              <th key={m} scope="col" role="columnheader">
                {HEADINGS[m]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((r) => (
            <tr key={r.name} role="row">
              <th scope="row" role="rowheader">
                <span className="price-table__name">
                  {r.href ? (
                    <Link prefetch={false} href={r.href}>
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                </span>
                {r.desc && <span className="price-table__desc">{r.desc}</span>}
              </th>
              {columns.map(({ m, i }) => (
                <td key={m} className={r.prices[i] ? undefined : "is-empty"} data-label={HEADINGS[m]} role="cell">
                  {r.prices[i] ? <Amount price={r.prices[i]} /> : <span aria-label="Not available">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Every timed price on the price list in one HTML table (AEO roadmap R21,
 * 17 Oct): a row per treatment, a column per session length, in IDR, plus
 * the home service fee. The duration switch above shows one length at a
 * time; this table lets a reader (or a search engine) see them all at once.
 * Built from the same tabs as the switch, so the prices always agree.
 *
 * The look, picked from three options (17 Oct), is a printed spa menu in two
 * columns (one on phones, with no sideways scrolling).
 */
export default function PriceTable({
  subTitle,
  title,
  text,
  massages,
  couples,
  note,
}: {
  subTitle: string;
  title: string;
  text: string;
  massages: PricedService[];
  couples: PricedService[];
  note: string;
}) {
  return (
    <section className="price-table price-list pt-130 pb-100">
      <div className="container">
        <div className="section-header center price-table__header">
          <p className="price-table__kicker">{subTitle}</p>
          <h2 className="title">{title}</h2>
          <p className="price-table__text">{text}</p>
        </div>
        <Table caption="Massage prices per person, in Indonesian rupiah (IDR)" rows={rowsOf(massages)} />
        <Table caption="Couples massage prices for two people, in Indonesian rupiah (IDR)" rows={rowsOf(couples)} />
        <p className="price-table__note">{note}</p>
      </div>
    </section>
  );
}
