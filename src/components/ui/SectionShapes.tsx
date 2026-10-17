/* eslint-disable @next/next/no-img-element -- the site serves its photos as plain <img> */

/**
 * The corner decorations a section hangs against the screen edges, as the
 * theme's own sections do: `.shape1` on the left, `.shape2` on the right,
 * placed per section in decorations.css. A missing or `null` src leaves that
 * side empty. Added on the treatment pages (owner, 17 Oct: every section
 * there has its leaves or flowers, on laptops too).
 */
export default function SectionShapes({ left, right }: { left?: string | null; right?: string | null }) {
  return (
    <>
      {left ? (
        <div className="shape1" aria-hidden="true">
          <img loading="lazy" decoding="async" className="animation__arryUpDown" src={left} alt="" />
        </div>
      ) : null}
      {right ? (
        <div className="shape2" aria-hidden="true">
          <img loading="lazy" decoding="async" className="animation__arryLeftRight" src={right} alt="" />
        </div>
      ) : null}
    </>
  );
}
