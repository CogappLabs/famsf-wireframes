# FAMSF Collection Wireframes

Interactive wireframes for the FAMSF 2026 Collections Project — a standalone collection website for the Fine Arts Museums of San Francisco (de Young + Legion of Honor). Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Architecture

### Adding a new wireframe page

1. Add an entry to `src/lib/data.ts` (id, title, description, status)
2. Add scope entries to `src/lib/scope.ts` (mvp flag, notes, issue URLs)
3. Add strings to `src/lib/strings/en.json` — no hardcoded display text in components
4. Create `src/app/(wireframes)/<id>/page.tsx`

The index, top bar badges, footer links, and scope overlay all derive from these files.

### Key directories

- `src/app/page.tsx` — wireframe index (auto-grouped by page `category`: browse / records / features / meta / data / reference)
- `src/app/(wireframes)/layout.tsx` — wireframe chrome: top bar, global nav, scope toggle, footer
- `src/app/(wireframes)/*/page.tsx` — individual wireframe pages (11 collection pages + sitemap)
- `src/lib/data.ts` — central data layer: page registry, nav tree, site nav, footer groups, review statuses
- `src/lib/scope.ts` — scope annotations: MVP status, notes, issue tracker URLs
- `src/lib/strings/en.json` — all copy, externalised for easy editing
- `src/lib/sample-data.ts` — sample collection objects, artists, exhibitions for inter-page navigation
- `src/components/wireframe/` — reusable wireframe primitives
- `src/components/wireframe/GlobalNav.tsx` — standalone collection site navigation
- `src/components/wireframe/CollectionAutocomplete.tsx` — suggestion-as-you-type search combobox
- `src/components/wireframe/JumpToNav.tsx` — sticky jump-to bar: pill chips with IntersectionObserver scroll-spy (active section highlighted) + horizontal overflow
- `src/components/wireframe/object-detail/` — object-page sections split out: `ImageSection`, `RightsCitationSection`, `ChildRecordsSection` (this session), plus `ScaleDiagram`, `RelatedWorksSection`, `VisuallySimilarGrid`
- `src/providers/ScopeProvider.tsx` — scope toggle state + page context
- `docs/` — stakeholder interview synthesis + content audit strategy

### Wireframe pages

| Page | Route | Key features |
|------|-------|-------------|
| Collection Landing | `/collection-landing` | **Lean MVP**: hero + autocomplete search bar with basic filter chips. Everything else (stats, dual pathways, browse-by-area, highlights, "what to see", timeline) is scope-deferred post-MVP but still on the page. |
| Explore | `/explore` | Curated themes, timeline browse, discovery prompts, most viewed (post-MVP) |
| Search Results | `/search-results` | **Primary view = grid + facet modals** (real data, omnibox + sort + pager). Other variations behind `?variation=`. |
| Object Detail | `/objects/sample/[variant]` | Image gallery, hyperlinked tombstone, jump-to nav, People, dimensions, Scale (post-MVP), provenance + bibliography (structured + raw `<details>`), exhibitions, rights & citation, child records, audio, related works, edu resources. Sections split into `object-detail/*` components. |
| Collection areas | `/collection-areas` | **Landing**: intro + grid of collection areas (== departments, CW-30); cards → detail. `/departments` redirects here. |
| Collection Area (detail) | `/collection-area` | Single-area detail: about, stats, highlights, browse, provenance statement, de Young vs Legion |
| Artist Page | `/artist-page?name=X` | Bio, works grid, exhibitions, related artists |
| Collector Page | `/collector-page` | Biography, associated objects, SF civic history |
| Portfolio Detail | `/portfolio-detail` | Parent-child records, sequential browser |
| My Finds | `/my-finds` | Saved objects, shareable URL, PDF export, notes |
| Visit Planner | `/visit-planner` | Concierge input, curated paths, on-view objects |
| Educational Resources | `/educational-resources` | Lesson plans, gallery filter, reading level adaptation |

### Navigation flow

Pages are wired together with real links and shared sample data:
- **Search results** → click artwork card → **Object detail** (`?id=100167`)
- **Object detail** → click artist name → **Artist page** (`?name=Camille+Pissarro`)
- **Object detail** → click related work → **Object detail** (different object)
- **Object detail** → click department → **Collection area**
- **Object detail** → click medium/classification/culture → **Search results** (simulated filtered search)
- **Artist page** → click work → **Object detail**
- **Artist page** → click related artist → **Artist page** (different artist)
- **Collection landing** → "What to see" → **Visit planner**
- **Object detail** → "View all educational resources" → **Educational resources**
- **Autocomplete** on collection landing and search results → facet + object suggestions

### Wireframe components

All components are exported from `@/components/wireframe`:

- `<Container size="xl">` — width-constrained wrapper (xs/sm/md/lg/xl/full)
- `<WireframeSection label="...">` — wraps full sections, shows scope overlay
- `<ScopeMark label="...">` — wraps sub-components within a section
- `<ImagePlaceholder aspect="16/9" label="...">` — grey box with label text
- `<SectionLabel>` — uppercase mono kicker label
- `<LinkCard href="..." title="..." description="...">` — clickable navigation card
- `<StatCard value="24" label="Pages">` — big number + label
- `<CategoryBadge>Tag</CategoryBadge>` — inline category/tag pill
- `<Breadcrumb items={[{label, href?}]}>` — slash-separated breadcrumb trail
- `<IssueIcon>` — issue tracker logomark (Jira; the FAMSF work is tracked in the Jira CW project)
- `usePageVariations(variations)` — registers variations in the top bar and returns the active key

### Variations

Pages can offer alternative layouts via URL search params (e.g. `?variation=list`). This lets stakeholders compare design options with shareable links. The toggle renders automatically in the layout top bar.

Current variations:
- **Search Results**: grid + facet modals (**primary / default**) / grid + facets / grid / list / zero-results / AI search / artworks + artists / interleaved
  - **grid + facet modals** is **first in `VIEW_VARIATIONS`**, so bare
    `/search-results` loads it — it's the Phase 1 primary search view. The
    other entries stay as design alternatives behind `?variation=`.
  - **grid + facet modals** (`?variation=grid-facets-modal`) and **grid +
    facets** (`?variation=grid-facets`) are the only variations backed by
    **real pipeline data** (a ~600-object slice in `src/data/grid-facets-docs/`,
    see below). Both render a left facet column instead of the horizontal bar,
    sharing the same `GridFacetsView` (a `layout` prop switches inline vs
    modal). Facets, top to bottom:
    - **Artist** — flat list off `primary_artist` (8-cap + search-within).
    - **Place** — expandable tree (region → country → state → notable place,
      per the REGION_REMAP workbook). The **state tier is US-only** (ADR 0002
      amend): San Francisco sits under California under United States, but
      non-US places stay 3-tier (a German city sits directly under Germany).
      Each row: ▸/▾ caret expands children in place; a checkbox filters by that
      node (any tier). "Filter place…" prunes + auto-expands matching branches
      (e.g. "paris" → Europe ▾ France ▾ Paris). Geography shows **all**
      top-level rows (no 8-cap — the one exception).
    - **Material** — same expandable tree, 2-tier (parent → specific, per the
      Material workbook FACET_DESIGN_v2; e.g. Metal → bronze). 8-cap with
      "Show N more" on the parents.
    - **Technique** — flat list (8-cap).
    - **Classification** / **Collection area** / **Gallery** — flat facets
      (8-cap + search-within) off `classification`, `department`,
      `location_building`. Added for the Phase 1 CW-41 core facet set. The
      `department` facet is labelled **"Collection area"** in the UI (the
      public-facing name per CW-30); `department` stays the code/field id.
    - **Date** — a **year histogram** (`DateHistogram`): decade bins with the
      empty decades dropped so equal-width bars track data density (sparse
      ancient tail collapses, dense modern cluster gets the width). Drag across
      the bars to pick a year range, or type into the From / To year inputs
      (the keyboard / screen-reader path); both drive the same `{min,max}`
      `YearRange` filter. Years come from `objectYear` (sort_year, neg = BCE).
    - **On view** / **Has image** / **Open access** — a segmented toggle pill
      group (`fieldset`). Open access = `isPublicDomain(doc)` (shared helper in
      `results.tsx`): matches free-text `copyright` containing "public domain"
      OR `object_rights_type == "Public Domain"`. The grid-facets slice has
      `copyright: null` and carries the rights enum, so the dual check is what
      makes the OA facet + the card badge fire on this view (214 PD docs).
      Inline layout: a full-width row under the search. Modal layout: top of
      the left column.
    The CW-41 core facet set (geo, material, classification, dept, gallery, OA,
    on-view, has-image) + date (CW-64) is complete; Artist + Technique are kept
    on top as extras. Flat facets + Material cap at 8 with "Show more"; only
    Place (geography) shows all. `grid-facets` shows every facet expanded
    inline; `grid-facets-modal` shows one button per facet (name + active-count
    badge) opening the same control in a `<dialog>`.
  - **Omnibox, sort, pagination** (grid-facets only): the search bar's `?q=`
    filters the slice (title/artist/medium/dept/classification/accession) via
    a `query` prop on `GridFacetsView`; the autocomplete suggests **only the
    on-page facets** (built from the slice in `SearchResultsClient`), and a
    facet pick routes `?facet=type:value` which `GridFacetsView` seeds via
    `seedSelectionFromFacet` (flat + tiered place/material). **Sort** (CW-39:
    relevance/title/date/artist/accession) + a real **client-side pager**
    (24/page, resets on filter/sort/query change) live in `grid-facets.tsx`.
  - Results render in a 3-col grid (`ResultsGrid columns={3}`). Each card shows
    **On view** (emerald) + **Open access** (green) badges + a `↓` download-icon
    overlay, all gated on the doc's flags / `isPublicDomain`. A count+sort
    row sits above a separate active-filter-chips row (min-height reserved so
    the grid doesn't jump); "Clear all" lives in the left column header, always
    rendered but hidden when nothing is active. Zero-results recovery splits
    did-you-mean + popular searches out as **post-MVP** (CW-44) — each wrapped
    in its own `ScopeMark`. The horizontal facet bar (and its removed
    medium/materials/style/etc facets) still serves every other variation.
  - **Card routing.** Every grid-facets result card routes to the one
    fully-built sample object (`/objects/sample/water-lilies-1973-3`), via a
    `getHref` override at the `GridFacetsView` call site in
    `SearchResultsClient`. The ~600-doc slice has no per-object sample pages,
    so this keeps the search → object-detail flow demoable. Other variations
    keep the real `objectHref` (slug-by-id).
  - **Scope overlay.** When the scope toggle is on, this view draws six
    coarse, region-level `ScopeMark`s (all MVP) with short labels: **Facets**
    (whole left column), **Count + sort** (CW-39), **Active filter chips**
    (CW-42), **Results grid** (CW-43), **Pagination** (CW-43), **Zero results**
    (CW-44). Pagination is its own mark, split out from the grid. There are
    deliberately no per-facet / per-toggle marks — they wrapped and collided in
    the narrow facet column; per-facet detail lives in the facet code, not the
    overlay. Keys live under `search-results/*` in `src/lib/scope.ts`.
- **Object Detail**: standard / two-column layout for provenance and exhibitions

### Scope system

The scope toggle (top bar) overlays MVP/post-MVP annotations on sections:
- Green border + badge = MVP
- Grey overlay + badge = post-MVP
- Notes and issue tracker links shown inline
- ScopeMark uses a left-edge colour bar for sub-component annotations

### Sample data

`src/lib/sample-data.ts` contains 12 objects, 7 artists, and exhibition history drawn from the real FAMSF collection (144,511 objects total). The autocomplete component imports from this file. All inter-page navigation uses query params (`?id=`, `?name=`) to load the correct sample record.

### Data layer

`src/lib/data.ts` is the single source of truth for:
- `pages` — the page registry (id, title, description, review status)
- `navigation` — nav tree with `NavNode` type for sitemap
- `siteNavigation` — standalone collection site nav. `mvpSiteNavigation` / `mvpFooterGroups` are the **MVP-filtered** derivations the site header (`GlobalNav`) + footer actually render (post-MVP pages dropped via `isPageMvp`; the wireframe index at `/` still lists everything). "Collection areas" is a **plain link** to the `/collection-areas` landing (no dropdown).
- `footerGroups` — structured footer link groups (auto-derived from pages, grouped into Browse/Records/Features)
- `ReviewStatus` type and display constants

### Strings

All display copy lives in `src/lib/strings/en.json`. Use `t("key")` to reference strings. No hardcoded display text in components — data arrays for wireframe sample content (themes, lesson plans, etc.) are the only exception.

### Auth

Password protection with IP bypass, configured via environment variables:

- `WIREFRAME_PASSWORD` — shared preview password
- `WIREFRAME_SECRET` — signs the session cookie (generate with `openssl rand -base64 32`)
- `WIREFRAME_ALLOWED_IPS` — comma-separated IPs that bypass auth entirely

When no env vars are set (local dev), auth is disabled entirely. On Vercel, set all three in the project's environment variables.

The login page is at `/login`. Authenticated sessions last 30 days via an HMAC-signed cookie.

## Discovery documents

All Discovery-phase outputs from FAMSF, kept under `docs/`. They drive the wireframe scope (`src/lib/scope.ts`) and feature priorities.

### Project framing
- `famsf-discovery-summary-master.md` — **canonical Discovery synthesis** (FAMSF, May '26). Consolidates all six discovery activities: 6 audiences (visit-planners ~67%, art-curious ~37%, researchers ~30%, educators, curatorial, donors), 9 strategic learnings, 9 opportunities, Phase 1 MVP feature list (CW- tickets), Phase 2 North Star four pillars. Supersedes the individual synthesis docs for top-level framing.
- `phase-2-blue-sky-roadmap.md` — internal working doc for the Phase 2 / blue-sky fundraising deliverable. Features A–K + workshops A–H, all laddered to the master doc's pillars/audiences/opportunities. Fills the master doc's empty Phase 2 feature-list stub. Honours master-doc AI guardrails (front-facing AI = verified+labelled+opt-out only). Includes a **Funder fit** section mapping features to funder archetypes (Anthropic = guarded AI, AWS = IIIF/open infra, foundations = scholarship/access, Bay Area/civic = donor + regional anchor-institution, major donors = named gifts) with a funder-fit matrix.
- `famsf-collections-2026-project-brief.md` — original FAMSF brief to Cogapp. Budget ($350k Discovery + Phase 1), timeline, audiences (researcher > educator > general), business goals (drop eMuseum = $8k/yr saving, public API, decouple from monolith)
- `cogapp-proposal-2026.md` — Cogapp's proposal response
- `work-statement-2026.md` — signed SOW
- `exec-doc-collection-2026.md` — technical overview + context (current TMS / Prism / eMuseum stack, pain points)
- `collection-project-2026-discovery-preparation.md` — map of all Discovery activities, owners, dates, links

### User research
- `collection-project-2026-stakeholder-interview-synthesis.md` — 10 group interviews Mar-Apr '26, 8 themes, Must Have / Should Have feature lists. **Primary input for `src/lib/scope.ts` MVP flags.**
- `collection-project-2026-stakeholder-interview-script.md` — interview method + participant roster
- `collection-project-2026-hotjar-survey-synthesis.md` — N=16 live visitor survey (Apr-May '26). Top features: enhanced images 75%, deep content 56%, advanced search 50%. Validates MVP image-first focus.
- `collection-project-2026-hotjar-survey-questions.md` — questionnaire form
- `collection-project-2026-gap-analysis.md` — consolidates Frankly Green + Webb (2024) audience research + Web2.0 Discovery (2025) curatorial survey. Shows pain points persisting 2024→2026. Surfaces gaps not in stakeholder synthesis: retail / Art-on-Demand link from object pages (15% of shop visitors), de Young vs Legion museum-location clarity, image-access pathway gap (old download removed, no replacement)
- `collection-project-2026-analytics-review.md` — GA / Looker traffic patterns

### UX + content
- `collection-project-2026-ux-audit-synthesis.md` — peer-comparison audit. 5 themes (collection buried, friction, dead-end object page, content disconnected, no audience focus). Maps cleanly to MVP — no new gaps beyond stakeholder synthesis.
- `collection-project-2026-content-audit-strategy.md` — content audit plan (due May 2026)
- `famsf-content-audit-recommendations.md` — **completed content audit** (FAMSF, May '26). 5 areas (landing/dept, object detail, search/filters, editorial cross-linking, content debt) + per-page recommendations. Source of the hook/swim/dive content model, theme-by-tagging proposal, label-copy-as-default standardisation, and the explicit "Blue sky" archival-exhibition-images note. Feeds `phase-2-blue-sky-roadmap.md` feature K + G.
- `landscape-research-2026.md` — peer institution benchmarking (~8 institutions)
- `collection-project-2026-landscape-research-synthesis.md` — full landscape synthesis (10 museums + 5 cross-industry, May '26). Five themes: collection as primary digital product; underselling breadth/character; object page as node not endpoint; results/filters serve researchers inconsistently (zero-results = universal failure); interactive tools. Drives several open scope items below.

### Cross-doc themes (consensus across all 3 user-research streams)
1. **Images** — high-res, deep zoom, multi-view, downloadable. Universal #1 ask
2. **Search** — advanced filters (geography, culture, materials, donor, accession, attribution qualifiers), dynamic filtering, no full-page reload, useful zero-results
3. **Object detail = discovery hub** — clickable metadata tags, bidirectional editorial links, related works, content-source labels, paragraph break formatting from TMS
4. **Parent/child** — portfolios, books, ensembles (Achenbach-critical)
5. **Drop eMuseum** dependency — but only after public site replicates its search + browse + image-download capability

### Open scope decisions surfaced from gap analysis (not yet in `scope.ts`)
- Retail link to Art-on-Demand from object-detail (Gap Analysis, 15% shop visitor signal)
- de Young vs Legion museum-location clarity on object + collection-area pages (Gap Analysis recurring theme)

### Open scope decisions surfaced from FAMSF feedback on `/collection-landing` (May 2026)
- "Topic" entry currently only Environment + Making and non-editable — needs curator-editable list
- Exhibition history timeline with archival images (blue-sky; possibly outside `/collection-landing` scope)
- Intro copy reviewed + replaced ("Ancient Greek sculptures, French Impressionist paintings…") in `en.json`
- Card aspect ratios normalised: collection-area cards → 1/1, highlights → 4/5
- Basic-filter chip row + "More ways in" entry-point grid landed; scope.ts entries added

### Open scope decisions surfaced from landscape synthesis (not yet in `scope.ts`)
- Zero-results recovery on `/search-results` — fallback browse pathways, suggested alternatives, query-improvement guidance (only V&A solves this across 10 audited museums)
- MIA-style inline filmstrip expansion on object detail — `+` next to metadata term expands related works in-page instead of routing away
- V&A-style persistent scrolling image module on object detail — image stays visible through full scroll. Candidate variation
- Cleveland-style dense list view on `/search-results` — accession, medium, dimensions, credit line, rights inline in one row for researchers
- MIA-style preview panel on `/search-results` — assess object without leaving results
- Attribution qualifier filters (Signed by / Attributed to / Possibly Made by) as first-class facets (Rijksmuseum)
- Open access / public domain as first-class filter and browse dimension (AIC, Unsplash) plus engagement metrics on open-access works (Unsplash analog)
- Tooltips / plain-language explanations on specialist metadata fields (Getty, DIA)
- Nordstrom-style alt-image on hover in results grid — surface multi-view in results without routing to object page
- Mood / visual / camera tools scoping line — currently silent in `scope.ts`, position vs Google A&C / NGA Artle / Cleveland AI tools

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — Biome check
- `npm run lint:fix` — Biome auto-fix
- `npm run typecheck` — TypeScript type check
- `npm run sync:samples` — pull fresh sample JSONs from the sibling `collection-flow-famsf-spike/output/sample_docs/` dir

## Sample objects (real ETL data)

Sample collection-document JSONs live at `src/data/sample-docs/`. Pages
in `/objects/sample/` render them as wireframe object pages backed by
real pipeline output.

**Auto-discovery registry** — `src/lib/sample-docs-registry.ts`. The
index page (`/objects/sample/`) and the dynamic `[variant]` route both
read this registry. Filename conventions:

- `minimal_{id}.json` / `median_{id}.json` / `maximal_{id}.json` — auto-pick
  spread set
- `named_{slug}_{id}.json` — pinned by ObjectID for stable demos

When multiple files share a slug (older spread picks left on disk
across pipeline runs), the registry picks the newest by mtime. Stale
dupes are silently hidden from the UI but should still be cleaned
manually post-extract.

**Sample meta** — each JSON has an `_sample_meta` block:

```json
"_sample_meta": {
  "reason": "Diebenkorn 41 Etchings Drypoints (1991.28.332.1-9) — IsVirtual=true, 41 children",
  "picked_at": "2026-05-18T09:30:45+00:00",
  "populated_fields": 47
}
```

The reason is rendered on each sample-index card. Underscore prefix
keeps it out of ES (the pipeline writes it on the wireframe-export
path only).

**Auto-sync from pipeline** — when the FAMSF pipeline materialises
`sample_docs`, it dual-writes to this repo's `src/data/sample-docs/`
directory if `COLFLOW_WIREFRAMES_SAMPLE_DIR` env var is set in the
pipeline's `.env`. No `npm run sync:samples` needed for content
refreshes. Only run sync after schema changes (TypeScript type
updates).

## Grid + facets variation data (real-data slice)

The `/search-results?variation=grid-facets` variation is backed by a
separate bulk export, NOT the curated sample-docs set above:

- `src/data/grid-facets-docs/` — ~600 `{ObjectID}.json` docs, a balanced
  slice (per-region cap) of the `-real` pipeline's
  `collection_documents.parquet`, restricted to objects with geography +
  a mapped material/technique. Loaded by `loadGridFacetsDocs()` in
  `src/lib/sample-docs-registry.ts`. These are NOT in the auto-discovery
  registry and don't appear on `/objects/sample`.
- Each doc carries three **pre-derived curator-taxonomy facet** fields
  (added by the export, not emitted by the production pipeline yet):
  `facet_place[]` (`{region, country, state, notable}`, hierarchical, from the
  REGION_REMAP workbook keyed on each place term's Getty TGN `cn`; `state` is
  US-only per ADR 0002 amend, empty elsewhere),
  `facet_material[]` (`{parent, specific}`, 2-tier, e.g. Metal → bronze)
  and `facet_technique[]` (flat string labels). Material + technique come
  from the Material workbook bridge: raw token → `master_v2.canonical_final`
  + `facet_final` → joined to `FACET_DESIGN_v2` (the parent/specific design;
  Technique rows are `level=flat`). Typed on `CollectionDocument` +
  `PlaceFacet` / `MaterialFacet` in `src/lib/collection-document.ts`.

Regenerate (one-off, not Dagster assets):

1. `uv run … python scripts/pull_taxonomy_sheets.py` — pulls the live
   curator workbooks (REGION_REMAP + Material `master_v2` /
   `FACET_DESIGN_v2` / `FACET_PUBLIC_v2`) to `src/data/taxonomy-tsv/` via
   **cogapp-sheets** (ADC-authed; run `gcloud auth application-default login`
   first). Sheet IDs are in the script; tab names confirmed at runtime.
   NB: `pull_to_tsv` caps at ~9999 rows, so the long tail of rare `master_v2`
   tokens is dropped (high-frequency tokens, sorted first, are kept).
2. `uv run --no-project python scripts/export_grid_facets_docs.py` —
   reads the parquet + the TSV crosswalks, derives the three facets, and
   writes the balanced slice. `TARGET` / `PER_REGION_CAP` cap the output.

Taxonomy design lives in `docs/place-geography-taxonomy.md` (Place) and
the Material sibling workbook. The pipeline does NOT yet emit these facet
fields (see that doc's "Not yet built"); the export is the wireframe-only
stand-in until it does.

## Schema reference page

`/schema-reference` renders `src/data/schema.json`, generated by the
pipeline's `schema_doc` Dagster asset. Each ES field shows upstream
column lineage (from `dagster/column_lineage` metadata on
`collection_documents`) + ES type + Polars dtype + classification
(passthrough / derived / multi-source).

Schema is dual-written by the pipeline when `COLFLOW_WIREFRAMES_SCHEMA_PATH`
env var points at `src/data/schema.json`. Auto-refresh on every pipeline
run; no manual sync.

Page only re-renders on next deploy after JSON change (Next.js static
import). Re-run `npm run build` locally or push to Vercel.

## Reference pages

Cataloguing-rule context for stakeholders + cataloguers. Both pages
are short intro blurbs that link out to working Google Sheets so
curators and the ETL team can co-edit without code changes.

- `/transformations`
  (`src/app/(wireframes)/transformations/page.tsx`) — links to the
  source-to-wireframe transformations sheet. Seeded from
  `docs/source-to-wireframe-transformations.md` via
  `scripts/push_transformations_to_sheet.py` at the workspace root.
- `/curator-deviations`
  (`src/app/(wireframes)/curator-deviations/page.tsx`) — links to the
  curator-rule-deviations sheet. Seeded from
  `docs/curator-rule-deviations.md` via
  `scripts/push_curator_deviations_to_sheet.py` at the workspace root.

Re-run the push scripts to overwrite the sheets from the .md source.
Once curators start editing the sheets directly, use
`cogapp_sheets.pull_to_tsv` to round-trip back to TSV. The
`react-markdown` + `remark-gfm` deps were dropped when the pages
became linkout-only.

## Text formatting helpers

`src/lib/text-format.ts`:
- `normaliseTitle(raw)` — strip leading `<` + optional trailing `>`
  from descriptive titles (per §Titles); capitalise "Untitled"
  consistently; flag `isDescriptive` for italic styling.
- `normaliseDateRange(value)` — defensive en-dash replacement on
  display dates (idempotent with pipeline normaliser).
- `formatTitle(raw)` — convenience plain-string version.

## Curator-data heuristic components

- `BibliographyText` — splits on blank lines into numbered list with
  hanging indent; applies CMOS italics heuristic anchored on
  structural markers (Title-followed-by-City:Publisher,Year; exh.
  cat.; journal-after-quoted-article).
- `ProvenanceText` — renders structured provenance from
  `provenance_structured` (lines + footnotes). Inline `[N]` → blue
  superscript anchors → `#prov-footnote-N`. Italic + grey when
  `lines[].is_uncertain` (square-bracketed entries).
- `ExhibitionRow` — formats per §Exhibition History:
  `City, Venue, Date – Date. "Title," no. X`.
- `ScaleDiagram` — primary dimension picked from
  `dimensions_structured[].measures.height_cm`. Human 170 cm +
  banana 18 cm + object box on shared baseline. NOTE: the production
  `collection-flow-famsf-real` pipeline does **not** yet emit a
  `measures` struct (parsed cm/in) — only the spike does. Against
  real `-real` output, parse the dimension from
  `dimensions_structured[].display_dimensions` until `measures` is
  ported. `dimensions_structured[].element_name` ("Overall" / "Sheet"
  / etc.) ships from `-real` but is raw — ~70% are retired
  `x_Do not use_*` TMS labels (see the pipeline's curator-deviations
  doc); don't render it as a clean facet without normalising.
- `TranscriptionList` — renders parsed Marks / Inscriptions / Signed /
  Labels per `(side, location, medium) transcription` template. Falls
  back to raw string when no segments parse. Watermark badge per
  §Mark(s) L1287.

## Shared wireframe components

`src/components/wireframe/`:

- `SectionLabel` + `SectionLabelInline` — uppercase mono kicker label,
  `text-gray-500` colour, `tracking-[0.08em]`. Inline variant renders
  `<span>` for inlining into prose; block variant renders `<p>`.
- `TombstoneLabel` — field-level kicker for tombstone rows
  (`text-gray-400`, mono uppercase). Use this whenever a tombstone row
  needs a label, not the inline `font-mono text-label uppercase`
  pattern.
- `ExhibitionRow` — `{ title, date, venue, href }` props. Renders
  `border-l-2 border-gray-200 pl-3` exhibition card. Wraps in `<Link>`
  when `href` provided.
- `FieldSourceBadge` — when the "Show source" debug toggle is on,
  renders a small mono label showing `[ES: {field} ← {TMS source}]`.
  Reads toggle state from variation context. Source mappings live in
  `src/lib/es-tms-field-map.ts`.

## CollectionDocument TypeScript type

`src/lib/collection-document.ts` mirrors the pipeline's
`prepare/schemas.py` CollectionSchema. After any pipeline schema
change, refresh the type to match the new JSON shape. Helper
functions:

- `primaryMedia(doc)` — pick the primary image (first
  `is_primary: true` or `media[0]`)
- `allMedia(doc)` — sorted list of all image media items. NOTE:
  intentionally ignores `approved_for_web` flag (unreliable on current
  sample exports). Production surfaces should reapply that filter.
- `iiifImageUrl(media_master_id, size)` — derive IIIF image URL
- `populatedFieldCount(doc)` — count of non-null / non-empty fields

## Long-text rendering rules

Curator-authored long text fields (`provenance`, `bibliography_text`,
`exhibition_history_text`, `web_text`, `didactic_label`) ship from the
pipeline as plain text with `\n` line breaks preserved. Render with
Tailwind `whitespace-pre-line` on the container — each line is a
separate provenance / citation / exhibition entry. Do NOT split on
`\n` and render as a list; the line-break model is curator-controlled.
HTML-bearing fields (`web_text`, `didactic_label`) should also be
HTML-sanitised before render in production.

## Tools

- **Linter/formatter:** Biome v2 (not ESLint)
- **Pre-commit:** Lefthook
- **Deployment:** Vercel (zero config)

## Skills

The `wireframe-designer` skill from `cogapp-plugins` is pre-approved. Use `/wireframe-designer` to get guidance on creating new wireframe pages.
