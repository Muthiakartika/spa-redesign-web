"""Split the two preloaded Latin web fonts into a small core file and the rest.

PageSpeed, 21 Oct: the homepage preloads Literata (89 KB) and Mulish (30 KB),
and on a slow phone they share the line with the hero photo. Every text on
the site uses only the characters in CORE (swept on all 44 pages at 412 and
1440px); the rest of each file's Latin range moves to a second file that a
browser downloads only for a page that needs one of those characters. Same
outlines, kerning and variation axes for every character, so nothing looks
different.

Also dropped: OpenType features no page asks for (tnum, pnum, frac, numr,
dnom). If a style ever uses font-variant-numeric: tabular-nums or fractions,
run this again with them added to FEATURES.

Needs fontTools with brotli (pip install fonttools brotli). From the repo root:
    python tools/fonts/split-latin.py
"""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

WEBFONTS = Path(__file__).resolve().parents[2] / "public" / "webfonts"

# Source file -> name of the two new files.
FONTS = {
    "literata-latin-opsz12-72.woff2": "literata-latin-opsz12-72",
    "1Ptvg83HX_SGhgqk3wotYKNnBQ.woff2": "mulish-latin",  # Mulish, variable weight
}

# Must match the unicode-range of the "-core" @font-face rules in
# src/styles/live.css. U+0000-00A0 is ASCII, the control codes and the
# no-break space; U+2011 and U+2060 are in neither font (they fall back as
# before) but are used in Mulish text, so they stay here and never pull in
# the second file.
CORE = [(0x0000, 0x00A0), 0x00A9, 0x00B0, 0x00B7, 0x00D7, 0x2011, (0x2013, 0x2014),
        (0x2018, 0x2019), (0x201C, 0x201D), 0x2022, 0x2026, 0x2060]

FEATURES = ["ccmp", "locl", "rvrn", "liga", "clig", "rlig", "calt", "kern", "mark", "mkmk", "lnum"]


def codepoints(ranges):
    out = set()
    for r in ranges:
        lo, hi = r if isinstance(r, tuple) else (r, r)
        out.update(range(lo, hi + 1))
    return out


def save_subset(src, unicodes, dest):
    font = TTFont(src)
    options = subset.Options()
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.hinting = True
    options.legacy_kern = True
    options.drop_tables = []
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(unicodes))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(dest)


core = codepoints(CORE)
for source, name in FONTS.items():
    src = WEBFONTS / source
    cmap = set(TTFont(src).getBestCmap())
    for part, chars in (("core", cmap & core), ("more", cmap - core)):
        dest = WEBFONTS / f"{name}-{part}.woff2"
        save_subset(src, chars, dest)
        print(f"{dest.name}: {dest.stat().st_size:,} bytes, {len(chars)} characters")
