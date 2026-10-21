import { linkedText } from "@/lib/linkedText";

/**
 * One sentence that links to the outcall page (src/data/homeServiceLines.ts,
 * 20 Oct dev brief, Task 6). Its link is bold gold, like every link in body
 * text (src/styles/outcall.css).
 *
 * `inline`: the last row of the quick facts block on a treatment page, inside
 * its section (so it adds no gap of its own between two sections). Without it,
 * a band of its own under a page banner (the price list page).
 */
export default function HomeServiceLine({ text, inline = false }: { text: string; inline?: boolean }) {
  if (inline) {
    return (
      <p className="home-service-line home-service-line--inline home-service-line__text">{linkedText(text)}</p>
    );
  }
  return (
    <div className="home-service-line">
      <div className="container">
        <p className="home-service-line__text">{linkedText(text)}</p>
      </div>
    </div>
  );
}
