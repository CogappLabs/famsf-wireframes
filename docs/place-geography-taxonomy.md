# Place / Geography facet — taxonomy design

CW Place spec. Source-to-facet design for the FAMSF collection-search **Place**
filter (modelled on the Harvard Art Museum Place filter). This is the handoff
for building a Place-facet wireframe; it captures the agreed taxonomy shape, the
data behind it, and where the reviewable curator data lives.

Pipeline decisions are recorded canonically in
`collection-flow-famsf-real/CONTEXT.md` (glossary) and
`collection-flow-famsf-real/docs/adr/0002-place-facet-shape.md` (the ADR). This
doc is the wireframe-facing summary.

## TL;DR for the wireframe

- **Three-tier drill-down facet**: curated region → country → notable place.
- Tier labels at tier 3 are **"City, Country"** (San Francisco, United States).
- Regions are **audience-friendly and collection-weighted**, not strict
  geography. Asia is split (East / South / Central / Southeast Asia + Middle
  East); the Americas split (North / Central America + West Indies).
- Mechanically two/three flat Elasticsearch keyword facets, NOT a hierarchical
  facet — same pattern as the Material facet. Each deeper level narrows once the
  result set is filtered to the level above.

## The three tiers

| Tier | What | Example | Count |
|------|------|---------|-------|
| 1 — curated region | audience bucket, collection-weighted | East Asia, Middle East, West Indies | ~13 buckets |
| 2 — country | English-default country | France, Japan, United Kingdom | 188 nodes |
| 3 — notable place | city/historic place ≥25 objects, shown under its country, labelled "City, Country" | San Francisco, United States | 74 nodes |

Below the tier-3 threshold (252 nodes / ~2.5K objects) and dropped admin units
(9 nodes — California etc.) are **searchable but not in the facet**.

### Why three tiers, not the raw geographic tree

Every TMS place term carries a Getty TGN code whose prefixes are its ancestors,
so a hierarchy exists for free — but it is the wrong tree for visitors:

- TGN tags leaves at wildly different depths (England depth 5, Paris 5,
  Amsterdam 7, London 8) — a depth-based tier is incoherent.
- TGN has only six real continents; the collection is lopsided (see weighting).
- TGN files constituent countries on unrelated branches (England sits nowhere
  near the GB/UK node).

So the tiers are **curated, overriding TGN where needed**, not a TGN walk.

## Collection weighting (drives the region buckets)

Objects by TGN continent (an object can have several places, so these sum to
more than the ~141K collection):

| Region | Objects |
|--------|--------:|
| Europe | 78,452 |
| North and Central America | 46,291 |
| Asia | 10,387 |
| Africa | 2,555 |
| South America | 1,210 |
| Oceania | 1,023 |

Europe + N. America dominate, so the curated regions give them and the
well-represented Asian sub-regions their own buckets rather than mirroring a
flat six-continent model.

## Agreed design decisions

1. **Pooled facet, all six TMS place xref-types** (Place of Creation, Related
   Geography, Place of Fabrication, Intended Market, Find Spot, Place of
   original Distribution). One object can appear under several places (a French
   print depicting Japan → both France and East Asia). NB: Place of original
   Distribution is not yet in the extract and must be re-added.
2. **United Kingdom is the tier-2 net** — England, Scotland, Wales, N. Ireland
   sit under it (overriding TGN). Ireland (Republic) is kept separate.
3. **Historic names kept as their own value next to the modern name**, never
   merged. Assyria sits in Middle East beside Syria, with a `historic` flag.
4. **No "Ancient & Byzantine World" region** — too small (~570 objects), mixes
   unrelated cultures (Mughal/Inca aren't "Byzantine"), and contradicts the
   sibling rule. An "ancient world" browse belongs to a future Date/Period
   facet, not Place.
5. **English-default labels**, with a curator allowlist `override_label` for
   deliberately-kept indigenous/endonym names (Aotearoa over New Zealand).
6. **Tier-3 labels uniformly "City, Country"** so homonyms (Birmingham UK vs
   Birmingham Alabama — both legitimate) never collide in the facet.
7. **No "Unidentified" bucket** — unmapped places are searchable, not
   filterable.

## What the wireframe should show

- A **region list** (tier 1) — collection-weighted order, ~13 entries.
- Selecting a region reveals its **countries** (tier 2).
- Selecting a country reveals its **notable places** (tier 3), labelled
  "City, Country".
- Each level: top-X by object count + search-within (same as the Material
  facet), so the long tail is reachable by typing without bloating the list.
- A worked example to mock with: **Europe → France → Paris, France**; and the
  re-parent case **Europe → United Kingdom → England, United Kingdom**.

## The data (Google Sheets — curator review)

Live review workbook (built from the TMS extract, auto-assigned where possible,
flagged where a curator decision is needed):

**https://docs.google.com/spreadsheets/d/1_uqqeFeUViwDKUYWGCfjLesqA-tA8Uwe8siqWKrR0z0/edit**

Tabs:

- **README** — cover note: the design, the decisions, the curator asks.
- **REGION_REMAP** — the deliverable: every place → tier, country, auto-assigned
  region, `display_label` ("City, Country"), confidence. Amber rows need a
  curator decision.
- **MERGE_SUGGESTIONS** — historic↔modern pairings to confirm.
- **alt_label_collapse** — English-default vs endonym decisions.
- **DATA_ISSUES** — source-data problems for FAMSF (same-place-twice etc.), each
  with example accession numbers.
- **place_terms / place_hierarchy / region_rollup** — reference.

The medium/material sibling workbook (same shape, for the Material facet) is at
https://docs.google.com/spreadsheets/d/14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI/edit

## How the data + sheets are produced

In `collection-flow-famsf-real/scripts/` (one-off analysis, not Dagster assets):

- `place_taxonomy.sql` — distinct place nodes, hierarchy, region rollup,
  alt-labels, merge suggestions (reads the committed parquet extract).
- `place_remap.sql` — the REGION_REMAP deliverable (tier + country + region
  auto-assign + "City, Country" display label).
- `place_data_issues.sql` — the DATA_ISSUES findings (with accession samples).
- `push_place_sheets.py` / `polish_place_tables.py` / `highlight_place_issues.py`
  — push CSVs to the workbook, format, and highlight the curator-action rows.

These push scripts use **`cogapp-sheets`** (`~/git/cogapp-sheets`), a thin
ADC-authed wrapper over the Google Sheets API. **Auth is Application Default
Credentials** (`gcloud auth application-default login`) — no tokens or `.env` in
any repo. Reusable helpers: `sync_csv` (CSV → native banded table, clears the
tab first), `set_column_widths` / `wrap_all` / `set_table_column_types`
(by header name), `highlight_by_value` (conditional format keyed on a column
name, survives reordering), `write_text_block` (README/cover tabs).

## Not yet built (pipeline)

The facet fields are designed but not emitted. To ship: re-add place xref-type
46 to `object_terms.sql`; add a `prepare`-stage asset emitting
`place_region[]` / `place_country[]` / `place_notable[]` + a `historic` flag per
object, fed by the curator-finalised REGION_REMAP (committed as a crosswalk,
same pattern as the medium `category_rollup`). See ADR 0002.
