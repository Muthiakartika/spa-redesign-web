# Outcall page rebuild: dev brief

**Site:** spabalimoon.com (Next.js)
**Main page:** `/outcall-home-service-massage/`
**Also touches:** homepage, header menu, footer, 23 treatment pages, 4 blog posts, Villa & Hotel page, Kuta page
**Prepared:** 20 Oct 2026
**Visual plan with data and mockups:** https://claude.ai/artifact/3cSUqZafTEgHLJYy5QG97Z (private; the owner needs to share it with you)

---

## Read this first (instructions for Claude)

1. Work through the tasks in order. Each task lists exactly what to change and how to check it.
2. Find files by searching the codebase for the **current text** quoted in each task. Don't assume file paths.
3. The copy in this brief is final. Don't rewrite or "improve" it. It was written to contain specific search phrases ("Seminyak", "home service massage", "home massage", "outcall massage", "mobile massage"). Only fix obvious typos.
4. `{{CONFIRM Cx: ...}}` marks a fact only the spa owner can supply (see the table below). **Never ship a `{{CONFIRM}}` token.** If the dev hasn't been given the fact, delete the whole sentence, bullet or card that contains it. Each placeholder's fallback is listed in the table.
5. Don't change: the URL slug, the canonical URL, treatment prices, the WhatsApp number or links, the homepage `<title>`/H1/meta description, or any other page's title.
6. All new page text must be **server-rendered**, so it appears in the HTML source and not only after JavaScript runs. Tabs and accordions are fine as long as their content is in the initial HTML.
7. Ship everything in **one deploy**. Several small releases in a row are what caused the ranking drop.

## Why we're doing this (short version)

- Around 6 Oct the homepage was retitled to target "Seminyak spa" searches. The outcall page was supposed to take over the outcall and home service rankings, but it went live before its content was ready.
- Search Console, comparing 31 Aug–27 Sep with 5–19 Oct:
  - Clicks to the homepage and outcall page combined fell from 22.6 to 13.3 per day (−41%).
  - "Outcall" searches moved to the outcall page fine: average position 3.5 → 4.7.
  - Home service, home massage and mobile massage searches did **not** move: average position 5.0 → 8.0. "Home service massage bali" dropped from 4.5 to 9.2.
  - Seminyak and area searches dropped too: "outcall massage seminyak" 4.6 → 9.5, "outcall massage canggu" 5.2 → 12.7.
- The outcall page has no "Seminyak" in its title, H1 or intro, and uses "home massage" 0 times. 63% of its words are a price list that is almost the same as the homepage's. It has no structured data and no section on the areas covered. This brief fixes all of that.

---

## Facts to confirm before deploy

Ask the owner for these. If a fact is missing on deploy day, use the fallback.

| ID | Fact needed | Where it's used | Fallback if not confirmed |
|---|---|---|---|
| C1 | Typical arrival time in Seminyak / Petitenget (minutes) | S06 Seminyak card, FAQ 9 | Delete the "Typical arrival" sentence; delete FAQ 9 |
| C2 | Typical arrival time in Kerobokan | S06 Kerobokan card | Delete the sentence |
| C3 | Typical arrival time in Canggu | S06 Canggu card | Delete the sentence |
| C4 | Hours of notice needed for Uluwatu / Nusa Dua / Ubud | S06, FAQ 9 | Delete the sentence; delete FAQ 9 |
| C5 | Home service fee outside the standard zone | S02 note | Keep the default sentence given in S02 |
| C6 | Are same-day bookings usually possible? | S04 step 2 | Delete the sentence |
| C7 | Can home service guests pay by cash and Visa? | S04 step 4, FAQ 13 | Delete the sentence; delete FAQ 13 |
| C8 | Latest start time for a 60-minute home treatment | FAQ 10 | Delete that sentence only (keep "until 11pm") |
| C9 | Can guests ask for a female or male therapist? | FAQ 12 | Delete FAQ 12 |
| C10 | Most therapists you can send to one booking | S08 | Delete the sentence |
| C11 | Current Google rating and review count (schema says 4.2 from 193) | S10 chip, homepage schema | Delete the chip; keep the schema rating as it is today |
| C12 | 3–4 genuine Google reviews that mention a villa, hotel or home visit, plus the Google reviews link | S11 | Hide section S11 completely |
| C13 | Are hair braiding and nail art available as home service? | Task 6, two pages | Skip those two pages |
| C14 | Do you look after weddings, birthdays or retreats? | S08 | Delete the sentence |

---

## Global rule: how links in body text look

The owner wants **bold black text with no underline** for every link inside body copy (paragraphs, lists, cards, tables, FAQ answers). Buttons, the header menu and the footer keep their current styles.

```css
/* In-content links only. Adjust the selector to the site's content wrapper. */
.content a:not(.btn) {
  color: #000;               /* use the site's body-text colour token if there is one */
  font-weight: 700;
  text-decoration: none;
}
.content a:not(.btn):hover {
  text-decoration: none;
}
.content a:not(.btn):focus-visible {
  outline: 2px solid #A78627; /* site gold; keyboard users still need to see focus */
  outline-offset: 2px;
  border-radius: 2px;
}
/* On dark sections, use that section's light text colour instead of #000. */
```

In this brief, links are written as `[link text](/url/)`. The link text is chosen on purpose, so use it exactly.

---

## Task 1: Outcall page metadata

| Field | New value |
|---|---|
| `<title>` | `Outcall & Home Service Massage Seminyak, Bali \| Spa Bali Moon` (61 characters) |
| Meta description | `Outcall and home massage from our Seminyak spa since 2009. Balinese, deep tissue & couples massage at your villa, hotel or home in Bali. Book on WhatsApp.` (154 characters) |
| `og:title` / `og:description` | Same as the title and description above |
| Canonical | Unchanged: `https://spabalimoon.com/outcall-home-service-massage/` |

**Watch for a title template.** Check `app/layout.*` (or wherever the root metadata is set) for a `title.template` such as `%s | Spa Bali Moon`. If there is one, set this page's title so the brand doesn't appear twice. The final `<title>` must match the table exactly. Use `title: { absolute: '...' }` if needed.

**Check:** `curl -s <preview-url>/outcall-home-service-massage/ | grep -o "<title>[^<]*"` prints the exact new title.

---

## Task 2: Outcall page, new section order and full copy

### Final order

| # | Section | Status |
|---|---|---|
| S01 | Hero | Rewrite |
| S02 | Home Service Massage Prices in Seminyak | **New** |
| S03 | Outcall Balinese Massage from Our Seminyak Spa | Rename + new paragraph |
| S04 | How Our Outcall Massage Works | **New**, replaces "Book Home Service Massage in Bali" |
| S05 | Home Massage & Body Treatments We Bring to You | Rename + new intro + links |
| S06 | Home Service Areas Around Seminyak | **New** |
| S07 | Home Service or Our Seminyak Day Spa? | **New** |
| S08 | Couples, Families & Villa Group Massage | **New** |
| S09 | Why Choose Our Home Service Massage | Keep as is |
| S10 | A Licensed Seminyak Spa, Coming to You | **New** |
| S11 | What Guests Say About Our Home Service | **New** (hide if C12 isn't supplied) |
| S12 | Outcall Massage Price List | Rename + move down (it's currently the 5th section) |
| S13 | Outcall & Home Service Massage FAQs | Rename + 7 new questions |
| S14 | Home Service Massage in Seminyak and Beyond | Keep as is |

Heading rules:
- There is exactly one H1 (S01).
- Each section title is an H2.
- Card titles inside S02, S07 and S08 are **not** headings. Use bold text, so they don't duplicate the H3s in the price list.
- Area names in S06, step titles in S04 and FAQ questions are H3s.

New elements need these ids:
- `id="home-service-prices"` on S02
- `id="how-it-works"` on S04
- `id="areas"` on S06
- `id="price-list"` on S12

---

### S01 · Hero (rewrite)

**Small label above the H1.** Currently "Outcall Spa Service". New text:
> Home service from our Seminyak spa

**H1.** Currently "Outcall Massage in Bali: Home Service to Your Villa or Hotel". New text:
> Outcall & Home Service Massage in Seminyak, Bali

**Intro paragraph.** Currently "Experience our traditional massage and spa treatments in the comfort of your home, hotel, or villa." New text:
> Since 2009, Spa Bali Moon has sent therapists from our Seminyak spa to villas, hotels and homes across Bali. Book a home massage, from Balinese and deep tissue to couples and four-hand massage, and we bring the massage table, fresh linen and oils. Home service fee: IDR 75.000 per therapist. Open daily, 9am to 11pm.

**Buttons:**
- Primary: keep "Book on WhatsApp" with the current link.
- Secondary: currently "View Price List / Home service prices". New label "See home service prices", linking to `#home-service-prices`.

**Chips** (4 small badges under the buttons):
- Since 2009 · Seminyak spa
- Table, linen & oils included
- IDR 75.000 per therapist
- Open daily 9am – 11pm

Keep the existing "Spa Bali Moon in Seminyak, Bali" label and the opening times line.

---

### S02 · Home Service Massage Prices in Seminyak (new)

Eyebrow: **Prices at your villa**

**H2:** Home Service Massage Prices in Seminyak

> What you pay at your villa, hotel or home is the treatment price plus IDR 75.000 per therapist. These are our most-booked home treatments, with the fee already added:

Display these as 6 cards or a table. Card titles are bold text, not headings.

| Treatment | Treatment price | Home service fee | Total at your villa |
|---|---|---|---|
| Balinese Massage, 60 min | IDR 159.000 | IDR 75.000 | **IDR 234.000** |
| Traditional Massage, 60 min | IDR 169.000 | IDR 75.000 | **IDR 244.000** |
| Aromatherapy Massage, 60 min | IDR 199.000 | IDR 75.000 | **IDR 274.000** |
| Deep Tissue Massage, 60 min | IDR 269.000 | IDR 75.000 | **IDR 344.000** |
| Couple Balinese Massage, 60 min (2 therapists) | IDR 319.000 | IDR 150.000 | **IDR 469.000** |
| Four Hand Massage, 60 min (2 therapists) | IDR 339.000 | IDR 150.000 | **IDR 489.000** |

If the price list comes from a data file, calculate the totals as treatment price + `75000 × therapists` from that data instead of hardcoding them. That way they stay correct when prices change.

Note under the cards (default text, use this unless C5 is confirmed):
> Totals apply in Seminyak, Petitenget, Kerobokan, Canggu and North Kuta. For areas further away, we confirm the total on WhatsApp before you book.

If C5 is confirmed, replace the second sentence with: `{{CONFIRM C5: "Outside this zone the fee is IDR X per therapist."}}`

Buttons:
- "Book on WhatsApp" (existing WhatsApp link)
- "See the full outcall price list", linking to `#price-list`

---

### S03 · Outcall Balinese Massage from Our Seminyak Spa (rename)

**H2.** Currently "Outcall Balinese Massage in Bali". New text:
> Outcall Balinese Massage from Our Seminyak Spa

Replace the paragraph that starts "Find an authentic Balinese massage without the hassle…" with:
> Get an authentic Balinese massage without leaving your villa. Our therapists come from our Seminyak spa with everything needed for a quiet, well-prepared session that fits around your day in Bali. Choose a single treatment or a package, and we'll tailor the pressure and focus to you.

Keep the two H3 blocks as they are ("Easy Booking via WhatsApp" and "Spa Treatments at Your Place") and the four stat chips.

---

### S04 · How Our Outcall Massage Works (new; replaces "Book Home Service Massage in Bali")

**Remove** the old H2 "Book Home Service Massage in Bali" and its paragraph ("Enjoy professional Balinese massage and spa treatments at your home…"). **Keep** its six bullets and move them into this section as the "What to expect" checklist below.

Eyebrow: **From message to massage**

**H2:** How Our Outcall Massage Works

Four numbered steps. Each step title is an H3.

1. **Message us on WhatsApp**
   Send your treatment, date and time, number of guests and your villa or hotel address.
2. **We confirm your booking**
   We reply with the total price, including the home service fee, and your therapist's arrival time. `{{CONFIRM C6: "Same-day bookings are usually possible."}}`
3. **Your therapist sets up**
   They bring a portable massage table, fresh linen, towels and oils, and set up in 5 to 10 minutes in any space of about 2 × 2 metres.
4. **Relax, then pay**
   Your treatment time starts once setup is done, so a 60-minute massage is a full 60 minutes. `{{CONFIRM C7: "Pay your therapist after the session, in cash or by Visa."}}`

Beside or below the steps, add an **H3 "What to expect"** followed by the existing bullets, unchanged:
- Individual and group bookings
- Flexible appointment times
- Treatments at your hotel, villa, or home
- Clear treatment prices
- Responsive booking support
- Quick availability confirmation

Keep the existing "Book Now" button.

---

### S05 · Home Massage & Body Treatments We Bring to You (rename)

**H2.** Currently "Outcall Massage & Body Treatments". New text:
> Home Massage & Body Treatments We Bring to You

**Intro.** Currently "Enjoy professional massage and body treatments in the comfort of your villa, hotel, or accommodation. Choose from our selection of treatments:". New text:
> Every treatment below is available as a home massage or body treatment at your villa, hotel or home, in Seminyak and across Bali:

Keep the 8 items and their descriptions. Turn each treatment name into a link:

- [Couple Massage](/seminyak/couple-spa/): Relax side by side while sharing a massage experience together.
- [Shiatsu](/seminyak/shiatsu-massage/): Release muscle tension using gentle Japanese pressure-point techniques.
- [Thai Massage](/seminyak/thai-massage/): Improve flexibility and posture with assisted stretching and acupressure.
- [Cream Bath](/seminyak/creambath/): Revitalize your hair while supporting softness and freshness.
- [Body Scrub](/seminyak/body-scrub/): Softly exfoliate the skin and promote smoothness.
- [Mani-Pedi](/seminyak/manicure-pedicure/): Maintain clean and well-groomed hands and feet with professional care.
- [Hot Stone](/seminyak/hot-stone-massage/): Soothe muscle tension using warm stones for deeper relaxation.
- [Facial Care](/seminyak/facial/): Cleanse and refresh the skin to restore a healthy appearance.

Keep the "Book Now" button and the "17+ Years Experience" stat.

---

### S06 · Home Service Areas Around Seminyak (new)

Eyebrow: **Where we travel**

**H2:** Home Service Areas Around Seminyak

> Our therapists leave from our spa on Jl. Pangkung Sari in Seminyak, so the closer you are, the sooner we can usually be with you. Send us your address on WhatsApp and we'll confirm your arrival time.

**Group 1. Label (bold, not a heading):** Standard home service zone · IDR 75.000 per therapist

**H3:** Outcall Massage in Seminyak & Petitenget
> Our spa is here, so this is where we arrive fastest. We visit private villas, hotels and homes across Seminyak and Petitenget. For in-room massage at your hotel or villa, see [Villa & Hotel Massage](/villa-hotel-massage/). `{{CONFIRM C1: "Typical arrival: about X minutes."}}`

**H3:** Home Massage in Kerobokan
> Private villas and homes across Kerobokan, a short drive from the spa. `{{CONFIRM C2: "Typical arrival: about X minutes."}}`

**H3:** Outcall Massage in Canggu
> Villas and guesthouses across Canggu and North Kuta. After a day of surfing, a [sports massage](/seminyak/sport-massage/) or [deep tissue massage](/seminyak/deep-tissue-massage/) helps tired shoulders and legs recover. `{{CONFIRM C3: "Typical arrival: about X minutes."}}`

**Group 2. Label (bold, not a heading):** Further afield · subject to therapist availability and travel time

**H3:** Kuta
> Hotels and villas in Kuta. See [Massage Kuta](/massage-kuta/) for in-spa and outcall options in the area.

**H3:** Uluwatu, Jimbaran & Nusa Dua
> We travel south to villas and resorts in Uluwatu, Jimbaran and Nusa Dua when a therapist is free. Some larger resorts don't allow outside therapists, so check with reception first. `{{CONFIRM C4: "Please book at least X hours ahead."}}`

**H3:** Ubud, Sanur & Denpasar
> Send us your address and preferred time, and we'll confirm whether a therapist can travel to you.

Layout suggestion: two groups of three cards, using the same card style as the treatment cards.

---

### S07 · Home Service or Our Seminyak Day Spa? (new)

Eyebrow: **Two ways to book**

**H2:** Home Service or Our Seminyak Day Spa?

> Every home service therapist works from our day spa in Seminyak. Here's how the two options compare:

| | Home service | Our Seminyak spa |
|---|---|---|
| **Where** | Your villa, hotel or home | Jl. Pangkung Sari No. 30, Seminyak |
| **Price** | Treatment + IDR 75.000 per therapist | Treatment price only |
| **Hours** | Daily, 9am – 11pm | Daily, 9am – 11pm |
| **Setup** | Therapist brings table, linen, towels and oils | Private treatment rooms, nothing to arrange |
| **Menu** | Most massages and selected beauty treatments | The full menu and every spa package |
| **Best for** | Couples and groups staying in, the evening you land, late bookings | Combining massage with nails, waxing or hair care in one visit |

Buttons:
- "Book home service" (WhatsApp link)
- [Visit our Seminyak day spa](/seminyak/day-spa/), styled as a secondary button

On mobile, the table should scroll sideways inside its own container. The page itself must not scroll sideways.

---

### S08 · Couples, Families & Villa Group Massage (new)

Eyebrow: **More than one guest**

**H2:** Couples, Families & Villa Group Massage

> Staying with your partner, family or friends? We send several therapists at once, so everyone is treated at the same time in your villa. Tell us how many guests and which treatments on WhatsApp, and we'll confirm how many therapists we can send for your chosen time. `{{CONFIRM C10: "We can send up to X therapists to one booking."}}` `{{CONFIRM C14: "We also look after wedding parties, birthdays and retreats."}}`

Three cards (bold titles, not headings):
- **Couple massage at your villa:** Side by side, from IDR 319.000 for 60 minutes, plus IDR 75.000 per therapist. [See couple massage](/seminyak/couple-spa/)
- **Four hand massage:** Two therapists working together, from IDR 339.000 for 60 minutes, plus IDR 75.000 per therapist.
- **Mix your treatments:** One guest has a massage while another has a manicure pedicure or a cream bath.

---

### S09 · Why Choose Our Home Service Massage (keep as is)

No changes to the heading or the six H3 reasons.

---

### S10 · A Licensed Seminyak Spa, Coming to You (new)

A short band, visually lighter than the sections around it.

Eyebrow: **Who's coming to your villa**

**H2:** A Licensed Seminyak Spa, Coming to You

> Spa Bali Moon has run a day spa at Jl. Pangkung Sari No. 30, Seminyak since 2009. Home service is delivered by the same therapists who work in our spa, and you're welcome to visit us before you book. We offer professional relaxation and therapeutic massage only.

Chips:
- Licensed spa since 2009
- Same therapists as our spa
- Fresh linen for every guest
- `{{CONFIRM C11: "Rated 4.2 from 193 Google reviews"}}`

---

### S11 · What Guests Say About Our Home Service (new; hide if C12 isn't supplied)

Eyebrow: **From villa guests**

**H2:** What Guests Say About Our Home Service

- 3–4 review cards: `{{CONFIRM C12}}`. Each card has the review text, the reviewer's first name, the month and year, and "Google".
- Use the reviews word for word. Never write or reword reviews.
- Don't reuse the homepage carousel reviews. They're about visits to the spa.
- **Don't add Review or AggregateRating schema for this section.** Google ignores reviews a business shows about itself.
- Button: "Read all our reviews on Google", linking to the Google reviews link from C12.

If no reviews are supplied by deploy day, don't render this section at all.

---

### S12 · Outcall Massage Price List (rename + move down)

**H2.** Currently "Outcall Massage Treatments We Offer". New text:
> Outcall Massage Price List

Add `id="price-list"`. Add one line directly under the H2:
> Treatment prices below are the same as at our Seminyak spa. Home service adds IDR 75.000 per therapist.

Keep the tabs and all prices exactly as they are. Only the section's position and heading change.

---

### S13 · Outcall & Home Service Massage FAQs (rename + 7 new)

**H2.** Currently "Outcall Massage Bali: FAQs". New text:
> Outcall & Home Service Massage FAQs

Each question is an H3. Questions 1–7 are the existing ones; the changes are marked. Questions 8–14 are new.

**1. What is an outcall massage?** *(last sentence changed)*
An outcall massage is a professional treatment delivered by a therapist who travels to you, rather than you visiting the spa. Our therapists come to your villa, hotel room, or private residence with everything needed for the session. It is also known as home service, home massage, mobile massage or massage on call.

**2. Do I need to prepare anything?** *(grammar fix in the second sentence)*
No. Our therapists bring the massage bed, clean linens, towels, and oils. All you need is a space of roughly two by two metres; a bedroom, terrace or living area all work well. If you have a preference for where the session takes place, tell us when you book.

**3. What does the therapist bring?** *(unchanged)*
A portable massage bed, freshly laundered linens and towels, professional massage oils, and any equipment specific to your chosen treatment. Nothing is reused between guests. You do not need to supply towels, sheets, or anything else.

**4. How long does setup take?** *(unchanged)*
Around five to ten minutes on arrival, and a similar time to pack down afterwards. Your treatment time begins once setup is complete, so a booked 60-minute massage is a full 60 minutes of treatment.

**5. Which areas do you cover for home service?** *(link added at the end)*
Our spa is in Seminyak, and home service is available across Seminyak, Kerobokan, Petitenget, Canggu, and North Kuta. We also travel to Kuta, Jimbaran, Uluwatu, Nusa Dua, Sanur, Denpasar, and Ubud, subject to therapist availability and travel time. Message us with your location and we will confirm. See [our home service areas](#areas) for more detail.

**6. What if my hotel doesn't allow outside therapists?** *(link added)*
Some hotels and resorts restrict external therapists, particularly larger properties with their own spa. Please check with reception before booking. Private villas and guesthouses rarely have this restriction. If your property does not permit home service, you are very welcome at [our Seminyak spa](/seminyak/day-spa/) instead.

**7. Which massage is best after a long flight?** *(link sentence added)*
A one-hour Balinese or aromatherapy massage suits most guests arriving in Bali. Both use steady, flowing pressure rather than deep work, which helps with circulation and sleep after a long journey. Foot reflexology is a good shorter option if your legs and feet feel swollen. Read more in our [jet lag recovery guide](/guide/jet-lag-recovery-best-treatments-after-a-long-flight/).

**8. How much does a home service massage cost in Seminyak?** *(new)*
The treatment price plus IDR 75.000 per therapist. A 60-minute Balinese massage at your villa in Seminyak is IDR 159.000 + IDR 75.000 = IDR 234.000. Couples treatments use two therapists, so the fee is IDR 150.000. See [home service prices](#home-service-prices).

**9. How soon can a therapist arrive?** *(new; delete the whole question if C1 and C4 aren't confirmed)*
`{{CONFIRM C1}}` In Seminyak, Petitenget and Kerobokan we can often be with you within X minutes of confirming. `{{CONFIRM C4}}` For Uluwatu, Nusa Dua or Ubud, please book X hours ahead.

**10. Can I book a late-night massage at my villa?** *(new)*
Yes. Home service runs daily until 11pm. `{{CONFIRM C8: "The latest start time for a 60-minute treatment is X."}}`

**11. Can we book a couples massage at our villa or hotel?** *(new)*
Yes. Two therapists arrive together and set up side by side, so you're both treated at the same time. Couples massage starts from IDR 319.000 for 60 minutes, plus IDR 75.000 per therapist.

**12. Can I ask for a female or male therapist?** *(new; delete if C9 isn't confirmed)*
`{{CONFIRM C9}}` Tell us your preference when you book and we'll confirm who is available.

**13. How do I pay for a home service massage?** *(new; delete if C7 isn't confirmed)*
`{{CONFIRM C7}}` Pay your therapist after the treatment, in cash or by Visa.

**14. Is your outcall massage a professional service?** *(new)*
Yes. We are a licensed day spa in Seminyak, open since 2009, and we offer professional relaxation and therapeutic massage only. Our team confirms every home service booking on WhatsApp.

---

### S14 · Home Service Massage in Seminyak and Beyond (keep as is)

No changes.

---

### Image alt text on the outcall page

| Image | Current alt | New alt |
|---|---|---|
| `/images/outcall/outcall-2.webp` | Spa treatment | Outcall massage on a villa terrace: therapist giving a back massage beside a private pool |
| `/images/outcall/outcall-3.webp` | Spa treatment detail | Close-up of a therapist's hands during an oil back massage |
| `/images/homepage/homepage-3.webp` | Spa treatment | Therapist pouring massage oil into their hand |
| `/images/outcall/outcall-4.webp` | Spa treatment | Therapist giving a leg massage to a guest draped in a white towel |

Decorative shapes (`/images/shape/...`) keep `alt=""`.

---

## Task 3: Structured data (JSON-LD)

### 3a. Outcall page: add this block

The page has no JSON-LD today. Render it in the page's server output, for example with `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DaySpa",
      "@id": "https://spabalimoon.com/#spa",
      "name": "Spa Bali Moon",
      "url": "https://spabalimoon.com/"
    },
    {
      "@type": "Service",
      "@id": "https://spabalimoon.com/outcall-home-service-massage/#service",
      "name": "Outcall & Home Service Massage",
      "serviceType": "Outcall massage",
      "url": "https://spabalimoon.com/outcall-home-service-massage/",
      "provider": { "@id": "https://spabalimoon.com/#spa" },
      "areaServed": [
        { "@type": "Place", "name": "Seminyak, Bali" },
        { "@type": "Place", "name": "Petitenget, Bali" },
        { "@type": "Place", "name": "Kerobokan, Bali" },
        { "@type": "Place", "name": "Canggu, Bali" },
        { "@type": "Place", "name": "Kuta, Bali" },
        { "@type": "Place", "name": "Jimbaran, Bali" },
        { "@type": "Place", "name": "Uluwatu, Bali" },
        { "@type": "Place", "name": "Nusa Dua, Bali" },
        { "@type": "Place", "name": "Sanur, Bali" },
        { "@type": "Place", "name": "Denpasar, Bali" },
        { "@type": "Place", "name": "Ubud, Bali" }
      ],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "IDR",
        "price": "75000",
        "description": "Home service fee per therapist, added to the treatment price"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://spabalimoon.com/" },
        { "@type": "ListItem", "position": 2, "name": "Outcall & Home Service Massage", "item": "https://spabalimoon.com/outcall-home-service-massage/" }
      ]
    }
  ]
}
```

### 3b. Homepage: replace the existing DaySpa block with this

This adds the `@id` the outcall page points to, plus the address, phone and opening hours that are missing today. It keeps the current image, email and rating.

```json
{
  "@context": "https://schema.org",
  "@type": "DaySpa",
  "@id": "https://spabalimoon.com/#spa",
  "name": "Spa Bali Moon",
  "url": "https://spabalimoon.com/",
  "image": "https://spabalimoon.com/images/home/homepage-1.webp",
  "email": "info@spabalimoon.com",
  "telephone": "+62 878-6317-5144",
  "priceRange": "IDR 69.000 - IDR 999.000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Pangkung Sari No. 30",
    "addressLocality": "Seminyak",
    "addressRegion": "Bali",
    "postalCode": "80361",
    "addressCountry": "ID"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "09:00",
    "closes": "23:00"
  },
  "areaServed": "Seminyak, Bali",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.2,
    "reviewCount": 193,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

If C11 gives a newer rating, update `ratingValue` and `reviewCount`.

**Check:** paste both live URLs into https://search.google.com/test/rich-results and https://validator.schema.org. There should be no errors.

---

## Task 4: Header menu and footer labels (whole site)

These components are shared, so one change updates every page. Mobile and desktop menus must use the same labels.

| Where | Now | New | Links to |
|---|---|---|---|
| Header, top-level menu item | Outcall | **Home Service** | `/outcall-home-service-massage/` (unchanged) |
| Header dropdown, item 1 title | Home Service Massage | **Outcall & Home Service Massage** | `/outcall-home-service-massage/` |
| Header dropdown, item 1 subtitle | Outcall massage anywhere in Bali | **From our Seminyak spa to your villa** | |
| Header dropdown, item 2 | Villa & Hotel Massage / In-room massage in Seminyak | Keep | `/villa-hotel-massage/` |
| Header dropdown, item 3 | Massage Kuta / In-spa and outcall in Kuta | Keep | `/massage-kuta/` |
| Header dropdown, "see all" link at the bottom | Home service massage | **Home massage in Seminyak & Bali** | `/outcall-home-service-massage/` |
| Mobile / mega menu item | Outcall · Massage at your villa or hotel | **Home Service · Outcall massage at your villa, hotel or home** | `/outcall-home-service-massage/` |
| Footer column heading | Home Services (currently a link) | **Home Services** as a plain heading with no link | |
| Footer, Home Services column, new first item | (none) | **Outcall & Home Service Massage** | `/outcall-home-service-massage/` |
| Footer, Home Services column | Massage Hotel & Villa | **Villa & Hotel Massage** | `/villa-hotel-massage/` |
| Footer, Home Services column | Massage Kuta | Keep | `/massage-kuta/` |
| Footer, Home Services column | Massage Seminyak | **Move it to the "Our Day Spa" column** and relabel it **Seminyak Spa & Massage** | `/` (unchanged) |
| Footer blurb | Spa Bali Moon offers high-quality traditional massages and spa therapies, with outcall and home services by skilled therapists specializing in Balinese Body Massage. | **Spa Bali Moon is a Seminyak day spa offering traditional Balinese massage and spa treatments since 2009, with outcall and home service massage across Bali.** | |

Leave "Home service fee IDR 75.000 / therapist" in the footer as it is.

**Check:** on desktop (1280px wide) the header menu still fits on one line with the new "Home Service" label. Check the mobile menu too.

---

## Task 5: Homepage edits (don't change the title, H1 or meta description)

**5a. Hero intro link.** In the sentence "…at our Seminyak spa, with home service also available for hotels and villas in nearby areas.", link the words **home service** to `/outcall-home-service-massage/`.

**5b. Replace the "Prefer to stay in?" line.** The current line is "Prefer to stay in? We also offer outcall and home service massage in Bali." Replace it with a small band. Use bold text or an H3 for the first line, **not an H2**, so the homepage doesn't compete with the outcall page for the term.

> **Prefer a massage at your villa?**
> Our therapists bring the table, fresh linen and oils to villas, hotels and homes in Seminyak, Canggu and across Bali, for IDR 75.000 per therapist.
> Button: **Outcall & home service massage**, linking to `/outcall-home-service-massage/`

**5c. Homepage FAQ link.** In the answer to "Can I enjoy the treatments without visiting the spa?", link the words **home service** to `/outcall-home-service-massage/`.

**5d.** Replace the homepage schema with the block in Task 3b.

---

## Task 6: One link line on each treatment page

On each page, add the sentence **directly after the intro or price block**, before the first H2. Use the link text exactly as written; it is varied on purpose. All links go to `/outcall-home-service-massage/`.

| Page | Sentence to add |
|---|---|
| `/seminyak/balinese-massage/` | Staying in tonight? We also bring Balinese massage to your villa or hotel as a [home service massage](/outcall-home-service-massage/), for IDR 75.000 per therapist. |
| `/seminyak/deep-tissue-massage/` | Too sore to travel? Book deep tissue as an [outcall massage in Seminyak](/outcall-home-service-massage/) and your therapist brings the table to you. |
| `/seminyak/thai-massage/` | Thai massage is also available at your villa through our [home service](/outcall-home-service-massage/), anywhere from Seminyak to Canggu. |
| `/seminyak/traditional-massage/` | Prefer to stay in? Book a traditional massage as a [home massage in Seminyak](/outcall-home-service-massage/) or anywhere nearby. |
| `/seminyak/couple-spa/` | Want a couples massage in your own villa? Two therapists can come to you with our [outcall and home service massage](/outcall-home-service-massage/). |
| `/seminyak/shiatsu-massage/` | Shiatsu needs no oil and little space, so it works well as a [massage at your villa or hotel](/outcall-home-service-massage/). |
| `/seminyak/sport-massage/` | After a surf or a long ride, book a sports massage at your villa with our [outcall massage service](/outcall-home-service-massage/) in Seminyak and Canggu. |
| `/seminyak/hot-stone-massage/` | Hot stone massage is also available as a [home service massage in Bali](/outcall-home-service-massage/). Your therapist brings the stones and everything else needed. |
| `/seminyak/lymphatic-drainage-massage/` | Lymphatic drainage massage can also be booked at your villa or hotel through our [home service](/outcall-home-service-massage/). |
| `/seminyak/foot-massage/` | Tired feet after a day of sightseeing? A foot massage is just as relaxing at your villa with our [home massage service](/outcall-home-service-massage/). |
| `/seminyak/foot-reflexology/` | Foot reflexology is also available as an [outcall massage](/outcall-home-service-massage/), a good choice the evening you arrive in Bali. |
| `/seminyak/head-massage/` | Book a head massage at your villa or hotel with our [home service massage](/outcall-home-service-massage/), or add it to another treatment. |
| `/seminyak/coconut-oil-massage/` | Our coconut oil massage is also available as a [home massage across Bali](/outcall-home-service-massage/), for IDR 75.000 per therapist. |
| `/seminyak/anti-cellulite-massage/` | Cellulite massage can also be booked at your villa through our [outcall and home service](/outcall-home-service-massage/). |
| `/seminyak/sunburn-massage/` | Too sunburnt to go out? We bring our cooling aloe vera treatment to your villa or hotel with our [home service massage](/outcall-home-service-massage/). |
| `/seminyak/body-scrub/` | Body scrubs are also available at your villa with our [home service](/outcall-home-service-massage/), on their own or after a massage. |
| `/seminyak/creambath/` | Enjoy a cream bath without leaving your villa: book it through our [outcall home service](/outcall-home-service-massage/). |
| `/seminyak/facial/` | Our facials can also be booked at your villa or hotel with our [home service in Seminyak](/outcall-home-service-massage/). |
| `/seminyak/manicure-pedicure/` | Manicures and pedicures are available at your villa too. See our [home service](/outcall-home-service-massage/) for prices and areas. |
| `/seminyak/ear-candle/` | Ear candling is also available as part of our [home service in Bali](/outcall-home-service-massage/), often added to a massage. |
| `/seminyak/waxing-salon/` | Waxing can also be booked at your villa with our [home service](/outcall-home-service-massage/). |
| `/seminyak/hair-braiding/` | `{{CONFIRM C13}}` Hair braiding is also available at your villa with our [home service](/outcall-home-service-massage/). *(skip this page if not confirmed)* |
| `/seminyak/nail-spa/` | `{{CONFIRM C13}}` Nail art is also available at your villa with our [home service](/outcall-home-service-massage/). *(skip this page if not confirmed)* |
| `/seminyak/day-spa/` | Prefer to stay in? Our home service is delivered by the same therapists who work here. See [outcall and home service massage](/outcall-home-service-massage/). |
| `/seminyak/` (price list) | Many treatments on this list are also available at your villa or hotel. See [home service massage prices](/outcall-home-service-massage/#home-service-prices). |

If the treatment pages share one template, add a field for this sentence (for example `homeServiceLine` in the page data) rather than hardcoding it 25 times.

---

## Task 7: Blog post links

Add one sentence to each post, in the paragraph that recommends booking a massage or near the end.

| Post | Sentence to add |
|---|---|
| `/guide/jet-lag-recovery-best-treatments-after-a-long-flight/` | If you'd rather not leave your villa after landing, we offer [outcall massage in Bali](/outcall-home-service-massage/) from our Seminyak spa, daily until 11pm. |
| `/guide/what-is-balinese-massage/` | You can book a Balinese massage at our Seminyak spa or as a [home massage](/outcall-home-service-massage/) at your villa or hotel. |
| `/guide/what-is-thai-massage/` | Thai massage needs no oil and little space, which makes it easy to enjoy as a [home service massage](/outcall-home-service-massage/) in your villa. |
| `/guide/balinese-vs-thai-massage/` | Both styles are available at our Seminyak spa and through our [outcall and home service](/outcall-home-service-massage/). |

---

## Task 8: Villa & Hotel page and Kuta page

**`/villa-hotel-massage/`.** Keep this page focused on villa, hotel and in-room searches. **Don't change its title or H1, and keep "Seminyak" in both.** Pages compete when they share a main term, not a location. This page owns "villa / hotel / in-room" and the outcall page owns "outcall / home service / home massage". Its best Seminyak query, "in villa massage seminyak", ranked at position 4.0 before the change. Two rules keep the pages apart:
- Don't add "outcall" or "home service" to this page's title or H1.
- Don't add "villa" or "hotel" to the outcall page's title or H1. Task 2 already removes "Villa or Hotel" from the outcall H1.

At the end of the FAQ answer "Is there an additional fee for home service?", add:
> Staying in a private home, or outside Seminyak? See our [outcall and home service massage across Bali](/outcall-home-service-massage/).

**`/massage-kuta/`.** At the end of the FAQ answer "Do you offer massage at hotels and villas near Kuta?", add:
> See our [home service massage](/outcall-home-service-massage/) page for prices and areas.

---

## Task 9: Before you deploy (acceptance checklist)

Run these against the preview deployment:

- [ ] `grep -rn "CONFIRM" <src>` returns nothing.
- [ ] The outcall page `<title>` and meta description exactly match Task 1, and the brand appears only once.
- [ ] The outcall page has exactly one H1: "Outcall & Home Service Massage in Seminyak, Bali".
- [ ] `curl -s <preview>/outcall-home-service-massage/` (the raw HTML, not the rendered page) contains the text of S02, S04, S06, S07, S08, S10 and the 7 new FAQs.
- [ ] In that raw HTML, "Seminyak" appears at least 15 times and "home massage" at least 3 times (case-insensitive).
- [ ] The section order matches Task 2. The ids `home-service-prices`, `how-it-works`, `areas` and `price-list` exist, and the jump links work.
- [ ] The JSON-LD on the outcall page and the homepage passes the Rich Results Test and validator.schema.org with no errors.
- [ ] The menu and footer labels match Task 4 on desktop and mobile, and the header fits on one line at 1280px.
- [ ] The outcall page is linked from the text (not only the menu) of at least 20 pages: Task 5, 6, 7 and 8 combined.
- [ ] Links in body text are bold, black and not underlined, and show a focus outline when you tab to them.
- [ ] Nothing scrolls sideways on a phone (375px). The comparison table scrolls inside its own container.
- [ ] Homepage title, H1 and meta description are unchanged.

---

## After deploy (for the owner, not the dev)

1. In Search Console, use **URL Inspection** and request indexing for the outcall page, then the homepage.
2. Add "Outcall massage" and "Home service massage" as services on the Google Business Profile. Then publish this post with a "Learn more" button linking to `https://spabalimoon.com/outcall-home-service-massage/`:
   > Massage at your villa, from our Seminyak spa. Our therapists bring the table, fresh linen and oils to villas, hotels and homes in Seminyak, Petitenget, Kerobokan and Canggu, and further across Bali when a therapist is free. Balinese, deep tissue, couples and four-hand massage, daily 9am to 11pm. Home service fee IDR 75.000 per therapist. Book on WhatsApp.
3. **Don't edit the outcall page for 4 weeks.** Each week, open Performance in Search Console, filter Page to the outcall URL, and watch "home service massage bali", "home massage bali", "outcall massage seminyak", "mobile massage bali" and "outcall massage canggu".
4. **Week 4 target:** home service searches back to around position 5 (from 8.0), and the Seminyak and Canggu outcall searches back in the top 6.
5. **Week 6 fallback,** only if home service searches are still at position 8 or worse: change the homepage title to `Seminyak Spa, Balinese Massage & Home Service | Spa Bali Moon`.
