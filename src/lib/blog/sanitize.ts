import sanitizeHtmlLib from "sanitize-html";
import { business } from "@/data/business";

const SITE_HOST = new URL(business.url).host.replace(/^www\./, "");

/**
 * Does this href send the reader to another site? Only absolute http(s) URLs
 * on another host count; relative paths, links back to our own host, in-page
 * fragments, mailto: and tel: stay links.
 */
function leavesTheSite(href?: string): boolean {
  const value = (href || "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    return new URL(value).host.replace(/^www\./, "") !== SITE_HOST;
  } catch {
    // An unparseable absolute URL counts as outbound rather than slipping through.
    return true;
  }
}

/**
 * Clean admin-written article HTML before it is rendered on the public site
 * (the live site's lib/sanitize.js, same rules). Keeps what the editor can
 * produce (headings, lists, links, images, quotes, text alignment) and drops
 * scripts, event handlers and javascript: URLs.
 *
 * Outbound links are unwrapped: the anchor becomes a plain <span> and its
 * words stay, so a sentence never loses text, it just stops leading off the
 * site. Internal links (to the treatment pages) are kept.
 *
 * Every table is wrapped in <div class="post-table">, which scrolls sideways
 * on a phone instead of widening the page (custom.css).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return wrapTables(sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "hr", "span", "div",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "colgroup", "col", "caption", "thead", "tbody", "tfoot", "tr", "th", "td",
    ],
    allowedAttributes: {
      "*": ["class", "style"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      // The editor writes "min-width: 25px" sizes on tables and columns; the
      // article's own table style (custom.css) sets the width instead.
      table: dropStyle,
      col: dropStyle,
      a: (tagName, attribs) => {
        if (leavesTheSite(attribs.href)) return { tagName: "span", attribs: {} };
        // Spread the existing attributes first: replacing them would drop href.
        return { tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } };
      },
    },
  }));
}

function dropStyle(tagName: string, attribs: sanitizeHtmlLib.Attributes) {
  const rest = { ...attribs };
  delete rest.style;
  return { tagName, attribs: rest };
}

/** Safe on sanitised HTML: every <table …> there was written by sanitize-html, so tags are balanced. */
const wrapTables = (html: string) =>
  html.replace(/<table\b/g, '<div class="post-table"><table').replace(/<\/table>/g, "</table></div>");
