# Copy rewrite (October 2026): what was applied

Source: `spabalimoon-rewritten-copy.md` (dated Oct 12, 2026), applied on
15 October 2026. Not deployed yet.

## Applied

**All 24 treatment pages** (`src/content/treatments/*.json`)

- An opening paragraph and a quick-facts box right under the banner (new
  section `QuickFacts`, editable in /admin/ as "Opening & quick facts"),
  ending with "Last updated".
- Decorative labels removed: the small headings above titles, the banner
  phrase above the H1, the photo badges ("Follow the Flow", "Stretch Into
  Balance"…) and the words on the FAQ photo. "Frequently Asked Questions"
  stays, and so does one "17+ Years Experience" badge per page. A photo whose
  badge was removed loses the notch the badge sat in.
- Reviews: six chosen reviews under "Reviews of Spa Bali Moon", with a link to
  the rest on Google (also on /massage-kuta/ and /villa-hotel-massage/, which
  share the slider).
- Related treatments: four per page instead of the same sixteen.
- FAQs: the new questions added at the end of each list, the "Now/Rewrite"
  answers replaced; lymphatic has the whole worked-example list. FAQPage
  structured data on every treatment page.
- Page-specific edits: ear candle H2 and answers, coconut oil H1
  ("Virgin Cold-Press Coconut Oil Massage"), "Sports massage" throughout the
  sports page, "We offer" fixes (cream bath, facial), facial address, couple
  FAQ listing the four couple massages, Thai "What should I wear?", duplicate
  manicure FAQ removed, Day Spa shows five popular treatments instead of all.

**Main pages**: homepage (quick-facts line, About text, treatments intro,
home-service FAQ, three new FAQs), /seminyak/ (quick answer under the H1, two
FAQ answers), outcall (opening, Balinese block, two FAQs), villa (quick
answer, booking line, group FAQ), Kuta (new H1, meta title and description,
quick answer, duration FAQ, cost FAQ), /contact/ (9:00 - 23:00, full address,
line under the H1). FAQPage data on all of them; the homepage business data
now has the address, hours, price range and map position.

**Site-wide**: full address in the footer, phone menu and Privacy Policy;
"Sports Massage" on the Kuta, villa, outcall and price-list pages; guide
cards show the article's excerpt; articles show "Updated <date>"; the two old
slimming/flight article redirects now reach the current article in one hop.

## Choices made while applying it

- **Prices are written "IDR 300.000"**, the site's format since 14 Oct, not
  "IDR 300K" as in the document. Same amounts.
- Owner edits saved in /admin/ (Sport, Sunburn, Thai, Traditional, Waxing)
  were copied into the built-in pages first, then rewritten. Saves made before
  15 Oct 08:04 UTC are no longer used (`src/lib/treatments/content.ts`), so
  the new copy shows on those five pages. Two typos in those edits were fixed
  ("with the our therapist", "for another reasons").
- Nail art quick facts: "…and extensions" left out; the nail page never
  offers extensions.
- Related treatments: Aromatherapy has no page of its own, so Balinese and
  Coconut Oil show Hot Stone instead.
- Couple quick facts: one row per massage (Balinese, Traditional, Deep
  tissue, Warm candle, each "for two") instead of one long row.
- Quick answers on /seminyak/, villa, Kuta and /contact/ sit in the banner
  under the H1, like the outcall opening.
- The small "About" heading that villa, Kuta and Day Spa showed by default on
  one section is gone.
- Kuta meta title uses " - " like every other title on the site.

Already in place before this work: the outcall price list shows the home
service fee once; footer labels are not headings; FAQ numbers are drawn by
CSS, not in the heading text; the two 404 guide URLs already redirect.

## For the owner to confirm before publishing

1. Therapists "usually arrive within 30 to 60 minutes" in every area
   (villa banner).
2. Same-day outcall "depending on therapist availability" (outcall FAQ).
3. Package prices: per person or per booking? Not stated anywhere yet.
4. Hair braiding extensions: "message us on WhatsApp for the price".
5. **Waxing as home service:** the waxing page still says nothing. The outcall
   price list does list waxing, so probably yes; one line can be added once
   confirmed.
6. Safety lines (doctor for painful or one-sided leg swelling; no sunburn
   treatment on blistered skin).
7. The six reviews and their names (texts are exact; names as the document
   writes them, e.g. "Willy Coppenolle" for "WILLY COPPENOLLE").
8. Waxing wording: the quick facts say "olive oil hot wax" (from the spa
   menu); the owner's page text says strawberry hard wax for delicate areas
   and olive oil strip wax for larger areas.

## To do after deploying

- **Cloudflare**: upload the new `tools/cloudflare/bulk-redirects.csv`
  (2 redirects changed; see `tools/cloudflare/README.md`).
- **Guide articles** (in the database, edited in /admin/): add the drafts
  below under each article's first heading; remove the "How Facial Massage
  Supports Skin Wellness" section from the Thai massage article; fill the
  Excerpt of the articles that have none (it now shows on /guide/).
- **IV Drip post**: decide whether it stays; if so, have a medical
  professional check the claims.
- If a treatment page is edited in /admin/ before this goes live, check it
  again after deploying.
- Not done: a visible "last updated" date on the homepage, /seminyak/,
  outcall, villa, Kuta, contact and reservation (treatment pages and guide
  articles have one).

## Draft: two sentences under each guide article's first heading

Each names Spa Bali Moon and links to the treatment page with its price.
Links in brackets.

- **Jet lag recovery** (under "What is Jet Lag?"): At Spa Bali Moon in
  Seminyak, a [lymphatic drainage massage](/seminyak/lymphatic-drainage-massage/)
  is often chosen after a long flight, from IDR 300.000 per person for one
  hour. For a full-body massage, a one-hour
  [Balinese massage](/seminyak/balinese-massage/) is IDR 159.000.
- **8 back massage techniques** (under the comparison heading): To have a back
  massage done for you, Spa Bali Moon in Seminyak offers a 30-minute back
  massage from IDR 90.000 per person (see the [price list](/seminyak/)). A
  full-body [Balinese massage](/seminyak/balinese-massage/) is IDR 159.000 for
  one hour.
- **Thai or Balinese** (under the first heading): At Spa Bali Moon in Seminyak,
  a one-hour [Balinese massage](/seminyak/balinese-massage/) is IDR 159.000
  per person and a one-hour [Thai massage](/seminyak/thai-massage/) is
  IDR 259.000. Balinese massage uses oil and steady pressure; Thai massage is
  oil-free, with assisted stretching.
- **Facial massage** (under "More Than Just a Beauty Treatment"): At Spa Bali
  Moon in Seminyak, every [Bali Moon Facial](/seminyak/facial/) includes an
  Argan Oil lymphatic facial massage. The Tea Tree Facial is IDR 196.000 and
  the Gold Facial IDR 269.000 per person.
- **Slimming massage** (under "What Is a Slimming Massage?"): At Spa Bali Moon
  in Seminyak, the closest treatment is the
  [cellulite massage](/seminyak/anti-cellulite-massage/), a firm massage on the
  thighs, hips, buttocks and abdomen from IDR 350.000 per person for one hour.
  For a gentler option, [lymphatic drainage massage](/seminyak/lymphatic-drainage-massage/)
  with slimming cream starts at IDR 300.000.
- **Balinese massage** (under "Definition of Traditional Balinese Massage"):
  At Spa Bali Moon in Seminyak, a [Balinese massage](/seminyak/balinese-massage/)
  is IDR 159.000 for 1 hour, IDR 239.000 for 1.5 hours and IDR 330.000 for
  2 hours per person, at our spa or at your villa or hotel. It is the
  treatment we recommend most often for first-time guests.
- **Lymphatic drainage** (under "What Is Lymphatic Drainage Massage?"): At Spa
  Bali Moon in Seminyak, a [lymphatic drainage massage](/seminyak/lymphatic-drainage-massage/)
  is a slow, very light massage from IDR 300.000 per person for one hour, at
  our spa or at your villa or hotel. It is a relaxation treatment, not a
  medical one.
- **Thai massage** (under "What Is Thai Massage?"): At Spa Bali Moon in
  Seminyak, [Thai massage](/seminyak/thai-massage/) is IDR 133.000 for
  30 minutes, IDR 259.000 for 1 hour and IDR 379.000 for 1.5 hours per person.
  It is oil-free, so wear comfortable clothing you can move in.
