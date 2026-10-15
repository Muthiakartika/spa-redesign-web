/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { ArrowBox, PACKAGE_ICONS } from "@/components/home/icons";
import ScrollRow from "@/components/home/ScrollRow";
import { LotusIcon } from "@/components/ui/Lotus";
import { home } from "@/data/pages/home";
import { displayPrice } from "@/lib/price";
import { whatsappChatUrl } from "@/lib/whatsapp";

/**
 * Homepage v2 packages — the live pricing-section-five cards with the
 * separate "Looking for More Than One Treatment?" intro folded into a
 * two-column heading: title left, copy and button right. The intro's note
 * sits under the cards. Two cards a row until 1200px (live: 3 + 1), and below
 * 768px they scroll sideways.
 */
export default function Packages() {
  const { packages, packageIntro } = home;
  return (
    <div className="jsx-home homepage-pricing-services-join homepage-pricing-section">
      <section className="pricing-section-five section__decoration-top section__decoration-bottom bg-sub pt-130 pb-130 v2-packages">
        <div className="container">
          <div className="v2-split-head">
            <div className="section-header">
              <div className="sub-title look-h4">
                <LotusIcon className="icon" />
                {packages.subTitle}
              </div>
              <h2 className="title">{packages.title}</h2>
            </div>
            <div className="v2-split-head__aside">
              <p>{packages.text}</p>
              <Link prefetch={false} className="btn-two" href={packages.cta.href}>
                {packages.cta.label}
                <ArrowBox />
              </Link>
            </div>
          </div>
          <ScrollRow className="row g-4 v2-packages__row" below="md" label="Spa packages">
            {packages.cards.map((card, i) => (
              <div key={card.name} className="col-sm-6 col-xl-3 pricing-block-five">
                <div className="inner-box">
                  <div className="shape">
                    <img loading="lazy" decoding="async" src="/images/pricing/shape.png" alt="" />
                  </div>
                  <div className="icon">{PACKAGE_ICONS[i]}</div>
                  <div className="look-h4">
                    {`${card.treatment} `}
                    <br />
                    {` ${card.name}`}
                  </div>
                  <div className="price look-h2">
                    {displayPrice(card.price)}
                    {/* As on /seminyak/ (copy rewrite, 15 Oct). */}
                    <span className="pax-note">per person</span>
                  </div>
                  <ul>
                    {card.items.map(([duration, service]) => (
                      <li key={service}>
                        <span className="duration">{duration}</span>
                        <span className="service">{service}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="btn-two mt-35">
                    Reserve
                    <ArrowBox />
                  </a>
                </div>
              </div>
            ))}
          </ScrollRow>
          <p className="v2-packages__note">
            <span className="v2-packages__mark">
              <LotusIcon className="brand-lotus-icon-svg" width={22} height={23} clip="clip0_v2_note" />
            </span>
            {packageIntro.note}
          </p>
        </div>
      </section>
    </div>
  );
}
