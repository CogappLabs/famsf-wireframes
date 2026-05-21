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

	// ── Object detail ──────────────────────────────────────────────────
	"object-detail/Image gallery": {
		mvp: true,
		note: "High-res, zoomable, multi-view: top stakeholder priority",
		issueUrl: issue("CW-45"),
	},
	"object-detail/Image actions": {
		mvp: true,
		note: "Download (open access) and request (rights-managed)",
		issueUrl: issue("CW-54"),
	},
	"object-detail/Tombstone": { mvp: true, issueUrl: issue("CW-49") },
	"object-detail/Label text": {
		mvp: true,
		note: "Expanded by default, with content source label",
		issueUrl: issue("CW-49"),
	},
	"object-detail/Content source": {
		mvp: true,
		note: "Source pill on label text: 'current gallery label', 'web essay', etc. CIDA + Education flagged as Must Have for educator/researcher trust.",
		issueUrl: issue("CW-49"),
	},
	"object-detail/Provenance": { mvp: true, issueUrl: issue("CW-50") },
	"object-detail/Exhibition history": {
		mvp: true,
		issueUrl: issue("CW-51"),
	},
	"object-detail/Bibliography": {
		mvp: false,
		note: "Low data coverage currently (231 records)",
		issueUrl: issue("CW-68"),
	},
	"object-detail/Related works": {
		mvp: true,
		note: "Contracted recirc module (Proposal §UX and discovery: works by same artist, related works)",
		issueUrl: issue("CW-65"),
	},
	"object-detail/Rights & citation": {
		mvp: true,
		note: "Rights statement icons (rightstatements.org) + citation generator",
		issueUrl: issue("CW-52"),
	},
	"object-detail/Data disclaimer": { mvp: true, issueUrl: issue("CW-53") },

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

	// ── Artist page ────────────────────────────────────────────────────
	"artist-page/Artist header": { mvp: true, issueUrl: issue("CW-31") },
	"artist-page/Biography": {
		mvp: false,
		note: "Requires editorial content: not in TMS",
		issueUrl: issue("CW-31"),
	},
	"artist-page/Works grid": { mvp: true, issueUrl: issue("CW-31") },
	"artist-page/Exhibition history": {
		mvp: true,
		note: "Exhibitions list already nested per object in the index. Aggregating per artist is a simple reduce: trivial to surface.",
		issueUrl: issue("CW-31"),
	},
	"artist-page/Related artists": {
		mvp: false,
		note: "AI-assisted or metadata-driven",
		issueUrl: issue("CW-31"),
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

	// ── Object detail additions ────────────────────────────────────────
	"object-detail/Scholarly essay": {
		mvp: false,
		note: "Long-form curatorial writing for select highlights",
		issueUrl: issue("CW-67"),
	},
	"object-detail/Hyperlinked metadata": {
		mvp: true,
		note: "Click metadata values to trigger filtered searches",
		issueUrl: issue("CW-47"),
	},
	"object-detail/Jump-to navigation": {
		mvp: true,
		note: "Horizontal anchor links for long object pages",
		issueUrl: issue("CW-48"),
	},
	"object-detail/3D and video": {
		mvp: true,
		note: "Audio, video, and other media content explicitly contracted (Proposal §UX and discovery)",
		issueUrl: issue("CW-66"),
	},
	"object-detail/Educational resources": {
		mvp: false,
		note: "Linked lesson plans and edu content tags",
		issueUrl: issue("CW-69"),
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
		note: "Works added from object-detail's Request Image button accumulate here",
	},
	"image-orders/Request form": { mvp: false },

	// ── Exhibition detail ───────────────────────────────────────────────
	// No matching CW ticket: exhibition history is on-object (CW-51) but
	// a standalone exhibition record page is not in the current backlog.
	"exhibition-detail/Header": {
		mvp: false,
		note: "Cross-link target from object-detail exhibition history list",
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
	"object-detail/Scale diagram": {
		mvp: false,
		note: "Object size relative to 170cm human silhouette: high value for decorative arts and sculpture",
		issueUrl: issue("CW-29"),
	},
	"object-detail/SEO landing context": {
		mvp: false,
		note: "Direct-from-Google entry pattern (analytics-flagged); not contracted: defer to Discovery",
		issueUrl: issue("CW-22"),
	},
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

	// ── Object detail extensions ────────────────────────────────────────
	"object-detail/Parent record": {
		mvp: true,
		note: "is_compound flag already detected via accession regex (transform/objects.py). Upward link to compound parent is trivial. Ensemble/Series links require explicit TMS data (post-MVP).",
		issueUrl: issue("CW-32"),
	},
	"object-detail/Alt text": {
		mvp: true,
		note: "Required for accessibility and SEO: must be in TMS",
		issueUrl: issue("CW-24"),
	},
	"object-detail/Attributes": {
		mvp: true,
		note: "Period, Style, Movement, Dynasty, Reign all indexed (collection_documents.py). Keywords need extraction (post-MVP). Surface what we have.",
		issueUrl: issue("CW-47"),
	},
	"object-detail/Physical description": {
		mvp: true,
		note: "Marks, Inscriptions, Signed, Labels, Identifying Description: all already indexed by collection-flow (signed/inscribed/markings/description/label_text). Trivial to surface.",
		issueUrl: issue("CW-49"),
	},
	"object-detail/Museum location": {
		mvp: true,
		note: "de Young vs Legion of Honor: recurring pain point across stakeholder synthesis, gap analysis, and Hotjar. Field is indexed; display task only.",
		issueUrl: issue("CW-49"),
	},
	"collection-area/Museum location": {
		mvp: true,
		note: "Clarify which museum (de Young / Legion) houses each collection area. Gap-analysis recurring theme: visitors confused about institution-collection mapping.",
		issueUrl: issue("CW-30"),
	},
	"object-detail/Uncertainty qualifiers": {
		mvp: true,
		note: "Surface 'possibly by X' attribution prefix on object page. CIDA Must Have: field already exists in TMS attribution data. Researcher trust signal.",
		issueUrl: issue("CW-49"),
	},
	"object-detail/Constituents": {
		mvp: true,
		note: "Constituents list already indexed (collection-flow join/objects_with_relations.py: ConstituentID, Role, RoleID, Displayed nested per object). Surface as basic list. Invisible-role + Possibly attribution flags need ETL extension (post-MVP).",
		issueUrl: issue("CW-49"),
	},
	"object-detail/In-copyright modal": {
		mvp: true,
		note: "copyright field indexed. Rights workflow is a UX must for any image-rich site. CMA-pattern alternatives keep the page from being a dead-end.",
		issueUrl: issue("CW-54"),
	},
	"object-detail/Editorial column": {
		mvp: false,
		note: "AIC pattern: articles, stories, publications surfaced alongside metadata",
		issueUrl: issue("CW-29"),
	},
	"object-detail/Visually similar (AI)": {
		mvp: false,
		note: "CMA pattern: image-vector kNN recommendations on detail page",
		issueUrl: issue("CW-65"),
	},
	"object-detail/Media (3D, video, audio)": {
		mvp: true,
		note: "Audio tour stops + curator commentary alongside 3D and video",
		issueUrl: issue("CW-66"),
	},
	"object-detail/Inline filmstrip expansion": {
		mvp: false,
		note: "MIA pattern: '+' next to metadata term expands related works in-page rather than routing away. Strongest in-page discovery interaction in landscape audit. Keeps visitor anchored to current object.",
		issueUrl: issue("CW-65"),
	},
	"object-detail/Persistent scrolling image": {
		mvp: false,
		note: "V&A pattern: primary artwork stays visible through full scroll. Variation candidate on object-detail layout.",
		issueUrl: issue("CW-45"),
	},
	"object-detail/Metadata tooltips": {
		mvp: false,
		note: "Getty + DIA pattern: plain-language explanations on specialist fields (accession number, attribution qualifiers, provenance). Bridges researcher/general split.",
		issueUrl: issue("CW-49"),
	},
	"object-detail/Engagement metrics (OA)": {
		mvp: false,
		note: "Unsplash analog: download/view counts on open-access works. Reinforces value of OA programme beyond rights badge.",
		issueUrl: issue("CW-54"),
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
