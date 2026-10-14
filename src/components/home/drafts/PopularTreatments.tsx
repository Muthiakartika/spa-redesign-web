import Link from "next/link";
import { ArrowBox } from "@/components/home/icons";
import ScrollRow from "@/components/home/ScrollRow";
import TreatmentCard from "@/components/home/TreatmentCard";
import { LotusIcon } from "@/components/ui/Lotus";
import { treatmentSlides } from "@/data/pages/home";
import { catalog } from "@/data/pages/home-catalog";

/**
 * The five cards, by their treatment-slider name. All five are in the
 * "Most Popular" tab the site already shows on /outcall-home-service-massage/.
 */
const POPULAR = ["Balinese Massage", "Thai Massage", "Sports Massage", "Cream Bath", "Manicure Pedicure"];

const cards = POPULAR.map((name) => {
  const slide = treatmentSlides.find((t) => t.name === name);
  if (!slide) throw new Error(`PopularTreatments: "${name}" is not in treatmentSlides`);
  const item = catalog.find((c) => c.href === slide.href);
  return {
    name: item?.name ?? slide.name,
    href: slide.href || "/seminyak/",
    image: slide.image,
    icon: slide.icon,
    desc: item?.desc ?? "",
    // "From IDR 159.000 | 1 Hour" -> "From IDR 159.000"
    price: slide.price?.split("|")[0].trim() ?? null,
  };
});

/**
 * Homepage v2 "Our Most-Loved Treatments" — replaces the live slider of all
 * 23 treatments with the five most popular as cards (photo, icon badge,
 * description, link), and one button to the full price list.
 */
export default function PopularTreatments() {
  return (
    <section className="v2-popular">
      <div className="container">
        <div className="section-header center mb-60">
          <h4 className="sub-title">
            <LotusIcon className="icon" />
            Most Popular
          </h4>
          <h2 className="title">Our Most-Loved Treatments</h2>
          <p>The treatments our guests ask for most, at our Seminyak spa or as home service.</p>
          <span className="v2-divider" aria-hidden="true">
            <LotusIcon width={22} height={23} clip="clip0_v2_popular" />
          </span>
        </div>
        <ScrollRow className="v2-popular__grid" below="lg" label="Most popular treatments">
          {cards.map((c) => (
            <TreatmentCard key={c.name} {...c} />
          ))}
        </ScrollRow>
        <div className="v2-popular__more">
          <Link prefetch={false} href="/seminyak/" className="btn-two">
            View All Treatments
            <ArrowBox />
          </Link>
        </div>
      </div>
    </section>
  );
}
