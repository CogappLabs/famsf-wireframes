# Curator rule deviations

Where the FAMSF Object Cataloguing Guidelines mandate one thing and the TMS data shows another. Findings from sampling the live `vCI_PrismObjectsFilter_Cogapp`-filtered extract (~150K objects, May 2026).

Each row: what the guideline says, what curators actually ship, scale of the gap, and what we did with it. Use this to (a) prioritise curator-side cleanup with FAMSF, and (b) understand where pipeline / wireframe heuristics are compensating.

---

## Bibliography italics (CMOS NOTES)

- **Guideline (§Bibliography L381)**: "Format citations based on Chicago Manual of Style 17th edition guidelines for NOTES" — implies italics on book titles, journal names, exhibition catalogue titles, auction catalogues.
- **TMS reality**: 0 of ~552 Bibliography rows ship with `<em>` / `<i>` markup. Curators type plain text into the rich-text widget without applying formatting.
- **Wireframe response**: CMOS-style italics heuristic at render time (`BibliographyText.italiciseBibliographyEntry`). Anchors on structural markers (`, Title, (City: Publisher, Year)`; `exh. cat.`; `"Article," Journal,` + vol/no/year). Authors protected (sit before the first comma).
- **Risk**: false positives on unusual citation shapes. Mitigated by `applyOnce` — first matching pattern wins, no double-italicising.

## Web Text attribution tail

- **Guideline (§Web Text L1983-1994)**: trailing lines `Text by [First Name] [Last Name], [Title], [Affiliation]` or `Adapted from [Title of Book] [City: Publisher, Year], [page]`.
- **TMS reality**: 0 of ~3,786 Web Text rows match either pattern at any position in the text.
- **Pipeline / wireframe response**: skipped. Nothing to parse.
- **Action**: flag to FAMSF CIDA. If attribution matters, curators need to start adding it; if they don't, drop the guideline section.

## Rich-text in long-text fields

- **Guideline (§Bibliography / §Provenance / §Exhibition History / §Web Text)**: rich-text allowed — bold, italic, underline, bullets, numbered lists, indents.
- **TMS reality** (per-row tag counts on extracted long-text columns):
  - WebText: 1,041 rows contain HTML, but every tag is `<BR>` (paragraph break). No italics, no bold, no lists.
  - Provenance, Bibliography, Exhibitions, DisplayBio: **zero** rows contain any HTML tag.
- **Pipeline response**: `strip_html` allow-list keeps `<em>/<strong>/<i>/<b>/<u>/<br>/<p>/<ul>/<ol>/<li>` (attributes dropped). Future-proof for when curators do use the widget; harmless on today's data.
- **Wireframe response**: matches allow-list on render.

## Foreign-language inscription brackets

- **Guideline (§Inscriptions L1060-1066)**: non-English transcriptions tagged with `[in {Language}]` after the body; translations attributed with `[translated by {Person}]`.
- **TMS reality**: 3 of ~3,860 transcription rows (`Signed` + `Inscribed` + `Markings`) carry an `[in {Language}]` tag.
- **Pipeline / wireframe response**: skipped. Three rows isn't worth a render path.
- **Action**: low priority; not blocking.

## Medium recto/verso parenthesised prefix

- **Guideline (§Medium L1453)**: two-sided works render `(Recto) ...medium...; (Verso) ...medium...`. Capitalise `Recto` / `Verso`. Separate with `;`.
- **TMS reality**: 15 of ~5,240 multi-segment Medium rows carry literal `(Recto)` / `(Verso)`. Curators mostly drop the side marker entirely.
- **Pipeline / wireframe response**: skipped.

## Date range dashes

- **Guideline (§Date L483, revision 8/22/2025)**: en dash between years, not hyphen.
- **TMS reality**: mixed. Some rows ship `1840-1926`, some `1840–1926`.
- **Pipeline response**: `_add_display_date_normalised` regex replaces ` *-* *` between 3-4 digit numbers with ` – ` on both `display_date` (object) and `DisplayDate` (constituent).

## Era abbreviations

- **Guideline (§Date L489)**: `BC` / `AD` / `BCE` / `CE` with no periods.
- **TMS reality**: some curators type `B.C.`, `A.D.`, `B.C.E.`, etc. Periods vary.
- **Pipeline response**: same `_add_display_date_normalised` strips periods from era abbreviations on both object and constituent display-date columns.

## Title casing

- **Guideline (§Titles L1850-1865)**: Primary titles use CMOS title case. Descriptive (cataloguing-assigned) titles use sentence case (first word + proper nouns only) and are wrapped in `<...>` brackets.
- **TMS reality**: Primary titles mostly conform. Descriptive titles consistently use the `<...>` bracket convention (sample observed: ObjectID 52010 ships starting `<` but truncated past the closing `>` due to varchar cap).
- **Wireframe response**: `normaliseTitle` strips leading `<` + optional trailing `>` and flags `isDescriptive = true` so the title can be italicised (descriptive titles render in italic to distinguish from formal titles).

## Object descriptive title truncation

- **Guideline**: descriptive titles should fit in the field.
- **TMS reality**: at least ObjectID 52010 has a long descriptive title that runs past the TMS varchar cap, leaving an unclosed `<...` bracket. Curator-side data-entry issue.
- **Wireframe response**: bracket stripping handles missing close gracefully.

## Provenance footnote refs

- **Guideline (§Provenance/Collection History)**: no specific format mandate; FAMSF external Google Doc (access pending) presumably has the canonical convention.
- **TMS reality**: curators use `[1]`, `[2]` markers inline + `[N] ...` footnote blocks at the end of the field. Plus square-bracket-wrapped speculative entries (`[Sold to ...]`).
- **Pipeline response**: `parse_provenance` extracts both into `provenance_structured.lines[]` + `provenance_structured.footnotes[]`. Flags `is_uncertain = true` on square-bracket-wrapped body lines.
- **Risk**: malformed orphan refs (line references `[3]` but no `[3] ...` footnote exists). `orphan_refs()` helper available for asset-check use.

## Institutional constituent bio misuse

- **Guideline (§Object Related Constituents / Display Bio)**: `Display Bio` is for biographical prose about the person or institution.
- **TMS reality**: for Cartier (ConstituentID 21282 — institution), `display_bios` carries SIX entries that are just city names — `Paris`, `London`, `New York`, `Paris for New York`, `Paris for London`, `Paris and New York`. Cataloguer used the bio table as a branch-of-origin lookup (which workshop made which piece). Likely repeated for other multi-branch luxury houses.
- **Wireframe response**: renders these verbatim under "Bio entry 2" / "Bio entry 3" / etc. Looks weird.
- **Better fix candidates**: (a) suppress bios that are short (<25 chars) and contain no verb; (b) repurpose as a `Branches` / `Workshops` chip list when `constituent_type` is Entity/Institution; (c) push FAMSF to migrate this data to `ConGeography` (currently empty — see below) or a UF_Branch field.

## Constituent bio duplication

- **Guideline (§Object Related Constituents)**: `Display Bio` is a distinct field, expected to be substantive biographical text.
- **TMS reality**: many constituent records have `Biography == DisplayDate == display_bios[0].bio == display_bios[1].bio` — all the same nationality+date string (e.g. Monet: all four = `French, 1840–1926`).
- **Pipeline response**: trailing ` Default` TMS suffix stripped from `Biography` and `display_bios[].bio`.
- **Wireframe response**: dedup at render — suppress display_bio when it equals `Nationality · DisplayDate` or `DisplayDate` alone.

## Exhibition history structured vs free-text drift

- **Guideline (§Exhibition History L780-797)**: `City, Venue, Month Day, Year – Month Day, Year. "Exhibition Title," no. X`.
- **TMS reality**: structured `Exhibitions` array carries title + date + venue per row, but no City and no Checklist Number columns. Free-text `Objects.Exhibitions` mirror often DOES carry the city + checklist data but in inconsistent comma/semicolon shapes.
- **Pipeline response**: ships both structured array and free-text fallback.
- **Wireframe response**: structured rendered with quoted title per guideline; free-text rendered with `whitespace-pre-line`.
- **Gap**: City + Checklist Number not pulled into structured array. Likely needs FAMSF schema confirmation that those columns exist.

## Geography hierarchy IDs

- **Guideline (§Place of Creation et al)**: implicit Getty TGN / AAT integration via Cogapp Object Record taxonomies.
- **TMS reality**: FAMSF `Terms.CN` is an internal hierarchical code (e.g. `AUZ.AAAAB.AAAAJ.AAACQ` for "Japan"). Looks Getty-derived but is NOT the Getty TGN ID. No `Terms.TGNID` / `Terms.AATID` column surfaced in extract SQL.
- **Pipeline / wireframe response**: blocked. We can't construct `https://vocab.getty.edu/page/tgn/{id}` URLs without the real Getty IDs.
- **Action**: ask FAMSF whether `Terms` (or a join table) carries Getty IDs. If yes, surface them in `term_path_lookup` extract. If no, raise with cataloguing team — Getty IDs are valuable for linked-data interop.

## "Identifying Description" public-access creep

- **Guideline (§Identifying Description L948)**: "This field is for internal use only, and is not visible on the website."
- **TMS reality**: pipeline ships it on every object. ~67% fill, much of it useful Web Text-style prose.
- **Wireframe response**: hidden from public render. Comment in source notes the Tier policy.
- **Action**: confirm with FAMSF whether the guideline is current. If they want it surfaced, flip the wireframe rule + remove the comment.

## "Object Name" public-access creep

- **Guideline (§Object Name L1502)**: "not visible on the website, used by CMS for Art Finder."
- **TMS reality**: pipeline ships it. Wireframe hides.
- **Action**: same as above.

## "Accession Date" public-access creep

- **Guideline (§Accession Date L2060)**: internal-only.
- **TMS reality**: pipeline ships `accession_iso_date` for ~80% of records.
- **Wireframe response**: hidden.
- **Action**: same as above.

## Marks fields public-access (Signed / Inscribed / Markings)

- **Guideline (§Signed L1709 / §Inscriptions L964 / §Mark(s) L1220)**: all three marked "not currently visible on the website."
- **TMS reality**: pipeline ships all three. Sample data shows meaningful, well-typed transcriptions across thousands of records.
- **Wireframe response**: shows them, but wraps the group with `(pending Tier policy confirm)` label. Strongly suspect FAMSF intends these to ship publicly in 2026 — guidelines may be aspirational.
- **Action**: explicit FAMSF confirmation needed.

## Non-geography Attribute fields public-access

- **Guideline (§Attributes L325)**: only geography Attributes are currently web-visible. Period / Reign / Dynasty / Style / Movement / School / Materials / Subject / Intended Market are "Phase 2."
- **TMS reality**: pipeline ships all 15 `term_*` groups.
- **Wireframe response**: each non-geography term group wrapped in `ScopeMark label="Phase 2 (pending Tier policy confirm)"`.
- **Action**: same — likely they want these in 2026 site.

---

## Medium: ampersand instead of "and"

- **Guideline (§Medium L1425)**: "Include 'and' before the final element; do *not* use an ampersand (&)."
- **TMS reality**: 65 Medium rows contain `&`. Samples: `Etching & engraving` (2), `cashmere & wool` (1), `silver & gilt` (1), `black and white & color woodcuts` (4).
- **Wireframe/pipeline response**: nothing yet. Mechanical rule — `& → and` substitution is safe.

## Medium: mid-string word capitalisation

- **Guideline (§Medium L1423)**: "Capitalize the first word only, all other words lowercase."
- **TMS reality**: 164 distinct Medium values (801 objects) have a second word starting uppercase where the first word is not a qualifier like `(Recto)`. Top examples: `Wood Engraving` (396 objects), `Wood Engraving.` (42), `Color Lithograph` (59), `Color Woodcut` (23), `Color Screenprint` (21). These are not brand names.
- **Wireframe/pipeline response**: nothing yet. Lower-casing all non-first words risks clobbering brand names (Plexiglas, Favrile) and proper nouns — needs a safelist.

## Medium: "gouache" instead of "opaque watercolor"

- **Guideline (§Medium, Term-Specific Standards L1435)**: "Use 'opaque watercolor' instead of 'gouache'."
- **TMS reality**: 189 Medium rows contain `gouache`. Samples: `Gouache on paper` (5), `gouache on paper` (4), `Watercolor and gouache` (2), `graphite heightened with white chalk, on cream laid paper prepared with gray gouache ground` (11).
- **Wireframe/pipeline response**: nothing yet. Not a display fix — this needs curator-side cleanup since it may require re-checking the medium description. Flag to FAMSF CIDA.

## Edition field contains "Edition" word or "Ed." abbreviation

- **Guideline (§Edition L728)**: "Do not include the word 'Edition' in the field, just the number of the printing."
- **TMS reality**: 215 of ~1,390 Edition rows include prohibited text. Top forms: `Edition 1905, Strölin, state 2/2`, `Edition 85, AP 6/10`, `Ed. 10/100` (repeated), `Edition: 22/35`. Some are just `(regular edition, 1-200)`.
- **Wireframe/pipeline response**: nothing yet. Pattern is regular enough to strip at pipeline time (`Edition\s*:?\s*`, `Ed\.\s`), but "state" and "AP" annotations are non-standard too — safe to flag, risky to auto-strip.

## Inscriptions wrapped in quotation marks

- **Guideline (§Inscriptions L1024)**: "Do not contain the transcription in quotation marks."
- **TMS reality**: 211 of ~3,860 Signed/Inscribed/Markings rows wrap the transcription (or part of it) in `"..."`. Sample: `inscribed "QUESTO ELINFERNO DEL CAMPOSAN / TO DI PASA' and at center 'SIMON / MAGVS"`, `Inscribed on verso top center: E.B./W.L.A/July–August 1949/"The Living and the Dead—The Pyramid."`.
- **Wireframe/pipeline response**: nothing yet. Some quotes are legitimately around a title-within-inscription (allowed by L1855). Auto-stripping would destroy those. Flag the pattern, leave for curators.

## Date: "circa" spelled out

- **Guideline (§Date L486)**: "Use 'ca.' (with the period) and not 'circa'."
- **TMS reality**: 10 Dated rows spell out `circa` (e.g. `circa 1350–1360`, `circa 1915`, `circa 1800–1810`). Additionally, 27 rows use `c.` (e.g. `c. 1650`, `c.1845`, `early 20th c.`, `19th c.`) instead of the mandated `ca.`.
- **Pipeline response**: nothing yet. Both are mechanical: `circa ` → `ca. ` and `\bc\.` → `ca.` — safe to normalise in `_add_display_date_normalised`.

## Date: century in numerals not ordinal-number form

- **Guideline (§Date L488)**: "Use numbers with contractions to denote centuries, do not spell out the number: i.e. 4th century BC."
- **TMS reality**: 31 Dated rows spell out the century correctly as a numeral, but no violations of *spelled-out words* were found (`fourth century` etc. absent). However, all 31 are of the form `17th century`, `19th–20th century` etc. — these are already compliant. The actual question is whether curators write "seventeenth century" — sampling finds none. Low risk; skipping.

## Dimensions: decimal inches instead of 1/16-inch fractions

- **Guideline (§Dimensions L643)**: "Minimum units of measurement are 1/16 of an inch (in fractions)."
- **TMS reality**: 269 Dimensions rows carry a decimal inch value without a fractional equivalent in the same record (e.g. `5.1 x 35.6 cm (2.75 x 14.25 in.)`, `8 x 2.5 in.`, `10.5 x 6.5 x 8.25 in.`). A further 21,647 have decimal inches alongside fractions in the same string — those are borderline but technically still violate the "fractions" rule.
- **Wireframe/pipeline response**: nothing yet. Decimal-to-fraction conversion is well-defined for common halves/quarters/eighths/sixteenths but lossy for arbitrary decimals. Pipeline could flag; wireframe could convert on display for common cases.

## "Untitled" all-caps in objects denormalised Title field

- **Guideline (§Titles L1860)**: "Use 'Untitled', capitalized" — i.e. title-case, not all-caps.
- **TMS reality**: `objects_raw.Title` stores `UNTITLED` (all-caps) for 10,669 records. The canonical `object_titles_raw` table correctly holds `Untitled` (proper case) for the same objects. This is a TMS display quirk: the `ObjTitles` denorm column uppercases the stored value for some record types.
- **Pipeline response**: `objects_raw.Title` is already superseded by the `object_titles_raw` join in the pipeline. As long as consumers use the joined `title` field and not the raw `Title` column, this is invisible. Add a comment to that effect in the asset.

## Constituent role fragmentation ("Artist" vs craft-specific maker roles)

- **Guideline (§Object Related Constituents, Feb 2024 revision)**: roles are authority-controlled. The guidelines merged "Artist/Maker" into a single category after the Feb 2024 update.
- **TMS reality**: `Artist` (107,802), `Maker` (2,695), `Printmaker` (617), `Sculptor` (35), `Artist/Maker` (30), `Painter` (6), `Calligrapher` (14), `Weaver` (13), `Goldsmith` (7), `Silversmith` (22), `Enamelist` (4) all describe the primary creative role but remain separate. The 2,695 `Maker` and 30 `Artist/Maker` rows in particular are semantic duplicates of `Artist` under the current guideline. Craft-specific sub-roles (Weaver, Goldsmith, Silversmith) are likely correct but not consistently applied — a weaver with role `Artist` receives no craft attribution.
- **Wireframe/pipeline response**: nothing yet. Role-to-display-label mapping table could collapse `Maker` and `Artist/Maker` → `Artist` at render time while preserving the raw value for search facets. The craft-specific roles should be treated as-is.

## Provenance entries not starting with a year or owner name

- **Guideline**: FAMSF Provenance/Collection History Guidelines (external Google Doc, L1613) mandates structured citation form starting with year or owner. The in-doc standard implies each entry begins with a date or named owner.
- **TMS reality**: 809 Provenance rows begin with none of `YYYY`, uppercase letter, or `[`. Representative examples: `ex coll: E. Sagot & M. Le Barrec`, `collected by Wilfrid Hubert Hemingway…` (68 rows), `purchased from the Patrons of Art and Music Bookstore` (35), `ex Collection Jack Lenor Larsen` (11). These typically use `ex coll.`, `collected by`, `purchased…`, and `the artist's sister` as openers.
- **Wireframe/pipeline response**: `parse_provenance` structured extraction may silently mis-classify these as narrative notes rather than ownership lines. Flag rows that don't match the expected opener pattern for curator review.

---

## Object Name and Alternate Object Names lowercase

- **Guideline (§Object Name L1508 / §Alternate Object Names L253)**: all terms lowercase; do not capitalize the first word.
- **TMS reality**: not yet sampled. Mechanical to scan: regex for any leading uppercase letter in these fields.
- **Pipeline / wireframe response**: nothing yet. Field is internal-only per current Tier policy so display impact is zero; would matter once `object_name` flips public.

## Approved location-term whitelist on transcriptions

- **Guideline (§Inscriptions L988-1000 / §Mark(s) L1242-1254 / §Label(s) L1124-1136)**: location term must come from an approved list (`center`, `left`, `proper left`, `right`, `proper right`, `top`, `bottom`, `base`, `underside`, `upper`, `lower`, `center back`, `side seam`, `inner`, `outer`, `inside`, `outside`, `interior`, `exterior`).
- **TMS reality**: not yet sampled. `parse_transcriptions` already pulls `location` into a struct field; building a whitelist check on top is one regex away.
- **Pipeline / wireframe response**: nothing yet. Out-of-whitelist values still render verbatim. Flag-only candidate.

## Unreadable letters not in `[?]` bracket form

- **Guideline (§Mark(s) L1276 / §Inscriptions L1022 / §Label(s) L1149 / §Signed L1771)**: unreadable characters in transcriptions written as `[?]`, not bare `(?)` or `?`.
- **TMS reality**: not yet sampled but easy to spot — bare `?` inside transcription bodies vs the canonical `[?]`.
- **Pipeline / wireframe response**: nothing yet. Mechanical normalise candidate.

## Watermark prefix

- **Guideline (§Mark(s) L1285-1287)**: watermark transcriptions begin with literal `watermark: ` (lowercase, with colon).
- **TMS reality**: `parse_transcriptions` already detects the prefix into `is_watermark` boolean, so non-conforming rows would currently fail the detection and render as plain marks. Sample count not yet pulled.
- **Pipeline / wireframe response**: detection exists; nothing flags non-conforming rows back to curators. Candidate for an asset-check on `marks_structured`.

## Artist monogram phrase

- **Guideline (§Signed L1761, L1775)**: when signature is a symbol or monogram, use the exact phrase `Artist's monogram` (not variant spellings).
- **TMS reality**: not yet sampled.
- **Pipeline / wireframe response**: nothing yet. Flag-only candidate.

## Textile medium separator

- **Guideline (§Medium L1439)**: textile medium and structure separated by `;`, not `,`.
- **TMS reality**: not yet sampled (limited to Classification = Textiles).
- **Pipeline / wireframe response**: nothing yet.

## Dimension description casing

- **Guideline (§Dimensions L670)**: Dimension Description field all lowercase; do not capitalise the first word.
- **TMS reality**: not yet sampled.
- **Pipeline / wireframe response**: nothing yet.

## Constituent nationality already embedded in DisplayDate

- **Guideline**: nationality is a separate field from `DisplayDate`.
- **TMS reality**: curator-typed `DisplayDate` strings often include nationality (`French, 1840–1926`), making the standalone `nationality` line a duplicate.
- **Wireframe response**: constituent page suppresses the standalone nationality row when `display_date` (case-insensitively) contains the nationality token.

## Orphan footnote refs in Provenance

- **Guideline (§Provenance)**: every inline `[N]` ref pairs with a `[N] …` footnote block at the end of the field.
- **TMS reality**: some Provenance rows reference a footnote `[3]` with no matching `[3] …` block.
- **Wireframe response**: `ProvenanceText.renderWithRefs` only links `[N]` markers when the footnote block exists; orphan refs render as plain text. `orphan_refs()` helper available for asset-check use.

## Rights statement en-dash / hyphen drift

- **Guideline (§Object Rights Statement L2606)**: controlled-vocab Attribute with canonical values.
- **TMS reality**: `term_rights_statement[].term` ships both `"No Copyright - United States"` (hyphen) and `"No Copyright – United States"` (en dash) variants for the same rightsstatements.org URI.
- **Wireframe response**: `rightsStatementMap` contains both string keys mapping to the same URI. Pipeline-side normalisation candidate.

## Deprecated dimension element labels ("x_Do not use_")

- **Guideline (§Dimensions)**: each dimension row carries a clean element label (`Overall`, `Framed`, `Frame`, `Image`, `Sheet`, …) from `DimensionElements`.
- **TMS reality**: ~70% of object dimension xrefs still point at retired element rows whose name is literally marked `x_Do not use_Sheet (4D)`, `x_Do not use_Overall (4D)`, `x_Do not use_Image (Filemaker)`, etc. (98K of ~140K rows are `Displayed=true`, so the `Displayed` flag does not screen them out). The measurement is valid; only the element label is the retired string. 19,580 objects carry both a clean and a deprecated row, and naive prefix-stripping would collapse them into 1,718 same-label collisions per object (two `Overall` entries with different measurements).
- **Pipeline / wireframe response**: `element_name` ships **raw** — no in-pipeline stripping (stripping would manufacture duplicate labels on the 19,580 dual-row objects, and `Frame` vs `Framed` cannot be disambiguated from the deprecated string). Flagged for FAMSF to repoint the dimension xrefs at the live `DimensionElements` rows at source. Revisit a render-time relabel once the source data is cleaned.

---

## How we compensate

We don't try to fix every cataloguer deviation. Each one gets one of five responses, picked on a sliding scale from "fix it in the data" to "leave it alone and tell the client". The choice depends on how mechanical the rule is, how regular the curator data is, and how many rows are affected.

### 1. Pipeline normalises

**Used when**: the rule is mechanical and unambiguous. We can fix it without judgement.

The Dagster pipeline rewrites the value at transform time so every downstream consumer (ES, wireframe, future API users) sees the same corrected output. The raw TMS string is replaced — there is no "original" version preserved.

Examples:
- Year-range hyphens → en dashes (`1840-1926` → `1840–1926`).
- Era abbreviations stripped of periods (`B.C.E.` → `BCE`).
- Trailing ` Default` suffix removed from `Biography` / `display_bios[].bio`.
- TMS sentinels (`(not entered)`, `(not assigned)`, `0`) nulled out.

### 2. Pipeline parses

**Used when**: curators follow a regular textual convention but the rule isn't simple find-and-replace. We need to *understand* the string to use it.

The pipeline runs a parser, emits a structured sibling field alongside the raw string. Consumers pick whichever shape suits them — the raw value for display, the parsed shape for programmatic use. Both go into ES, so nothing is lost.

Examples:
- Provenance text → `provenance_structured.lines[]` + `footnotes[]` (each line gets a `refs` array + `is_uncertain` flag).
- Dimension display strings → `dimensions_structured[].measures` (`height_cm`, `width_cm`, `depth_cm`, plus inches).
- `(side, location, medium) transcription` template → `signed_structured` / `inscribed_structured` / `markings_structured` with `is_watermark` flag.
- Descriptive title `<...>` brackets → `normaliseTitle()` strips the brackets and flags `isDescriptive` for italic styling.

### 3. Wireframe heuristics

**Used when**: data is plain text in TMS (no convention to parse) but a display convention applies at render time.

The wireframe applies regex heuristics at render. We anchor on structural markers in the text (e.g. `, Title, (City: Publisher, Year)` for CMOS book citations) and bail out when the pattern doesn't match cleanly. The false-positive rate stays low because the rules are anchored on context, not on Title Case alone.

These are display-only transformations — they never touch the underlying data. If the curator later supplies italics in the TMS rich-text widget, the heuristic skips and the curator-supplied formatting wins.

Examples:
- CMOS-style italics on bibliography entries (book titles, journal names, exhibition catalogue titles).
- Descriptive titles rendered in italic to distinguish from formal titles.
- Inline date-range en-dash defence against any drift the pipeline normaliser missed.
- Short-text bio detection (Cartier-style branch labels routed to a separate UI block).

### 4. Skip

**Used when**: fewer than ~50 rows in the live extract match the guideline pattern.

Building a render path costs UX-design time and code complexity. If only a handful of records would exercise it, the path stays unbuilt — the raw curator string is shown as-is. We re-evaluate when curator practice changes (e.g. if a new cataloguer training round bumps the row count).

Examples:
- Foreign-language inscription brackets `[in Arabic]` — 3 rows.
- Medium `(Recto)` / `(Verso)` markers — 15 rows.
- Web Text `Text by X, Title, Affiliation` attribution tail — 0 rows.

### 5. Flag for client

**Used when**: the guideline rule is a policy decision we can't make on FAMSF's behalf.

The wireframe surfaces the data behind a visible `ScopeMark` overlay (the scope toggle in the top bar). The flag stays in place until FAMSF confirms whether they want the field public or internal. The choice is theirs to make; we just make sure the question is visible on the relevant page.

Examples:
- `signed` / `inscribed` / `markings` are marked internal-only in current guidelines, but pipeline data quality suggests they may be intended for the 2026 public site.
- Non-geography `term_*` attributes (Period, Style, Movement, Subject, etc.) are listed as "Phase 2 public" — visibly gated until FAMSF flips that policy.
- Tier mismatches like `identifying_description`, `object_name`, `accession_iso_date` (guidelines say internal; pipeline ships them anyway).
