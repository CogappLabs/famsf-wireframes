/**
 * Central wireframe data layer.
 *
 * All wireframe metadata lives here: the page registry, review statuses,
 * and navigation structure. The index, top bar, footer, and scope system
 * all derive from this file.
 *
 * To add a new wireframe:
 * 1. Add an entry to `pages` below
 * 2. Add scope entries to `scope.ts`
 * 3. Create `app/(wireframes)/<id>/page.tsx`
 */

// ── Review status ────────────────────────────────────────────────────

export type ReviewStatus = "wip" | "review" | "with-client" | "approved";

export const STATUS_LABELS: Record<ReviewStatus, string> = {
	wip: "WIP",
	review: "Review",
	"with-client": "With client",
	approved: "Approved",
};

export const STATUS_STYLES: Record<ReviewStatus, string> = {
	wip: "border-gray-300 text-gray-400",
	review: "border-amber-400 text-amber-600",
	"with-client": "border-blue-400 text-blue-600",
	approved: "border-green-400 text-green-600",
};

// ── Page registry ────────────────────────────────────────────────────

export type PageCategory =
	| "browse"
	| "records"
	| "features"
	| "meta"
	| "data"
	| "reference";

export interface WireframePage {
	id: string;
	title: string;
	description: string;
	status: ReviewStatus;
	/** Display grouping on the index page. */
	category?: PageCategory;
}

export const CATEGORY_LABELS: Record<PageCategory, string> = {
	browse: "Browse & search",
	records: "Records",
	features: "Features",
	meta: "Meta / IA",
	data: "Sample ETL data",
	reference: "Pipeline reference docs",
};

export const CATEGORY_ORDER: PageCategory[] = [
	"browse",
	"records",
	"features",
	"meta",
	"data",
	"reference",
];

export const pages: WireframePage[] = [
	{
		id: "collection-landing",
		title: "Collection landing",
		description:
			"Main entry point: explore vs search pathways, browse by area, stats, highlights",
		status: "wip",
		category: "browse",
	},
	{
		id: "search-results",
		title: "Search results",
		description:
			"Collection search with advanced filters, grid/list toggle, attribution qualifiers",
		status: "wip",
		category: "browse",
	},
	{
		id: "collection-area",
		title: "Collection area",
		description:
			"Department landing page: about, highlights, browse options, related content",
		status: "wip",
		category: "records",
	},
	{
		id: "artist-search",
		title: "Artist search",
		description:
			"Browse and search the people index (artists, makers, institutions, donors). Name search + A–Z filter. Initials avatars stand in for the ~95% of people without portraits.",
		status: "wip",
		category: "records",
	},
	{
		id: "explore",
		title: "Explore",
		description:
			"Curated browse: themes, timeline, discovery prompts, most viewed",
		status: "wip",
		category: "browse",
	},
	{
		id: "collector-page",
		title: "Collector / donor page",
		description:
			"Entity page for major collectors: biography, associated objects, civic history",
		status: "wip",
		category: "records",
	},
	{
		id: "portfolio-detail",
		title: "Portfolio / multi-part work",
		description:
			"Parent-child record: sequential display for portfolios, sketchbooks, illustrated books",
		status: "wip",
		category: "records",
	},
	{
		id: "parent-record",
		title: "Parent record (ensemble / series)",
		description:
			"Parent record for ensembles and series: components grid, contextual essay, related parent records",
		status: "wip",
		category: "records",
	},
	{
		id: "my-finds",
		title: "My finds",
		description:
			"Personal research package: saved objects, no login, shareable URL",
		status: "wip",
		category: "features",
	},
	{
		id: "seed-journey",
		title: "Seed journey",
		description:
			"Pick a saved object, follow a direction, build a shareable journey through related works",
		status: "wip",
		category: "features",
	},
	{
		id: "visit-planner",
		title: "Visit planner",
		description:
			"Concierge experience: visitor type, interests, curated gallery paths",
		status: "wip",
		category: "features",
	},
	{
		id: "educational-resources",
		title: "Educational resources",
		description:
			"Educator landing: lesson plans, gallery filter, age-level content adaptation",
		status: "wip",
		category: "features",
	},
	{
		id: "departments",
		title: "Departments",
		description:
			"Index of curatorial departments (African Art, European Paintings, Achenbach Foundation, etc.) with object counts. Cards link to /collection-area.",
		status: "wip",
		category: "browse",
	},
	{
		id: "exhibitions",
		title: "Exhibitions",
		description:
			"Browse all exhibitions: filter by status (current / upcoming / past) and venue (de Young / Legion). Cards link to exhibition detail.",
		status: "wip",
		category: "browse",
	},
	{
		id: "exhibition-detail",
		title: "Exhibition detail",
		description:
			"Exhibition record: venue, dates, included works (cross-link target from object exhibition history)",
		status: "wip",
		category: "records",
	},
	{
		id: "image-orders",
		title: "Image orders (post-MVP)",
		description: "Image licensing / order workflow for in-copyright works",
		status: "wip",
		category: "features",
	},
	{
		id: "accessibility-statement",
		title: "Accessibility statement",
		description: "WCAG 2.2 AA conformance statement and contact",
		status: "wip",
		category: "meta",
	},
	{
		id: "feature-status",
		title: "Feature status",
		description:
			"Cross-page MVP / post-MVP feature inventory derived from scope annotations",
		status: "wip",
		category: "meta",
	},
	{
		id: "sitemap",
		title: "Site map",
		description:
			"Information architecture: page hierarchy and navigation structure",
		status: "wip",
		category: "meta",
	},
	{
		id: "objects/sample",
		title: "Sample objects (ETL data)",
		description:
			"Three real pipeline documents wired in: minimal (17 fields), median (34 fields), maximal (49 fields). Refresh via npm run sync:samples.",
		status: "wip",
		category: "data",
	},
	{
		id: "constituents/sample",
		title: "Sample people (ETL data)",
		description:
			"Ten real per-constituent documents from the pipeline. Min / median / max populated-field spread plus seven named pins (Monet, Holman Hunt, Diebenkorn, Spy, anonymous, Cartier, Tetsuya Noda). Each carries a sample_objects thumbnail grid.",
		status: "wip",
		category: "data",
	},
	{
		id: "schema-reference",
		title: "Schema reference",
		description:
			"Every ES field with upstream column lineage from the Dagster pipeline. Generated by the schema_doc asset using dagster/column_lineage metadata + CollectionSchema + ES_MAPPING. Auto-refreshes via COLFLOW_WIREFRAMES_SCHEMA_PATH on each pipeline run.",
		status: "wip",
		category: "reference",
	},
	{
		id: "transformations",
		title: "Source → wireframe transformations",
		description:
			"What we change from TMS source through the Dagster pipeline to the wireframe render. Cross-references each rule to the FAMSF Object Cataloguing Guidelines section it implements.",
		status: "wip",
		category: "reference",
	},
	{
		id: "curator-deviations",
		title: "Curator rule deviations",
		description:
			"Where the FAMSF Object Cataloguing Guidelines mandate one thing and the TMS data shows another. Curator-side cleanup candidates + compensation strategy notes.",
		status: "wip",
		category: "reference",
	},
];

// ── Navigation tree ──────────────────────────────────────────────────

export interface NavNode {
	label: string;
	href: string;
	children?: NavNode[];
}

export const navigation: NavNode[] = [
	{ label: "Home", href: "/" },
	{
		label: "Browse & Search",
		href: "",
		children: [
			{ label: "Collection Landing", href: "/collection-landing" },
			{ label: "Explore", href: "/explore" },
			{ label: "Search Results", href: "/search-results" },
		],
	},
	{
		label: "Records",
		href: "",
		children: [
			{ label: "Portfolio / Multi-Part", href: "/portfolio-detail" },
			{
				label: "Parent Record (Ensemble / Series)",
				href: "/parent-record?id=ENS-100",
			},
			{ label: "Collection Area", href: "/collection-area" },
			{ label: "Artist Search", href: "/artist-search" },
			{ label: "Collector / Donor", href: "/collector-page" },
		],
	},
	{
		label: "Features",
		href: "",
		children: [
			{ label: "My Finds", href: "/my-finds" },
			{ label: "Visit Planner", href: "/visit-planner" },
			{ label: "Educational Resources", href: "/educational-resources" },
		],
	},
	{ label: "Feature Status", href: "/feature-status" },
	{ label: "Site Map", href: "/sitemap" },
];

// ── Global site navigation ──────────────────────────────────────────
// Standalone collection site: not part of the main FAMSF website.

export interface SiteNavItem {
	label: string;
	href: string;
	children?: SiteNavItem[];
}

export const siteNavigation: SiteNavItem[] = [
	{ label: "Explore", href: "/explore" },
	{ label: "Search", href: "/search-results" },
	{ label: "Departments", href: "/departments" },
	{ label: "Exhibitions", href: "/exhibitions" },
	{ label: "My finds", href: "/my-finds" },
	{
		label: "Collection Areas",
		href: "/collection-area",
		children: [
			{
				label: "Achenbach Foundation for Graphic Arts",
				href: "/collection-area",
			},
			{ label: "American Art", href: "/collection-area" },
			{ label: "Arts of Africa", href: "/collection-area" },
			{ label: "Arts of Oceania", href: "/collection-area" },
			{ label: "Arts of the Americas", href: "/collection-area" },
			{ label: "Ancient Art", href: "/collection-area" },
			{ label: "Contemporary Art", href: "/collection-area" },
			{ label: "Costume + Textile Arts", href: "/collection-area" },
			{ label: "European Paintings", href: "/collection-area" },
			{
				label: "European Decorative Arts + Sculpture",
				href: "/collection-area",
			},
		],
	},
];

// ── Footer link groups ───────────────────────────────────────────────

export interface FooterGroup {
	heading: string;
	links: { label: string; href: string }[];
}

// Footer groups model the live, public collection site: wireframe-internal
// pages (objects/sample, constituent samples, etc.) are reachable from the
// wireframe index, not the footer.
export const footerGroups: FooterGroup[] = [
	{
		heading: "Collection",
		links: [
			{ label: "Search", href: "/search-results" },
			{ label: "Explore", href: "/explore" },
			{ label: "Collection areas", href: "/collection-area" },
		],
	},
	{
		heading: "Tools",
		links: [
			{ label: "My finds", href: "/my-finds" },
			{ label: "Visit planner", href: "/visit-planner" },
			{ label: "Educational resources", href: "/educational-resources" },
		],
	},
];
