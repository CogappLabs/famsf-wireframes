# FAMSF Collection Wireframes

Interactive wireframes for the FAMSF 2026 Collections Project — a standalone collection website for the Fine Arts Museums of San Francisco (de Young + Legion of Honor).

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Quick start

```bash
npm install
npm run dev
```

## Pages

11 wireframes covering the complete collection website:

**Browse & search**
- **Collection Landing** — stats, dual explore/search pathways, browse by collection area
- **Explore** — curated themes, timeline browse, discovery prompts
- **Search Results** — autocomplete suggestions, horizontal facets, grid/list toggle

**Object records**
- **Object Detail** — image gallery, hyperlinked metadata, provenance, exhibitions, related works, 3D/video, educational resources
- **Portfolio Detail** — parent-child records for portfolios, sketchbooks, and multi-part works
- **Collection Area** — department landing with about, highlights, browse, articles
- **Artist Page** — biography, works grid, exhibition history
- **Collector Page** — donor biography, associated objects, San Francisco civic history

**Features**
- **My Finds** — personal research package with shareable URL, no login required
- **Visit Planner** — concierge experience with curated gallery paths
- **Educational Resources** — lesson plans, gallery-location filter, age-appropriate content

**Sample data**
- **Sample Objects** (`/objects/sample/`) — wireframe object pages backed by real ETL output. 22 sample JSONs at `src/data/sample-docs/` cover sparse-to-rich field population plus 19 pinned edge cases (compound parent, virtual portfolio, multi-script titles, term-rich antiquity, multi-image gallery, etc.). Drop new JSONs into the dir and they appear on next build (auto-discovery). Refresh from sibling pipeline repo via `npm run sync:samples`.

## Stakeholder coverage

Wireframes address all 8 themes from the stakeholder interview synthesis:

1. Search is broken → autocomplete, horizontal facets, advanced filters
2. Images → deep zoom, download, multi-view, request workflow
3. Object detail as one-stop shop → tombstone, provenance, exhibitions, bibliography, citation, rights
4. Departmental organisation → collection areas with distinct identities
5. eMuseum replacement → search parity with credit line, accession number, advanced filters
6. AI caution → no AI in MVP; post-MVP sections scoped for backend AI only
7. Content connectivity → hyperlinked metadata, artist pages, collector pages, related works
8. Collection undersells institution → stats, highlights, rich about text, founder pages

## Scope system

Toggle the **Scope** button in the top bar to see MVP/post-MVP annotations on every section, with notes and issue tracker links.

## Key features

- **Autocomplete search** — suggestion-as-you-type with facet matches, object matches, and "search all" fallback
- **Horizontal facets** — wyeth-style facet buttons with dialog modals for filtering
- **Inter-page navigation** — artwork cards, artist names, and metadata values are clickable links between pages
- **Grid/list toggle** — compare layout alternatives with URL-param variations
- **Sample data** — 12 real FAMSF collection objects with artist bios and exhibition history

## Auth (optional)

Set environment variables for password protection on Vercel:

| Variable | Purpose |
|---|---|
| `WIREFRAME_PASSWORD` | Shared preview password |
| `WIREFRAME_SECRET` | Signs the session cookie |
| `WIREFRAME_ALLOWED_IPS` | Comma-separated IPs that bypass auth |

No env vars = no auth (local dev).

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Biome check
npm run lint:fix   # Biome auto-fix
npm run typecheck  # TypeScript type check
```

## Tools

- **Linter:** Biome v2
- **Pre-commit:** Lefthook
- **Deployment:** Vercel
