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

- `src/app/page.tsx` — wireframe index (auto-generated from page registry)
- `src/app/(wireframes)/layout.tsx` — wireframe chrome: top bar, global nav, scope toggle, footer
- `src/app/(wireframes)/*/page.tsx` — individual wireframe pages (11 collection pages + sitemap)
- `src/lib/data.ts` — central data layer: page registry, nav tree, site nav, footer groups, review statuses
- `src/lib/scope.ts` — scope annotations: MVP status, notes, issue tracker URLs
- `src/lib/strings/en.json` — all copy, externalised for easy editing
- `src/lib/sample-data.ts` — sample collection objects, artists, exhibitions for inter-page navigation
- `src/components/wireframe/` — reusable wireframe primitives
- `src/components/wireframe/GlobalNav.tsx` — standalone collection site navigation
- `src/components/wireframe/CollectionAutocomplete.tsx` — suggestion-as-you-type search combobox
- `src/components/wireframe/JumpToNav.tsx` — horizontal jump-to anchor navigation
- `src/providers/ScopeProvider.tsx` — scope toggle state + page context
- `docs/` — stakeholder interview synthesis + content audit strategy

### Wireframe pages

| Page | Route | Key features |
|------|-------|-------------|
| Collection Landing | `/collection-landing` | Stats, dual explore/search pathways, browse by area, highlights, "what to see", timeline |
| Explore | `/explore` | Curated themes, timeline browse, discovery prompts, most viewed |
| Search Results | `/search-results` | Autocomplete, horizontal facets with dialog, grid/list toggle |
| Object Detail | `/object-detail?id=X` | Image gallery, hyperlinked tombstone, jump-to nav, provenance, exhibitions, related works, scale diagram, scholarly essay, 3D/video, edu resources |
| Collection Area | `/collection-area` | Department landing with about, stats, highlights, browse, articles, programmes |
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
- `<IssueIcon>` — issue tracker logomark (default: Linear)
- `usePageVariations(variations)` — registers variations in the top bar and returns the active key

### Variations

Pages can offer alternative layouts via URL search params (e.g. `?variation=list`). This lets stakeholders compare design options with shareable links. The toggle renders automatically in the layout top bar.

Current variations:
- **Search Results**: grid / list view
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
- `siteNavigation` — standalone collection site nav (Explore, Search, My Finds, Collection Areas)
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
- `npm run sync:samples` — pull fresh sample JSONs from the sibling `collection-flow-famsf/output/sample_docs/` dir

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

## Markdown reference pages

Two markdown-driven pages render the cataloguing-rule context for
stakeholders + cataloguers:

- `/transformations` (`src/app/(wireframes)/transformations/page.tsx`)
  — reads `docs/source-to-wireframe-transformations.md`. Documents
  what's transformed at each layer (TMS → pipeline → ES → wireframe).
- `/curator-deviations`
  (`src/app/(wireframes)/curator-deviations/page.tsx`) — reads
  `docs/curator-rule-deviations.md`. Where TMS data doesn't follow
  guidelines.

Both pages use `react-markdown` + `remark-gfm`. Edit the .md file in
the workspace root; hot-reload picks up the change.

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
  banana 18 cm + object box on shared baseline.

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
