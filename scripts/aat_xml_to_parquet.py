"""Flatten the Getty AAT XML dump into one Parquet for fast term lookup.

The AAT release ships as ~59K per-concept XML files inside a zip
(`aat_xml_0126.zip`, one `aat/300xxxxxx.xml` per concept). Iterating that zip
per query is slow; this parses it once into a single tidy Parquet keyed by term
text, so the taxonomy generator can do a hash-join from a raw TMS token to its
AAT concept, facet and parent.

Output schema (one row per *English term*, so a concept with synonyms appears on
several rows — exactly what term-text matching needs):

  term            lower-cased English term text (preferred or variant)
  is_preferred    bool, this term is the concept's preferred descriptor
  subject_id      AAT concept id (e.g. "300015012")
  pref_label      the concept's preferred English term (its canonical label)
  facet           "material" | "technique" | "" — from the Parent_String tail
                  (Materials Facet -> material, Activities Facet -> technique)
  parent_id       immediate broader concept id
  parent_label    head of the Parent_String (immediate broader term, no id)
  parent_string   the full broader chain, root-most last (kept for debugging)

Run (from the wireframes repo root):

    uv run --with polars python scripts/aat_xml_to_parquet.py \
        ~/Downloads/aat_xml_0126.zip src/data/taxonomy-tsv/aat_index.parquet
"""

import re
import sys
import zipfile
from pathlib import Path

import polars as pl

# Facet anchors live at the tail of every Parent_String. Only these two matter
# for medium classification; everything else is left unfacetted.
FACET_BY_ANCHOR = {
    "300264091": "material",  # Materials Facet
    "300264090": "technique",  # Activities Facet (Processes and Techniques)
}

_SUBJECT_ID = re.compile(r'<Subject\s+Subject_ID="(\d+)"')
_PREF_BLOCK = re.compile(r"<Preferred_Term>(.*?)</Preferred_Term>", re.S)
_NONPREF_BLOCK = re.compile(r"<Non-Preferred_Term>(.*?)</Non-Preferred_Term>", re.S)
_TERM_TEXT = re.compile(r"<Term_Text>(.*?)</Term_Text>", re.S)
_ENGLISH = re.compile(r"<Language>\d+/English</Language>")
_PARENT_ID = re.compile(r"<Parent_Subject_ID>(\d+)</Parent_Subject_ID>")
_PARENT_STRING = re.compile(r"<Parent_String>(.*?)</Parent_String>", re.S)
# An "<id>" suffix on each parent-chain hop, e.g. "coating by form [300015002]".
_HOP_ID = re.compile(r"\[(\d+)\]")


def _term_text(block: str) -> str | None:
    """First Term_Text in a term block, unescaped + trimmed (English only)."""
    if not _ENGLISH.search(block):
        return None
    m = _TERM_TEXT.search(block)
    if not m:
        return None
    txt = m.group(1).strip()
    txt = (
        txt.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&apos;", "'")
        .replace("&quot;", '"')
    )
    return txt or None


def _facet(parent_string: str) -> str:
    """Map the Parent_String tail anchor to material/technique (or "")."""
    for anchor, facet in FACET_BY_ANCHOR.items():
        if f"[{anchor}]" in parent_string:
            return facet
    return ""


def parse_concept(xml: str) -> list[dict]:
    """One concept's XML -> a row per English term. Empty if no usable data."""
    sid_m = _SUBJECT_ID.search(xml)
    if not sid_m:
        return []
    subject_id = sid_m.group(1)

    pref_m = _PREF_BLOCK.search(xml)
    pref_label = _term_text(pref_m.group(1)) if pref_m else None
    if not pref_label:
        return []  # no English preferred label -> not matchable, skip

    parent_string = ""
    ps_m = _PARENT_STRING.search(xml)
    if ps_m:
        parent_string = re.sub(r"\s+", " ", ps_m.group(1)).strip()
    facet = _facet(parent_string)

    parent_id = ""
    pid_m = _PARENT_ID.search(xml)
    if pid_m:
        parent_id = pid_m.group(1)
    # Head of the chain = immediate broader term, strip its "[id]".
    parent_label = ""
    if parent_string:
        parent_label = re.sub(r"\s*\[\d+\].*$", "", parent_string.split(",")[0]).strip()

    terms = {pref_label.lower(): True}
    for blk in _NONPREF_BLOCK.findall(xml):
        t = _term_text(blk)
        if t:
            terms.setdefault(t.lower(), False)

    return [
        {
            "term": term,
            "is_preferred": is_pref,
            "subject_id": subject_id,
            "pref_label": pref_label,
            "facet": facet,
            "parent_id": parent_id,
            "parent_label": parent_label,
            "parent_string": parent_string,
        }
        for term, is_pref in terms.items()
    ]


def main() -> None:
    """Parse the AAT zip into a Parquet index."""
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <aat_xml.zip> <out.parquet>", flush=True)
        raise SystemExit(2)
    zip_path = Path(sys.argv[1]).expanduser()
    out_path = Path(sys.argv[2]).expanduser()

    rows: list[dict] = []
    with zipfile.ZipFile(zip_path) as zf:
        names = [n for n in zf.namelist() if n.endswith(".xml")]
        total = len(names)
        print(f"Parsing {total:,} concept files from {zip_path.name} …", flush=True)
        for i, name in enumerate(names, 1):
            rows.extend(parse_concept(zf.read(name).decode("utf-8", "replace")))
            if i % 5000 == 0:
                print(f"  {i:,}/{total:,} files, {len(rows):,} term rows", flush=True)

    if not rows:
        raise SystemExit(
            f"No usable AAT concepts parsed from {zip_path} - wrong or corrupt zip?"
        )
    df = pl.DataFrame(rows)
    # A term string can map to several concepts; keep preferred first so a later
    # lookup can prefer the descriptor over a synonym.
    df = df.sort(["term", "is_preferred"], descending=[False, True])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.write_parquet(out_path)

    faceted = df.filter(pl.col("facet") != "").height
    print(
        f"Wrote {df.height:,} term rows "
        f"({df['subject_id'].n_unique():,} concepts, {faceted:,} faceted) "
        f"-> {out_path}",
        flush=True,
    )


if __name__ == "__main__":
    main()
