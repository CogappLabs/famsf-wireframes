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
	"collection-landing/Hero": { mvp: true, issueUrl: issue("CW-27") },
	"collection-landing/Collection stats": {
		mvp: false,
		note: "Editorial vanity metrics: not contracted, not load-bearing for search/discovery",
	},
	"collection-landing/Dual pathways": {
		mvp: true,
		note: "Explore vs Search entry points",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Search bar": {
		mvp: true,
		note: "Autocomplete search with suggestions",
		issueUrl: issue("CW-36"),
	},
	"collection-landing/Basic filters": {
		mvp: true,
		note: "Inline filter chips (Highlights / Open access / On view / Has image / Popular) per FAMSF feedback May 2026; promote selected facets from Advanced",
		issueUrl: issue("CW-36"),
	},
	"collection-landing/More ways in": {
		mvp: true,
		note: "Additional entry points (recently added, open access, by medium, by place, by era) beyond highlights / area / topic per FAMSF feedback May 2026",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Browse by area": {
		mvp: true,
		issueUrl: issue("CW-27"),
	},
	"collection-landing/Highlights": {
		mvp: true,
		note: "Curated selection, needs editorial ownership",
		issueUrl: issue("CW-27"),
	},
	"collection-landing/What to see": {
		mvp: false,
		note: "Curated visit path: links to Visit Planner",
		issueUrl: issue("CW-61"),
	},
	"collection-landing/Timeline": {
		mvp: false,
		note: "Chronological browse: requires date data cleanup",
		issueUrl: issue("CW-27"),
	},

	// ── Search results ─────────────────────────────────────────────────
	"search-results/Search bar": { mvp: true, issueUrl: issue("CW-37") },
	"search-results/Zero results": {
		mvp: true,
		note: "Did-you-mean prompt + tips + popular searches + featured fallback. Avoid dead-end. Landscape synthesis: universal failure across 10 audited museums; only V&A solves it.",
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
	"search-results/Gallery location filter": {
		mvp: true,
		note: "Filter by which physical gallery objects are currently on view in. #1 visitor motivator per Hotjar (44%: 'check what is on view'). Education interview high-priority ask.",
		issueUrl: issue("CW-41"),
	},
	"search-results/Results grid": { mvp: true, issueUrl: issue("CW-43") },
	"search-results/Dynamic filtering": {
		mvp: true,
		note: "Only show filter values with matching results",
		issueUrl: issue("CW-42"),
	},
	"search-results/Date range filter": {
		mvp: false,
		note: "User-entered year span",
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

	// ── Collection area ────────────────────────────────────────────────
	"collection-area/Hero": { mvp: true, issueUrl: issue("CW-30") },
	"collection-area/About": {
		mvp: true,
		note: "Restore rich about text: currently stripped back",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Stats": {
		mvp: false,
		note: "Editorial vanity metrics: not contracted",
	},
	"collection-area/Highlights": {
		mvp: true,
		note: "Curated, on-view works prioritised",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Browse options": {
		mvp: true,
		issueUrl: issue("CW-30"),
	},
	"collection-area/Provenance statement": {
		mvp: true,
		note: "Industry standard per Curatorial Liaison",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Articles & essays": {
		mvp: false,
		note: "Requires content audit of existing publications",
		issueUrl: issue("CW-30"),
	},
	"collection-area/Related programs": {
		mvp: false,
		note: "Dynamic programme feed: integration TBD",
		issueUrl: issue("CW-30"),
	},

	// ── Artist search / index ──────────────────────────────────────────
	"artist-search/Search bar": {
		mvp: true,
		note: "Name search across artists (no images: most constituents lack portraits).",
		issueUrl: issue("CW-31"),
	},
	"artist-search/Letter filter": {
		mvp: true,
		note: "A–Z jump filter for browse by surname.",
		issueUrl: issue("CW-31"),
	},
	"artist-search/Artist list": { mvp: true, issueUrl: issue("CW-31") },
	"artist-search/Facets": {
		mvp: true,
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
	"portfolio-detail/Parent record": {
		mvp: true,
		note: "Critical for Achenbach: portfolios, books, multi-part works",
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Child records": {
		mvp: true,
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Sequential browser": {
		mvp: true,
		note: "Page-by-page browsing within a portfolio",
		issueUrl: issue("CW-32"),
	},
	"portfolio-detail/Related works": {
		mvp: false,
		issueUrl: issue("CW-32"),
	},

	// ── Parent Record (Ensemble / Series) ───────────────────────────────
	"parent-record/Header": {
		mvp: true,
		note: "Ensemble + Series parents: Rodin Gates of Hell, Goya Caprichos, photographic series",
		issueUrl: issue("CW-32"),
	},
	"parent-record/Components": {
		mvp: true,
		note: "Child records: link to individual object detail pages",
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
		note: "Licensing / high-res request workflow for in-copyright works",
		issueUrl: issue("CW-54"),
	},
	"image-orders/Cart": {
		mvp: false,
		note: "Works added from the object page's Request Image button accumulate here",
	},
	"image-orders/Request form": { mvp: false },

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
	"collection-landing/Gallery browse": {
		mvp: false,
		note: "Browse by physical gallery: visit-planning entry point",
		issueUrl: issue("CW-27"),
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
	"objects/sample/Image": { mvp: true },
	"objects/sample/Tombstone": { mvp: true },
	"objects/sample/Description": { mvp: true },
	"objects/sample/Constituents": { mvp: true },
	"objects/sample/Dimensions": { mvp: true },
	"objects/sample/Exhibitions": { mvp: true },
	"objects/sample/Provenance": { mvp: true },
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
