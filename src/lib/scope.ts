/**
 * Centralised scope annotations for wireframe sections and components.
 *
 * Each entry maps a "pageId/label" key to its MVP status, optional notes,
 * and an optional issue tracker URL. WireframeSection and ScopeMark look
 * up their annotations automatically via the ScopePage context.
 */

export interface ScopeEntry {
	mvp: boolean;
	note?: string;
	issueUrl?: string;
}

/**
 * Helper to build issue tracker URLs.
 * FAMSF tracks Collection 2026 work on the Jira CW project:
 * https://famsfweb.atlassian.net/jira/software/projects/CW/boards/357
 */
const issue = (id: string) => `https://famsfweb.atlassian.net/browse/${id}`;

/**
 * Keys use the format "pageId/label" where:
 * - pageId matches the ScopePage id prop (usually the route segment)
 * - label matches the WireframeSection or ScopeMark label prop
 */
export const scope: Record<string, ScopeEntry> = {
	// ── Collection landing ─────────────────────────────────────────────
	// Page order + section set follow the June 18 2026 page-layouts spec
	// ("New organization"). Off-spec sections (stats, dual pathways,
	// more-ways-in, browse-by-type, gallery browse, what-to-see, timeline)
	// were removed from the page on 2026-06-19, so their scope rows are gone.
	"collection-landing/Hero": { mvp: true, issueUrl: issue("CW-27") },
	"collection-landing/Search bar": {
		mvp: true,
		note: "Autocomplete search with suggestions",
		issueUrl: issue("CW-36"),
	},
	"collection-landing/Basic filters": {
		mvp: true,
		note: "Inline filter chips promoting selected facets from Advanced. Lean-MVP homepage pass (2026-06-09) trimmed to Open access + On view; dropped Highlights (no editorial owner), Has image (not a useful entry filter), Popular (needs analytics).",
		issueUrl: issue("CW-36"),
	},
	"collection-landing/Promo mosaic": {
		mvp: true,
		note: "Flexible editorial promo grid from the Figma homepage comp (node 174:1464). Cells are typed (stat / link / image) so curators can surface a headline number, point at any existing page, or run an image. Phase 1 (needs an editorial owner and a curator-editable cell list).",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Highlights": {
		mvp: true,
		note: "Curated selection. Per the June 18 2026 page-layouts spec it is a retained landing module. Phase 1 (needs editorial ownership for the curated set).",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Browse by area": {
		mvp: true,
		note: "Collection-areas grid. Per the June 18 2026 page-layouts spec it is a retained landing module; the same browse path also lives in search facets (Department).",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Thematic exploration": {
		mvp: true,
		note: "Curator-led thematic-discovery tiles cutting across collection areas. Per the June 18 2026 page-layouts spec (new landing organization). Phase 1 (needs curator-editable theme list).",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Read watch listen": {
		mvp: true,
		note: "Article / video / audio editorial module. Per the June 18 2026 page-layouts spec. Phase 1 (needs content audit + editorial owner).",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/New to the collections": {
		mvp: true,
		note: "Recent-acquisitions strip. Per the June 18 2026 page-layouts spec. accession_date is indexed so the feed is trivial. Phase 1.",
		issueUrl: issue("CW-27"),
	},

	// ── Search results ─────────────────────────────────────────────────
	"search-results/Search bar": { mvp: true, issueUrl: issue("CW-37") },
	"search-results/Zero results": {
		mvp: true,
		note: "Phase 1 (CW-44, reduced complexity): empty state with clear-filters prompt + search tips + curated featured fallback. Avoid dead-end. Landscape synthesis: universal failure across 10 audited museums; only V&A solves it.",
		issueUrl: issue("CW-44"),
	},
	"search-results/Did you mean": {
		mvp: false,
		note: "Deferred from Phase 1 per CW-44: spell-suggestion / did-you-mean needs ES suggester tuning. Phase 1 ships tips + clear-filters + curated fallback instead.",
		issueUrl: issue("CW-44"),
	},
	"search-results/Popular searches": {
		mvp: false,
		note: "Deferred from Phase 1 per CW-44: a popular-searches list needs analytics data not available at launch. Curated featured fallback covers the recovery path in Phase 1.",
		issueUrl: issue("CW-44"),
	},
	"search-results/Open access download icon": {
		mvp: true,
		note: "copyright field is indexed. Mapping to PD/in-copyright/unknown enum is one transform. Rights icon trivial to surface.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Search modes": {
		mvp: false,
		note: "Keyword vs natural-language vs visual/image: AI/CV search beyond MVP",
		issueUrl: issue("CW-96"),
	},
	"search-results/Visual search affordances": {
		mvp: false,
		note: "Upload an image or take a photo to find similar works (computer vision)",
		issueUrl: issue("CW-96"),
	},
	"search-results/Advanced filters": {
		mvp: true,
		note: "Geography, culture, material/technique filters are high priority",
		issueUrl: issue("CW-41"),
	},
	"search-results/Attribution qualifiers": {
		mvp: true,
		note: "'possibly by', 'after', 'circle of' shown in result thumbnails: not just object page. Stakeholder Must Have (European Paintings + American Art). Data exists in TMS; display task only.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Dynamic filtering": {
		mvp: true,
		note: "Only show filter values with matching results",
		issueUrl: issue("CW-42"),
	},
	"search-results/Date range filter": {
		mvp: true,
		note: "User-entered year span. Phase 1 per FAMSF Discovery Summary (2026-06-08, Search + Filters).",
		issueUrl: issue("CW-64"),
	},
	"search-results/Downloadable results": {
		mvp: false,
		note: "Export/share search results",
		issueUrl: issue("CW-58"),
	},
	"search-results/Dense list view": {
		mvp: true,
		note: "Cleveland pattern: accession, medium, dimensions, credit line, rights status inline in one scannable row. Strongest researcher-oriented results view in landscape audit. Grid/list toggle already in CW-43 scope.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Preview panel": {
		mvp: false,
		note: "MIA pattern: quick-view side/over panel surfacing object details without leaving results.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Open access first-class filter": {
		mvp: true,
		note: "AIC + Unsplash pattern: public domain / OA as primary browse dimension, not just badge. copyright field indexed; trivial. Existing 'Open access download icon' covers display; this adds it as facet/landing-page entry.",
		issueUrl: issue("CW-41"),
	},
	"search-results/Hover alt-image": {
		mvp: false,
		note: "Nordstrom pattern: second image on hover in results grid; surfaces multi-view in results without routing to object page. Useful where additional_images count > 1.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Mixed entity results": {
		mvp: false,
		note: 'Surface matching artists alongside artworks on a single results page. Reduces friction when user query matches a person rather than an object (e.g. "Pissarro"). Artists row shown above artworks; each routes to /constituents/sample/{slug}.',
		issueUrl: issue("CW-43"),
	},
	"search-results/Interleaved entity results": {
		mvp: false,
		note: "Single ranked stream mixing artist + artwork tiles. Entity type indicated by badge + border treatment. Ranking blends artist match score with artwork match score; useful when query relevance crosses entity types.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Featured artist hero": {
		mvp: false,
		note: "When an autocomplete artist suggestion is clicked, that artist surfaces as a wide horizontal hero card above the result grid (mixed/interleaved variations). Removes the artist from the small artist tile row to avoid duplication. Mirrors the pattern used on Google A&C / Europeana when a query maps strongly to a single entity.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Entity-type scope": {
		mvp: false,
		note: "Pill row above results scopes mixed/interleaved variations to All / Artworks / Artists. All + Artworks share artwork facet set (interleaved still surfaces matching artist tiles inline). Artists scope swaps facet bar to Nationality, Dates active (century buckets, matching /artist-search), Role (sourced from constituent fields Nationality/Role/BeginDate/EndDate) plus Identity (post-MVP). Geography, Culture, Department are artwork-level (term_place_of_creation etc.) and excluded from artist scope. Avoids ambiguous cross-entity facet counts.",
		issueUrl: issue("CW-43"),
	},

	// ── Search results: grid + facets view (real-data slice) ─────────────
	// One scope entry per ScopeMark label used in grid-facets.tsx so the
	// scope toggle draws an MVP / post-MVP boundary on every part of the
	// primary search view. Labels here must match the ScopeMark `label`
	// strings exactly (key = `search-results/<label>`).
	// Coarse, region-level marks only — one per major area of the view, with
	// short labels so the overlay doesn't wrap / collide. Per-facet detail
	// (artist, place, material, …) lives in the facet code, not the overlay.
	"search-results/Facets": {
		mvp: true,
		note: "Left facet column: artist, date, place, culture group, medium, object type, department, collection + on-view/has-image/open-access toggles.",
		issueUrl: issue("CW-41"),
	},
	"search-results/Count + sort": {
		mvp: true,
		note: "Result count + sort (relevance / title / date / artist / accession).",
		issueUrl: issue("CW-39"),
	},
	"search-results/Active filter chips": {
		mvp: true,
		note: "Removable chip per active facet + Clear all.",
		issueUrl: issue("CW-42"),
	},
	"search-results/Results grid": {
		mvp: true,
		note: "3-column results grid.",
		issueUrl: issue("CW-43"),
	},
	"search-results/Pagination": {
		mvp: true,
		note: "24/page, resets to page 1 on filter / sort / query change. Load-more / infinite scroll is post-MVP.",
		issueUrl: issue("CW-43"),
	},

	// ── Collection area ────────────────────────────────────────────────
	// Section set + order follow the June 18 2026 page-layouts spec ("New
	// organization"): header → intro → deep dive → highlights → featured
	// collections → read/watch/listen → other resources. Off-spec sections
	// (stats, browse options, provenance statement, related programs) were
	// removed from the page on 2026-06-19, so their scope rows are gone.
	"collection-area/Hero": { mvp: true, issueUrl: issue("CW-30") },
	"collection-area/About": {
		mvp: true,
		note: "Intro text (150-200 words, general audience). The Collection 'About' page is folded into this intro per the June 18 2026 page-layouts spec.",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Highlights": {
		mvp: true,
		note: "Curated, on-view works prioritised (25-40 in production)",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Articles and essays": {
		mvp: true,
		note: "Read, watch, listen (article / video / audio). Phase 1 (needs content audit of existing publications).",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Deep dive": {
		mvp: true,
		note: "Expandable collection-history narrative. Per the June 18 2026 page-layouts spec (Cleveland Museum of Art collection-area ref). Phase 1 (needs editorial copy).",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Featured collections": {
		mvp: true,
		note: "Named / sub-collection grid surfacing existing collection links. Per the June 18 2026 page-layouts spec. Phase 1 (needs a curated sub-collection list per area).",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Other resources": {
		mvp: true,
		note: "Study centers, research contacts, department-specific resources. Per the June 18 2026 page-layouts spec. Phase 1 (editorial / per-department content).",
		issueUrl: issue("CW-30"),
	},

	// ── Artist search / index ──────────────────────────────────────────
	// Not MVP. The Master Discovery Summary listed Artist pages (CW-31) under
	// Phase 1 with an explicit "potential to downlevel to Phase 2 if needed"
	// escape hatch; that downlevel is now confirmed taken (2026-06-09). They
	// depend on the constituents index (CW-124) + constituents pipeline
	// (CW-105), both unfinished. Hyperlinked artist names (CW-47) link to a
	// filtered search in Phase 1 instead.
	"artist-search/Search bar": {
		mvp: false,
		note: "Name search across artists (no images: most constituents lack portraits). Deferred: depends on unfinished constituents index (CW-124) + pipeline (CW-105).",
		issueUrl: issue("CW-31"),
	},
	"artist-search/Letter filter": {
		mvp: false,
		note: "A–Z jump filter for browse by surname.",
		issueUrl: issue("CW-31"),
	},
	"artist-search/Artist list": { mvp: false, issueUrl: issue("CW-31") },
	"artist-search/Facets": {
		mvp: false,
		note: "Nationality, dates active, role. Re-uses search-results facet pattern (horizontal pill bar + dialog). Production facet list to be confirmed with curators.",
		issueUrl: issue("CW-31"),
	},

	// ── Explore ────────────────────────────────────────────────────────
	// Explore page itself is not contracted (Work Statement §5 names search +
	// object detail; "search, browse, and explore" in exec summary is
	// aspirational language, not a discrete deliverable). Sections kept as
	// post-MVP exploratory ground for Phase 2.
	"explore/Hero": { mvp: false, issueUrl: issue("CW-33") },
	"explore/Curated themes": {
		mvp: false,
		note: "Editorially maintained theme collections: page not contracted",
		issueUrl: issue("CW-33"),
	},
	"explore/Timeline browse": { mvp: false, issueUrl: issue("CW-33") },
	"explore/Highlights": { mvp: false, issueUrl: issue("CW-33") },
	"explore/Playful discovery": {
		mvp: false,
		note: "Random trait shuffle, visual prompt search",
		issueUrl: issue("CW-33"),
	},
	"explore/Most viewed": {
		mvp: false,
		note: "Requires analytics integration",
		issueUrl: issue("CW-72"),
	},

	// ── Collector / Donor page ─────────────────────────────────────────
	"collector-page/Collector header": {
		mvp: false,
		note: "Requires editorial content: founder stories tied to SF history",
		issueUrl: issue("CW-59"),
	},
	"collector-page/Biography": {
		mvp: false,
		issueUrl: issue("CW-59"),
	},
	"collector-page/Associated objects": {
		mvp: false,
		note: "Filtered by credit line",
		issueUrl: issue("CW-59"),
	},
	"collector-page/Civic history": {
		mvp: false,
		note: "San Francisco history connection: e.g. Alma Spreckels, MH de Young",
		issueUrl: issue("CW-59"),
	},
	"collector-page/Related collectors": {
		mvp: false,
		issueUrl: issue("CW-59"),
	},

	// ── Portfolio / Parent-Child ────────────────────────────────────────
	// Not MVP (2026-06-09). The Phase 1 parent-child requirement (CW-32:
	// parent metadata + flat child list) is carried by the `parent-record`
	// page below. This richer portfolio page (sequential browser, related
	// works) is the post-MVP version of the same surface.
	"portfolio-detail/Parent record": {
		mvp: false,
		note: "Portfolio parent view. Post-MVP: the Phase 1 parent-child display (CW-32, parent + flat child list) is covered by the parent-record page. Achenbach-critical but this elaborated version is deferred.",
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Child records": {
		mvp: false,
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Sequential browser": {
		mvp: false,
		note: "Page-by-page browsing within a portfolio. Deferred per Cogapp deferral candidates (2026-06-09): interaction-heavy (state, keyboard, deep-zoom per page) for only ~43 of 140,888 docs with children. Simple parent + flat child list covers the launch discovery need.",
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Related works": {
		mvp: false,
		note: "Algorithmically/curated related works. Deferred per Cogapp deferral candidates (2026-06-09): curated associations on <1% of docs (CW-65). Hyperlinked metadata (CW-47) gives the 'more like this' path in Phase 1.",
		issueUrl: issue("CW-65"),
	},

	// ── Parent Record (Ensemble / Series) ───────────────────────────────
	// Not MVP as a standalone page (2026-06-09). Phase 1 parent-child display
	// (CW-32) happens ON the artwork page (objects/sample: Parent record +
	// Child records sections), not a dedicated parent-record route. These
	// entries describe the post-MVP standalone-page treatment.
	"parent-record/Header": {
		mvp: false,
		note: "Standalone ensemble/series parent page (Rodin Gates of Hell, Goya Caprichos). Post-MVP: Phase 1 shows parent-child inline on the artwork page (CW-32), not a special page.",
		issueUrl: issue("CW-32"),
	},
	"parent-record/Components": {
		mvp: false,
		note: "Child-record list on the standalone parent page. Post-MVP: the Phase 1 flat child list lives on the artwork page itself.",
		issueUrl: issue("CW-32"),
	},
	"parent-record/Essay": { mvp: false, issueUrl: issue("CW-32") },
	"parent-record/Related parent records": {
		mvp: false,
		issueUrl: issue("CW-32"),
	},

	// ── Image orders ────────────────────────────────────────────────────
	// CW-54 (image download / request flows) is the closest backlog item –
	// it's about the on-object trigger; this standalone cart page extends it.
	"image-orders/Header": {
		mvp: false,
		note: "Licensing / high-res request signpost for in-copyright works",
		issueUrl: issue("CW-54"),
	},
	"image-orders/Linkout": {
		mvp: false,
		note: "Licensing + reproduction requests are handled on famsf.org, not in the collection site. This page is a thin signpost (intro + outbound link), not an in-site request form / cart.",
		issueUrl: issue("CW-54"),
	},

	// (The collection-areas index page was removed 2026-06-19: collection-area
	// detail pages are reached only from the homepage Browse-by-area grid.)

	// ── Exhibitions index ───────────────────────────────────────────────
	"exhibitions/Header": {
		mvp: false,
		note: "Browse-by-exhibition entry point per FAMSF feedback May 2026; needs dedicated exhibition_documents ES index in production",
	},
	"exhibitions/Filters": {
		mvp: false,
		note: "Status (current / upcoming / past) + venue chips. Dates are free-text in TMS so status derivation is heuristic; production needs ISO start/end + parsed venue",
	},
	"exhibitions/Results": { mvp: false },
	"exhibitions/Pipeline gap": {
		mvp: false,
		note: "Surfaces the production data-shape gaps inline (ObjExhibitions missing City + ChecklistNo, no curatorial copy column, free-text dates)",
	},

	// ── Exhibition detail ───────────────────────────────────────────────
	// No matching CW ticket: exhibition history is on-object (CW-51) but
	// a standalone exhibition record page is not in the current backlog.
	"exhibition-detail/Header": {
		mvp: false,
		note: "Cross-link target from the object page's exhibition history list",
	},
	"exhibition-detail/Works in exhibition": { mvp: false },
	"exhibition-detail/Curatorial essay": { mvp: false },
	"exhibition-detail/Installation views": { mvp: false },

	// ── Accessibility statement ─────────────────────────────────────────
	// CW-99 is the umbrella story for the whole accessibility statement page;
	// all sections share it. CW-24 is the broader project-level a11y decision.
	"accessibility-statement/Statement": {
		mvp: true,
		note: "Required by law; minimal content always live",
		issueUrl: issue("CW-99"),
	},
	"accessibility-statement/Known gaps": { mvp: true, issueUrl: issue("CW-99") },
	"accessibility-statement/Feedback": { mvp: true, issueUrl: issue("CW-99") },

	// ── Cross-page non-MVP additions ────────────────────────────────────
	"explore/Shuffle (active)": {
		mvp: false,
		note: "Random trait shuffle: period × medium × theme. Städel-museum pattern",
		issueUrl: issue("CW-33"),
	},
	"explore/Movement axis": {
		mvp: false,
		note: "Art-historical movements as primary browse axis (alternative to departments)",
		issueUrl: issue("CW-33"),
	},
	"search-results/Accession-number tip": {
		mvp: true,
		note: "accession_number is the primary identifier in the index. Search-by-accession works automatically. Tip text is copy only.",
		issueUrl: issue("CW-37"),
	},
	"visit-planner/Gallery filter callout": {
		mvp: false,
		note: "Surface gallery-location filter as primary entry on visit planner",
		issueUrl: issue("CW-61"),
	},

	"collection-area/Museum location": {
		mvp: true,
		note: "Clarify which museum (de Young / Legion) houses each collection area. Gap-analysis recurring theme: visitors confused about institution-collection mapping.",
		issueUrl: issue("CW-30"),
	},

	// ── My Finds ───────────────────────────────────────────────────────
	"my-finds/Header": {
		mvp: false,
		note: "No-login personal research package with shareable URL",
		issueUrl: issue("CW-60"),
	},
	"my-finds/Shareable URL": { mvp: false, issueUrl: issue("CW-60") },
	"my-finds/Saved objects": { mvp: false, issueUrl: issue("CW-60") },
	"my-finds/More like your finds": {
		mvp: false,
		note: "Recommendations derived from saved objects (shared traits: artist, period, medium)",
		issueUrl: issue("CW-60"),
	},
	"my-finds/Start a journey CTA": {
		mvp: false,
		note: "Entry point into Seed Journey: separate page",
		issueUrl: issue("CW-60"),
	},

	// ── Seed Journey ───────────────────────────────────────────────────
	"seed-journey/Header": {
		mvp: false,
		note: "Standalone discovery flow rooted in My Finds saved set",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Pick from your finds": {
		mvp: false,
		note: "Seed picker: choose one saved object as starting point",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Journey": {
		mvp: false,
		note: "Breadcrumb of every step in current journey, click to rewind",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Current object + direction": {
		mvp: false,
		note: "Two-column layout: object on left, direction picker on right",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Current object": {
		mvp: false,
		note: "Object you are currently exploring from",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Pick direction": {
		mvp: false,
		note: "Direction chips: artist, period, medium, culture, department, classification",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Where next": {
		mvp: false,
		note: "Suggested next-step objects matching chosen direction",
		issueUrl: issue("CW-60"),
	},
	"seed-journey/Share journey": {
		mvp: false,
		note: "Shareable URL plus save-to-finds and PDF export",
		issueUrl: issue("CW-60"),
	},
	"my-finds/Notes": {
		mvp: false,
		note: "Optional research notes: URL or local storage",
		issueUrl: issue("CW-60"),
	},

	// ── Visit Planner ──────────────────────────────────────────────────
	"visit-planner/Hero": {
		mvp: false,
		note: "Concierge-style visit planning",
		issueUrl: issue("CW-61"),
	},
	"visit-planner/Concierge input": {
		mvp: false,
		note: "AI-assisted: visitor type + interests + time → curated path",
		issueUrl: issue("CW-61"),
	},
	"visit-planner/Concierge": {
		mvp: false,
		note: "AI-assisted: visitor type + interests + time → curated path",
		issueUrl: issue("CW-61"),
	},
	"visit-planner/Generated plan": {
		mvp: false,
		note: "AI-generated gallery route with timing",
		issueUrl: issue("CW-61"),
	},
	"visit-planner/Curated paths": {
		mvp: false,
		note: "Pre-made visit plans: editorially maintained",
		issueUrl: issue("CW-61"),
	},
	"visit-planner/On view": { mvp: false, issueUrl: issue("CW-61") },

	// ── Educational Resources ──────────────────────────────────────────
	"educational-resources/Hero": {
		mvp: false,
		note: "Educator-focused landing page",
		issueUrl: issue("CW-62"),
	},
	"educational-resources/Lesson plans": {
		mvp: false,
		note: "Linked to objects, tagged by grade and subject",
		issueUrl: issue("CW-62"),
	},
	"educational-resources/Gallery location filter": {
		mvp: false,
		note: "High priority for educators planning school visits",
		issueUrl: issue("CW-62"),
	},
	"educational-resources/Content labelling": {
		mvp: false,
		note: "Educator-trust feature, not contracted: defer to Discovery",
		issueUrl: issue("CW-57"),
	},
	"educational-resources/AI reading level": {
		mvp: false,
		note: "Age-level content scaling: opt-in/opt-out for educators",
		issueUrl: issue("CW-73"),
	},
	"educational-resources/Featured objects": {
		mvp: false,
		issueUrl: issue("CW-62"),
	},

	// ── Sample objects (real ETL data) ─────────────────────────────────
	// Object-detail tickets per the Master Discovery Summary: tombstone fields
	// CW-49, multi-view gallery CW-46 + IIIF zoom CW-45, web/label text CW-49,
	// provenance CW-50, exhibitions CW-51, bibliography CW-68.
	"objects/sample/Jump-to navigation": {
		mvp: true,
		note: "In-page anchor navigation across the object record's sections.",
		issueUrl: issue("CW-48"),
	},
	"objects/sample/Image": {
		mvp: true,
		note: "Multi-view image gallery + IIIF deep-zoom viewer.",
		issueUrl: issue("CW-46"),
	},
	"objects/sample/Tombstone": {
		mvp: true,
		note: "Level-1 tombstone fields (title, medium, maker, date, dimensions, geography, credit, accession, etc.).",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Description": {
		mvp: true,
		note: "Web text / intro description (label copy as default).",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/People": {
		mvp: true,
		note: "People + organisations (makers, cultures): name + role + uncertainty qualifier, display bio.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Dimensions": {
		mvp: true,
		note: "Dimensions (Level-1 tombstone field).",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Exhibitions": {
		mvp: true,
		note: "Exhibition history display (raw text block in Phase 1; structured array deferred CW-139).",
		issueUrl: issue("CW-51"),
	},
	"objects/sample/Provenance": {
		mvp: true,
		note: "Provenance display (raw text block in Phase 1; structured parsing deferred CW-140).",
		issueUrl: issue("CW-50"),
	},
	"objects/sample/Bibliography": {
		mvp: true,
		note: "Bibliography, reformatted into a numbered list with CMOS italics.",
		issueUrl: issue("CW-68"),
	},
	// Parent-child (CW-32) is a Phase 1 requirement shown inline on the artwork
	// page: parent shows its metadata + a flat list of children (each linking
	// to its own page); a child links back to its parent. The standalone
	// portfolio-detail / parent-record pages are the post-MVP elaboration.
	"objects/sample/Parent record": {
		mvp: true,
		note: "Phase 1 parent-child (CW-32): a child object links back to its parent inline on the artwork page. Achenbach-critical.",
		issueUrl: issue("CW-32"),
	},
	"objects/sample/Child records": {
		mvp: true,
		note: "Phase 1 parent-child (CW-32): a parent object shows a flat list of its children inline, each linking to its own page. Deferred: sequential page-by-page browser, nested hierarchies.",
		issueUrl: issue("CW-32"),
	},

	// ── Constituent (artist / institution) page ─────────────────────────
	// Not MVP. Confirmed downlevel of Artist pages (CW-31) from Phase 1 to
	// Phase 2 (2026-06-09; the Master Discovery Summary allowed this). Depends
	// on constituents index (CW-124) + pipeline (CW-105), both unfinished.
	"constituents/sample/Tombstone": { mvp: false, issueUrl: issue("CW-31") },
	"constituents/sample/Biography": { mvp: false, issueUrl: issue("CW-31") },
	"constituents/sample/Roles and alternative names": {
		mvp: false,
		issueUrl: issue("CW-31"),
	},
	"constituents/sample/Sample objects": {
		mvp: false,
		issueUrl: issue("CW-31"),
	},
	"constituents/sample/Facets": { mvp: false, issueUrl: issue("CW-31") },

	"objects/sample/Audio guide": {
		mvp: true,
		note: "Phase 1 (CW-66, lighter-lift player). Audio + transcripts not in TMS yet; data source TBD.",
		issueUrl: issue("CW-66"),
	},
	"objects/sample/Scale": {
		mvp: false,
		note: "Scale diagram (human + banana + object on a shared baseline). Post-MVP: nice-to-have visualisation, not a Phase 1 tombstone field. Dimensions themselves are MVP.",
	},
	"objects/sample/Rights and citation": {
		mvp: true,
		note: "Phase 1 (CW-52): rights statement + clickable icon, copyright, credit line + citation generator with copy-to-clipboard.",
		issueUrl: issue("CW-52"),
	},
	"objects/sample/Image request": {
		mvp: true,
		note: "Request-image pathway beside the open-access download (in-copyright + high-res requests). Added per the June 18 2026 page-layouts spec. Routes to the /image-orders flow (CW-54).",
		issueUrl: issue("CW-54"),
	},
	// Additional-information expandable was folded into the Acquisition
	// tombstone group (2026-06-19); accession date + alternate accession now
	// render inline there. Its scope row is gone.
	"objects/sample/Accession date (pending Tier policy confirm)": {
		mvp: false,
		note: "Accession date. Guidelines mark it internal-only; surfaced inline in the Acquisition group pending FAMSF confirmation of the 2026 Tier-policy flip.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Museum location": {
		mvp: true,
		note: "On-view / storage location string in the Acquisition group.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Content source": {
		mvp: true,
		note: "Content-source labelling on web text (label copy as default). Helps educators trust the text origin.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Didactic label": {
		mvp: true,
		note: "Didactic / gallery label text, shown under web text when distinct.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Image actions": {
		mvp: true,
		note: "Image action row: open-access download + request-image link (zoom / cite / share dropped for now).",
		issueUrl: issue("CW-46"),
	},
	"objects/sample/Phase 2 (pending Tier policy confirm)": {
		mvp: false,
		note: "Non-geography Attributes (period, reign, dynasty, style, movement, school, materials, subject, intended market). Geography is Tier 1 public; these are Phase 2 pending FAMSF confirmation of the 2026 Tier-policy flip.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Marks (pending Tier policy confirm)": {
		mvp: false,
		note: "Marks / inscriptions / signatures. Guidelines mark these internal-only; surfaced pending FAMSF confirmation of the 2026 Tier-policy flip.",
		issueUrl: issue("CW-49"),
	},
	"objects/sample/Scholarly publications": {
		mvp: true,
		note: "Expandable long-form scholarly-publications module. Per the June 18 2026 page-layouts spec. Phase 1 (no backing field yet; data source TBD).",
		issueUrl: issue("CW-49"),
	},
};

export function getAnnotation(
	pageId: string | undefined,
	label: string,
): ScopeEntry | undefined {
	if (!pageId) return undefined;
	return scope[`${pageId}/${label}`];
}

/** A page is MVP if it has at least one section marked mvp: true. */
export function isPageMvp(pageId: string): boolean {
	const prefix = `${pageId}/`;
	return Object.entries(scope).some(
		([key, entry]) => key.startsWith(prefix) && entry.mvp,
	);
}

/** Flat scope row, derived from the keyed `scope` map. */
export interface ScopeRow extends ScopeEntry {
	pageId: string;
	label: string;
	key: string;
}

/** All scope entries as flat rows, parsing the `pageId/label` key. */
export function listScopeRows(): ScopeRow[] {
	return Object.entries(scope).map(([key, entry]) => {
		const slash = key.indexOf("/");
		return {
			pageId: slash >= 0 ? key.slice(0, slash) : key,
			label: slash >= 0 ? key.slice(slash + 1) : "",
			key,
			...entry,
		};
	});
}
