# Cleaning up the "Medium" field: one browsable Medium facet

How we turn TMS's messy medium data into a single clean, browsable **Medium**
facet, organised the way a visitor actually browses (by object type), while
keeping the curator's original wording for display.

## The problem

TMS records what an object is made of mainly in a free-text **medium** field
(`Objects.Medium`), with a small, separate set of structured **material terms**.

The medium field is the bulk of it: **136,783** web-visible objects carry a
Medium string, across **22,139** distinct values (16% distinct, so it's
genuinely free text, not a controlled vocabulary). It's messy in a specific way:

- **Materials and techniques are jumbled into one string.** The most common
  values mix techniques (`Etching`, `engraving`, `Lithograph`) with materials
  (`glass`, `silver`, `porcelain`) and composites that carry both at once
  (`Oil on canvas`, `black ink on paper`, `etching and engraving`).
- **Many values are multi-part prose**, joined by "and", "on", "with", commas
  and slashes, so a single field describes several things.
- No grouping: nothing tells you `bronze` and `silver` are both metals, or that
  `Etching` and `Lithograph` are both techniques.

The structured material terms (a TMS thesaurus xref, type 0 = Materials) are far
sparser: only ~291 distinct terms across ~1,489 objects. Useful where present,
but they cover barely 1% of the collection, so the medium prose is what we
mostly have to work with.

You can't build a usable filter sidebar from any of that. A visitor wants to
click "Prints" and see every print, or "Etching" and see every etching. Raw
TMS can't give them that.

## The solution in one sentence

We take **every** distinct TMS medium token, cross-reference it against the
**Getty AAT** vocabulary, and force-map it into a curated **3-level browse
tree** organised **by object type** (section, then technique/material family,
then a canonical leaf), while keeping the original TMS wording for display.
Every token is mapped, so faceting is total.

## One "Medium" facet, organised by object type

The key design decision: this is **one unified Medium facet**, not separate
Material and Technique facets. The top level is by **object type**, because that
is how a visitor thinks ("show me the prints, the paintings, the photographs"),
not by the material-vs-technique distinction that TMS happens to record.

This is what fixes the old "paper at 1%" problem. Paper is a **support**, not
the primary medium, so it must never be a top-level bucket. A print stays a
**Print** whatever it is printed on:

- `lithograph on wove paper` -> **Print** (not Paper)
- `ink on paper` -> **Drawing** (the ink is the medium; the paper is the support)
- `oil on canvas` -> **Painting**

The nine top-level sections:

- **Print** - Drawing - **Painting** - **Photograph** - **Textile**
- **Ceramic & glass** - **Sculpture** - **Decorative & other materials**
- **Other / unclassified** (the catch-all when nothing else matches)

## The tree shape

Three levels:

- **Level 1 - Section (object type).** The nine buckets above. A section can
  optionally declare an AAT facet bias (`Print` leans technique, `Textile`
  leans material, `Sculpture`/`Decorative` accept either) that gates only the
  fuzzy AAT-chain fallback, never a direct keyword hit on the token.
- **Level 2 - Subcategory.** Within a section, the technique or material family:
  e.g. `Etching & engraving (intaglio)`, `Lithographs (planographic)`,
  `Natural fiber (silk, wool, cotton)`, `Porcelain`. Labels are **public-first
  with the specialist term in parentheses**, so a general visitor reads the
  plain meaning and a specialist sees the precise term.
- **Level 3 - Specific.** A small curated canonical leaf per subcategory
  (`Etching`, `Engraving`, `Drypoint`, `Silk`...). Every raw variant collapses
  to one leaf, so opening a subcategory shows a handful of filters, not
  thousands of near-duplicate strings. A genuine conjunction composite
  ("etching and engraving") collapses to the subcategory's "Mixed" leaf; bare
  adjacency ("offset lithograph") lets the specific win.

The finest facet is the canonical Level-3 leaf. The **verbatim TMS term is
never a facet value** - it is preserved only for display on the object page, in
the crosswalk's `token` column.

## How the classifier decides

The classification cascade, per token, runs in this order:

1. **Curated keyword rules first.** An ordered keyword table at each level;
   first match wins, so lists run specific-before-general. Long keywords
   (>= 6 chars) match as a substring so "etching" also catches "etchings";
   short ones ("tin", "oil", "iron") need a whole word so they don't hit inside
   "coating"/"soil". A direct keyword hit on the token is trusted outright,
   regardless of AAT's material/technique verdict.
2. **AAT fallback second.** Where no curated keyword fires, the token's matched
   AAT concept supplies the section (via its broader-term chain, facet-gated)
   and a clean **preferred label** as the leaf, so the long tail gets authority
   terms (`Quartzite`, `Resin`, `Goat hair`) instead of one dumping-ground
   bucket.
3. **Catch-all last.** Anything still unresolved lands in
   `Other / unclassified` at the section level, or the subcategory's "Other"
   leaf. Nothing is left unmapped: faceting is total.

Each crosswalk row records **how** it was decided (`source` = `keyword` / `aat`
/ `other`), so a reviewer can see at a glance which mappings rest on a curated
rule versus the AAT fallback.

## The pipeline, step by step

### 1. Pull the full medium vocabulary from TMS

`collection-flow-famsf-real/scripts/probe_medium_full_list.py` dumps every
distinct `Objects.Medium` value (web-visible scope) as two files:

- `medium_strings.tsv` - the verbatim strings (the display side, kept untouched).
- `medium_tokens.tsv` - the strings split on **hard delimiters only** (comma,
  semicolon, slash, pipe, newline) in SQL, so composite phrases like "oil on
  canvas" stay whole while "etching, drypoint" splits into two. Connective
  words (on/and/with) are not split. The token count is a true per-token object
  count.

### 2. Flatten the Getty AAT dump to a lookup file

`scripts/aat_xml_to_parquet.py` parses the Getty AAT XML release
(`aat_xml_0126.zip`, ~59K per-concept files) into a single
`src/data/taxonomy-tsv/aat_index.parquet`. One row per English term (a concept
with synonyms appears on several rows), each carrying its AAT concept id,
preferred label, **facet** (material vs technique, read from the concept's
`Parent_String` facet anchor) and broader-term chain. This is the authority
backbone: it tells us whether a term is a material or a technique, and supplies
a clean label for the long tail.

### 3. Build the crosswalk

`scripts/build_material_taxonomy.py` is a thin driver. It left-joins the TMS
tokens to the AAT index, runs each token through the `MaterialClassifier`, and
writes two TSVs:

| File | Role |
|---|---|
| `token_facet_map.tsv` | the crosswalk: `token -> facet, section, subcategory, specific, aat_id, source, object_count`. The durable TMS<->facet relationship; `token` is the verbatim TMS term for object-page display. |
| `facet_sections.tsv` | the rolled-up 3-level tree with term + object counts per leaf, for building the facet UI. |

### 4. Push a review surface to the curator workbook

`scripts/push_facet_review_sheet.py` writes two **native Google Sheets tables**
to the Material workbook (`14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI`):

- **Facet tree** - the Section -> Subcategory -> Specific rollup with object
  counts and share, so the workbook opens on the big picture.
- **Facet review** - one row per TMS term, ordered by object volume, showing
  the verbatim term beside its proposed 3-level mapping, the AAT id, and how the
  mapping was decided (`Mapped by`). An **Approve?** dropdown column (Yes /
  Change section / Change subcategory / Drop) is the curators' work surface.

Both are real Sheets table objects, so counts sort numerically, share renders as
a percent, and the dropdown is a typed column with banded rows and a filter UI.

A companion **Place workbook**
(`1_uqqeFeUViwDKUYWGCfjLesqA-tA8Uwe8siqWKrR0z0`, REGION_REMAP) does the same job
for geography - the place taxonomy, separate from medium (see
`place-geography-taxonomy.md`).

## Where the code lives

The classifier logic and curated keyword tables are a **module**, so they can be
unit-tested and edited independently of the build driver:

- `scripts/material_taxonomy/taxonomy_config.py` - the data: `SECTIONS` (L1
  object-type keyword sets + optional AAT-facet bias), `SUBCATEGORIES` (L2
  family keyword sets per section), `SPECIFICS` (L3 canonical-leaf keyword sets
  per subcategory).
- `scripts/material_taxonomy/classifier.py` - the `MaterialClassifier` class and
  the `FacetPath` result (`section`, `subcategory`, `specific`, `source`). Holds
  the substring-vs-whole-word matching, first-match-wins ordering, conjunction
  "Mixed" handling, and the AAT-label fallback.
- `scripts/material_taxonomy/test_classifier.py` - 25 unit tests over the
  matching rules.
- `scripts/build_material_taxonomy.py` - the thin driver that joins tokens to
  AAT, runs the classifier, and writes the two TSVs.

## Section shape (latest build)

Object volume by section, from the latest build. Print dominates (FAMSF's
Achenbach graphic-arts holdings), which is exactly why the object-type framing
matters: nearly every print carries "on paper" prose that the old material-first
model buried under Paper.

| Section | Share of objects |
|---|---|
| Print | 54.0% |
| Textile | 11.5% |
| Other / unclassified | 7.8% |
| Decorative & other materials | 6.9% |
| Drawing | 6.4% |
| Photograph | 4.6% |
| Ceramic & glass | 3.9% |
| Painting | 3.7% |
| Sculpture | 1.1% |

## Verified against live TMS

Claims here were checked against the live TMS (web-visible scope) on 2026-06-30
via `collection-flow-famsf-real/scripts/probe_medium_taxonomy_claims.py`:

- Medium populated on 136,783 objects, 22,139 distinct values (16% distinct).
- No casing-only duplicate spellings: the messiness is composite prose, not
  case variance.
- Structured material terms (xref type 0): 291 distinct, 1,489 objects.
- Token/term exact overlap: 203 of 291 terms (~70%).

## Important caveat

**This is wireframe-only right now.** The clean taxonomy lives entirely in the
wireframes repo. It is **not yet** wired into the real ETL pipeline
(`collection-flow-famsf-real`) or into Elasticsearch. It's a curator deliverable
plus a demo crosswalk that proves the design works. Productionising it (running
the crosswalk inside the pipeline so every indexed document carries the clean
Medium facet) is a separate, not-yet-done step.

## Files at a glance

- **TMS pull** - `collection-flow-famsf-real/scripts/probe_medium_full_list.py`
  -> `output/medium_tokens.tsv` + `medium_strings.tsv`
- **AAT index** - `scripts/aat_xml_to_parquet.py` (input `~/Downloads/aat_xml_0126.zip`)
  -> `src/data/taxonomy-tsv/aat_index.parquet`
- **Taxonomy module** - `scripts/material_taxonomy/` (`taxonomy_config.py` data,
  `classifier.py` `MaterialClassifier`, `test_classifier.py` 25 tests)
- **Build** - `scripts/build_material_taxonomy.py`
  -> `token_facet_map.tsv` (crosswalk) + `facet_sections.tsv` (tree)
- **Push to client** - `scripts/push_facet_review_sheet.py`
  -> "Facet tree" + "Facet review" tables in the Material workbook
  (`14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI`)

Run order: pull -> aat index -> build -> push.

## Provenance note (earlier versions)

Two earlier designs were superseded. The first was built curator-first in the
Material workbook (`master_v2` / `FACET_DESIGN_v2` tabs, a 2-level Material +
Technique design) using rules + embeddings + an LLM pass. The second was an
8-section model split explicitly by material vs technique (`Printmaking &
Technique`, `Paint & Drawing Media`, `Paper`, `Metal`...), which pushed paper
and metal up as top-level buckets and buried the objects a visitor actually
searches for. The current model replaces both: full TMS coverage, AAT-anchored,
a 3-level tree organised by **object type**, and a total (every-token-mapped)
crosswalk.
