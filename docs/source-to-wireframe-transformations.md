# Source → Wireframe transformations

What we're doing to TMS data between extraction and rendering, so cataloguers + stakeholders can see where each rule lives and audit conformance against the FAMSF Object Cataloguing Guidelines.

Four layers:

1. **TMS (MSSQL source database)** — what curators type, the raw shape from `Objects`, `ObjTitles`, `ObjConstituents`, `ConDisplayBios`, `ObjGeography`, `TextEntries`, `ObjDimensions`, `ObjBibliography`, `ObjExhibitions`, etc. Filtered by the `vCI_PrismObjectsFilter_Cogapp` / `vCI_PrismPeopleFilter` / `vCI_PrismMediaFilter` views for web-visibility scoping. Sensitive data (financial, donor PII, internal notes, conservation) excluded at this layer.
2. **Pipeline transform** (`collection-flow-famsf`) — Dagster + Polars + Pandera. Extract SQL pulls live TMS rows, transforms cast types + null sentinels + strip HTML, joins nest related streams, prepare projects into the canonical `collection_documents` / `constituent_documents` shape with parsed structures.
3. **ES index shape** — what lands in Elasticsearch (Elastic Cloud Serverless `cf-famsf-collection` alias). Includes raw curator strings AND parsed structured siblings (e.g. `provenance` + `provenance_structured`).
4. **Wireframe render** (`famsf-collection-wireframes`) — display-time conventions that don't require schema changes (CMOS italics heuristic, descriptive-title bracket stripping, deep-linking metadata to filtered search).

Each item below cross-references the cataloguing guideline section (`§Name`), names the pipeline file or wireframe component, and notes the failure mode the change prevents.

---

## TMS source tables (DB layer)

What each top-level surface reads from TMS, joined live in extract SQL.

| Wireframe area | Primary TMS tables | Notes |
|---|---|---|
| Object tombstone | `Objects` + lookups (Classifications, Departments) | One row per object via `vCI_PrismObjectsFilter_Cogapp` |
| Title alternates | `ObjTitles` | Multiple rows per object; primary title = lowest DisplayOrder |
| Constituents | `ObjConstituents` + `Constituents` + `ConDisplayBios` + `Roles` | One row per object-constituent link; deduped via `SELECT DISTINCT` to avoid ConXrefDetails fan-out |
| Geography terms | `ObjGeography` + `ThesXrefs(TableID=108)` + `Terms` + `PlaceCoordinates` | TGN-sourced lat/lon via `PlaceCoordinates.ID` (DirectionID=1/2 for lat/lon) |
| Term attributes | `ObjectsThesXrefs` + `Terms` + `ThesXrefTypes` | Pivoted to `term_*` columns per attribute family |
| Long text (Provenance / Bibliography / Exhibitions / Web Text / Didactic Label / Identifying Description) | `Objects.Provenance` etc + `TextEntries(TextTypeID=192/185/230/158)` | Objects columns preferred over TextEntries for line-break fidelity (2026-05 switch); TextEntries used for fields that aren't on Objects |
| Dimensions | `ObjDimensions` + `DimensionElements` | `ElementName` (Overall / Framed / Frame / Sheet) joined via DimensionElements |
| Media | `MediaXrefs` + `MediaMaster` + `vCI_PrismMediaFilter` | One approved image per object via PrismMediaFilter |
| Exhibition history | `ObjExhibitions` + `Exhibitions` | Structured array; Objects.Exhibitions free-text fallback |
| Parent / child | `Objects.PhysicalParentID` + accession-prefix synth | FK takes precedence; synth derives child links from accession-number prefix matching when FK is missing |
| Rights | `Objects.Copyright` + `Objects.ObjectRightsType` + `term_rights_statement` (controlled-vocab Attribute) | Three distinct fields; see Rights section below |
| Acquisition date | `ObjAccession.AccessionISODate` | ~80% fill; ES-typed `date` with `ignore_malformed:true` |
| Museum location | `Locations.LocationString` + `Objects.LocationID` | Joined via `ObjComponents.CurrentObjLocID → ObjLocations.LocationID` |

Sensitive fields explicitly excluded at extract SQL: lender / owner / donor PII, internal cataloguer notes, conservation records, valuation / insurance amounts, audit trails beyond `LastModified`.

---

## Object record

### Title

| Source state | Transformation | Where |
|---|---|---|
| `DisplayedTitle` may be wrapped in `<...>` brackets denoting descriptive (cataloguer-assigned) title per §Titles | At render: strip leading `<` + optional trailing `>`, mark `isDescriptive=true`, italicise. Handles truncated descriptive titles (no closing `>`). | `lib/text-format.ts` `normaliseTitle` |
| Literal `"untitled"` / `"UNTITLED"` etc | Normalise to `"Untitled"` per §Titles L1860 | same |
| Alternate titles ship with raw TitleType (`Exhibition Title`, `Foreign Language Title`) | Pipeline emits `TitleTypeDisplay` short label (`Exhibition`, `Foreign language`) on every alternate title row | `transform/object_titles.py` `_TITLE_TYPE_DISPLAY` map |

### Date

| Source state | Transformation | Where |
|---|---|---|
| `Dated` may carry `B.C.`, `A.D.`, `B.C.E.`, `C.E.` with periods | Strip periods → `BC`, `AD`, `BCE`, `CE` per §Date L489 | `prepare/collection_documents.py` `_add_display_date_normalised` |
| Date range with hyphen (`1840-1926`) | Replace with en dash (`1840–1926`) per §Date L483 | same |
| Constituent `DisplayDate` carries same drift | Identical normaliser applied at transform stage so artist pages get the same treatment | `transform/object_constituents.py` `_normalise_display_date` |

### Provenance

| Source state | Transformation | Where |
|---|---|---|
| Curator-typed prose with inline `[1]` `[2]` footnote refs and `[N] …` footnote blocks at the bottom (§Provenance/Collection History) | Pipeline parses into `provenance_structured: { lines: [{order, text, refs[], is_uncertain}], footnotes: [{num, text}] }` and ships alongside the raw `provenance` string | `utils/provenance.py` `parse_provenance` |
| Square-bracketed entries (`[Sold to X, 1955]`) denoting uncertain ownership per FAMSF convention | Pipeline flags `lines[].is_uncertain = true`; wireframe italicises + greys the line, adds tooltip "Uncertain provenance entry" | `ProvenanceText.tsx` |
| Inline `[N]` markers | Wireframe renders as blue superscript anchor links → `#prov-footnote-N`; clicking jumps to footnote block with `target:bg-yellow-50` highlight | same |

### Bibliography

| Source state | Transformation | Where |
|---|---|---|
| `Objects.Bibliography` ships as plain text with blank lines between citations (§Bibliography L386) | Wireframe splits on blank lines, renders as numbered `<ol>` with hanging indent (CMOS NOTES convention) | `BibliographyText.tsx` |
| TMS curators do not use rich-text widget; ships plain (no italics) | Wireframe applies CMOS-style italics heuristic post-render: book titles between `, ` and `(City: Publisher, Year)`; exhibition catalogues before `, exh. cat.`; journals after closed-quote article title and before vol/no/year. Authors protected (sit before first comma) | `italiciseBibliographyEntry` |
| Pipeline `strip_html` historically stripped ALL tags | Now allow-lists `em`, `strong`, `i`, `b`, `u`, `br`, `sub`, `sup`, `ul`, `ol`, `li` — preserves any curator-supplied italics that do exist | `utils/text_cleaning.py` `strip_html` |

### Dimensions

| Source state | Transformation | Where |
|---|---|---|
| `DisplayDimensions` is a single string like `65 3/8 x 56 in. (166.1 x 142.2 cm)` (§Dimensions) | Pipeline parses into `dimensions_structured[].measures: { height_cm, width_cm, depth_cm, height_in, width_in, depth_in }`. Handles imperial fractions, metric-only, imperial-only, no-unit fallback | `utils/dimensions.py` `parse_dimensions` + `transform/object_dimensions.py` |
| Curator-flagged "not for web" rows (`Displayed=false`) | Wireframe filters non-displayed rows out of the visible dimensions list (no "(hidden)" badge) | `objects/sample/[variant]/page.tsx` |
| Scale diagram needs primary measurement | Picks `Overall` row → first row with `height_cm` → first row, sized in cm against a 170 cm human silhouette + 18 cm banana for scale | `object-detail/ScaleDiagram.tsx` |

### Rights statement

| Source state | Transformation | Where |
|---|---|---|
| `term_rights_statement` is a controlled-vocab Attribute (§Object Rights Statement L2606) | Wireframe maps `In Copyright` / `No Copyright – United States` / `Copyright Undetermined` to canonical rightsstatements.org URIs, renders as linked badge | `objects/sample/[variant]/page.tsx` `rightsStatementMap` |
| `copyright` is a separate free-text TMS field | Rendered under label "Copyright" (not "Rights statement") to keep the two distinct | same |
| `object_rights_type` (`Public Domain` / `In Copyright` / etc) | Gates the "Download" button — disabled with "(IN COPYRIGHT)" suffix when not public-domain | same |

### Exhibition history

| Source state | Transformation | Where |
|---|---|---|
| Structured `exhibitions[]` array per TMS join (title / date / venue) | Wireframe formats per §Exhibition History L780-787: `City, Venue, Month Day, Year – Month Day, Year. "Exhibition Title," no. X`. Quotation marks (not italics) per §Exhibition History L789 | `ExhibitionRow.tsx` |
| `exhibition_history_text` (Objects column free-text) | Rendered with `whitespace-pre-line` after pipeline sanitiseHtml — paragraph breaks via double `<br/>` per §Exhibition History L823 | `objects/sample/[variant]/page.tsx` |

### Constituents (per-object render)

| Source state | Transformation | Where |
|---|---|---|
| Grouped by raw `Role` string | Wireframe groups by `Role`, sorts groups by min DisplayOrder, sorts members within group by DisplayOrder | `objects/sample/[variant]/page.tsx` |
| `DisplayName` | Linked to `/constituents/sample/{slug}` when constituent has a sample doc (bidirectional nav per CW-47) | same |
| `Nationality` + `DisplayDate` + `display_bios[0].bio` may all be the same text (TMS Default duplication) | Wireframe dedups: suppresses bio when bio === `Nationality · DisplayDate` or equals `DisplayDate` | same |

### Other tombstone fields

| Source state | Transformation | Where |
|---|---|---|
| `identifying_description`, `object_name`, `accession_iso_date` ship from pipeline but guidelines mark them internal-only | Wireframe does NOT render these on public surfaces; comment in source notes the Tier policy | same |
| Non-geography `term_*` (Period / Reign / Dynasty / Style / Movement / School / Materials / Subject / Intended Market) | Guidelines mark these "Phase 2" public. Wireframe wraps them in `ScopeMark label="Phase 2 (pending Tier policy confirm)"` so stakeholders can see what's gated | same |
| `signed`, `inscribed`, `markings` | Guidelines mark internal-only. Wireframe ships them but flags the group as "Marks (pending Tier policy confirm)" in case FAMSF intends to flip the policy for 2026 | same |
| `term_*` entries (classification, geography path, period, etc) | Each rendered as a search-filter deep link (`/search-results?facet={field}&value={term}`). Geography breadcrumb nodes individually linked | same |

---

## Constituent / artist record

### Identity

| Source state | Transformation | Where |
|---|---|---|
| Per-link `Role` rows on `object_constituents` | Pipeline aggregates distinct `Role` values per `ConstituentID` → `roles: List[String]` on `constituent_documents` | `prepare/constituent_documents.py` |
| Per-link `ConstituentType` | Pipeline takes first non-null per `ConstituentID` → `constituent_type: String` (`Individual` / `Institution`) | same |
| Bio with trailing ` Default` TMS suffix | Pipeline strips via regex `\s*Default\s*$` | `transform/object_constituents.py` `_strip_bio_suffix` |

### Display

| Source state | Transformation | Where |
|---|---|---|
| `nationality` often already embedded in `display_date` (e.g. `French, 1840–1926`) | Wireframe suppresses the standalone `nationality` row when `display_date` contains the nationality token case-insensitively | `constituents/sample/[variant]/page.tsx` |
| Multiple `display_bios[]` entries, often duplicates of `Biography` | Wireframe dedups identical entries; renders only distinct ones | same |
| `display_date` may carry pre-normaliser drift (`B.C.`, hyphen ranges) | Pipeline transform applies same era + en-dash normaliser as object-side `display_date` | `transform/object_constituents.py` `_normalise_display_date` |

---

## Cross-cutting

### HTML / rich text

- **Pipeline `strip_html`** (`utils/text_cleaning.py`):
  - Drops `<script>`, `<style>`, Word-paste `<o:p>` / `<w:*>` etc.
  - Converts `<br><br>`, `<p>...</p>`, `<div>...</div>` → `\n\n` / `\n` (paragraph breaks).
  - **Preserves**: `<em>`, `<strong>`, `<i>`, `<b>`, `<u>`, `<br>`, `<p>`, `<ul>`, `<ol>`, `<li>` (attributes dropped, only bare tag retained).
- **Wireframe `sanitiseHtml`** runs the same allow-list at render time as defence in depth. Both layers idempotent.
- TMS reality: most curator-supplied rich-text fields ship plain text; only Web Text contains `<BR>` paragraph markers. Bibliography italics added by frontend heuristic, not by curators.

### Field source debug overlay

`FieldSourceBadge` reads `lib/es-tms-field-map.ts` and renders `[ES: {field} ← {TMS source}]` annotations when the "Show source" toggle is on. Covers all 42 currently-rendered fields plus 4 nested provenance paths and 1 nested dimension-measures path. Lets cataloguers verify each visible value's TMS provenance without leaving the page.

### Tier policy

Two unresolved client questions visibly flagged on the page:

1. `signed` / `inscribed` / `markings` — guidelines say internal-only, wireframe surfaces them with "(pending Tier policy confirm)" label.
2. Non-geography `term_*` — guidelines say "Phase 2", wireframe wraps each group in a `ScopeMark` so stakeholders see what would disappear without policy flip.

Resolve both before launch; remove ScopeMarks if confirmed public.

---

## Still pending (no transformation yet)

These remain on the backlog and are flagged separately:

- **Inscription / Mark / Label / Signed transcription template** — guidelines mandate `(side, location, medium) transcription` parsing. Currently rendered as raw curator string.
- **Medium recto/verso split** — `(Recto) ... ; (Verso) ...` parsing.
- **Watermark special format** — separate render path needed.
- **Foreign-language inscription brackets** (`[in Arabic]` / `[in Hangul]`) — no language pill or RTL handling.
- **Web Text attribution tail** (`Text by X, Title, Affiliation`) — not styled separately from the body.
- **Geography TGN URI links** — schema lacks `getty_tgn_id` / `getty_aat_id`; would need pipeline extension to surface linked-data URIs.
- **Per-constituent bibliography + relationships** — `ConBibliography`, `ConRelationships` not extracted.

---

## File index

### Pipeline (`collection-flow-famsf/`)

- `src/collection_flow_famsf/utils/text_cleaning.py` — HTML allow-list normaliser
- `src/collection_flow_famsf/utils/provenance.py` — provenance line + footnote parser
- `src/collection_flow_famsf/utils/dimensions.py` — `H x W [x D]` parser (cm + inches)
- `src/collection_flow_famsf/defs/assets/transform/object_constituents.py` — bio suffix strip, display-date normalise
- `src/collection_flow_famsf/defs/assets/transform/object_titles.py` — TitleTypeDisplay map
- `src/collection_flow_famsf/defs/assets/transform/object_dimensions.py` — measures struct
- `src/collection_flow_famsf/defs/assets/prepare/collection_documents.py` — display-date normalise, provenance structured
- `src/collection_flow_famsf/defs/assets/prepare/constituent_documents.py` — roles + constituent_type aggregation
- `src/collection_flow_famsf/defs/assets/prepare/es_mapping.py` — nested mappings for new structures

### Wireframe (`famsf-collection-wireframes/`)

- `src/lib/text-format.ts` — `normaliseTitle`, `normaliseDateRange`, `formatTitle`
- `src/lib/collection-document.ts` — TS types for new pipeline fields
- `src/lib/constituent-document.ts` — TS types for `roles`, `constituent_type`
- `src/lib/es-tms-field-map.ts` — source debug overlay map
- `src/components/wireframe/ProvenanceText.tsx` — structured provenance render
- `src/components/wireframe/BibliographyText.tsx` — numbered list + CMOS italics heuristic
- `src/components/wireframe/ExhibitionRow.tsx` — guideline-format exhibition citation
- `src/components/wireframe/object-detail/ScaleDiagram.tsx` — human + banana + object
- `src/app/(wireframes)/objects/sample/[variant]/page.tsx` — primary object page
- `src/app/(wireframes)/constituents/sample/[variant]/page.tsx` — primary constituent page

### Source docs

- `famsf-object-cataloguing-guidelines.md` — TMS data dictionary + tier rules
- `famsf-2026-business-goals.md` — Open Access, donor stewardship priorities
