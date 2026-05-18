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

export interface WireframePage {
	id: string;
	title: string;
	description: string;
	status: ReviewStatus;
}

export const pages: WireframePage[] = [
	{
		id: "collection-landing",
		title: "Collection Landing",
		description:
			"Main entry point — explore vs search pathways, browse by area, stats, highlights",
		status: "wip",
	},
	{
		id: "search-results",
		title: "Search Results",
		description:
			"Collection search with advanced filters, grid/list toggle, attribution qualifiers",
		status: "wip",
	},
	{
		id: "object-detail",
		title: "Object Detail",
		description:
			"The one-stop shop — image gallery, tombstone, provenance, exhibitions, related works",
		status: "wip",
	},
	{
		id: "collection-area",
		title: "Collection Area",
		description:
			"Department landing page — about, highlights, browse options, related content",
		status: "wip",
	},
	{
		id: "artist-page",
		title: "Artist Page",
		description:
			"Artist entity page — biography, works grid, exhibition history",
		status: "wip",
	},
	{
		id: "explore",
		title: "Explore",
		description:
			"Curated browse — themes, timeline, discovery prompts, most viewed",
		status: "wip",
	},
	{
		id: "collector-page",
		title: "Collector / Donor Page",
		description:
			"Entity page for major collectors — biography, associated objects, civic history",
		status: "wip",
	},
	{
		id: "portfolio-detail",
		title: "Portfolio / Multi-Part Work",
		description:
			"Parent-child record — sequential display for portfolios, sketchbooks, illustrated books",
		status: "wip",
	},
	{
		id: "parent-record",
		title: "Parent Record (Ensemble / Series)",
		description:
			"Parent record for ensembles and series — components grid, contextual essay, related parent records",
		status: "wip",
	},
	{
		id: "my-finds",
		title: "My Finds",
		description:
			"Personal research package — saved objects, no login, shareable URL",
		status: "wip",
	},
	{
		id: "seed-journey",
		title: "Seed Journey",
		description:
			"Pick a saved object, follow a direction, build a shareable journey through related works",
		status: "wip",
	},
	{
		id: "visit-planner",
		title: "Visit Planner",
		description:
			"Concierge experience — visitor type, interests, curated gallery paths",
		status: "wip",
	},
	{
		id: "educational-resources",
		title: "Educational Resources",
		description:
			"Educator landing — lesson plans, gallery filter, age-level content adaptation",
		status: "wip",
	},
	{
		id: "exhibition-detail",
		title: "Exhibition Detail",
		description:
			"Exhibition record — venue, dates, included works (cross-link target from object exhibition history)",
		status: "wip",
	},
	{
		id: "image-orders",
		title: "Image Orders (post-MVP)",
		description: "Image licensing / order workflow for in-copyright works",
		status: "wip",
	},
	{
		id: "accessibility-statement",
		title: "Accessibility Statement",
		description: "WCAG 2.2 AA conformance statement and contact",
		status: "wip",
	},
	{
		id: "feature-status",
		title: "Feature Status",
		description:
			"Cross-page MVP / post-MVP feature inventory derived from scope annotations",
		status: "wip",
	},
	{
		id: "sitemap",
		title: "Site Map",
		description:
			"Information architecture — page hierarchy and navigation structure",
		status: "wip",
	},
	{
		id: "objects/sample",
		title: "Sample Objects (ETL data)",
		description:
			"Three real pipeline documents wired in — minimal (17 fields), median (34 fields), maximal (49 fields). Refresh via npm run sync:samples.",
		status: "wip",
	},
	{
		id: "constituents/sample",
		title: "Sample Constituents (ETL data)",
		description:
			"Ten real per-constituent documents from the pipeline. Min / median / max populated-field spread plus seven named pins (Monet, Holman Hunt, Diebenkorn, Spy, anonymous, Cartier, Tetsuya Noda). Each carries a sample_objects thumbnail grid.",
		status: "wip",
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
			{ label: "Object Detail", href: "/object-detail" },
			{ label: "Portfolio / Multi-Part", href: "/portfolio-detail" },
			{
				label: "Parent Record (Ensemble / Series)",
				href: "/parent-record?id=ENS-100",
			},
			{ label: "Collection Area", href: "/collection-area" },
			{ label: "Artist Page", href: "/artist-page" },
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
// Standalone collection site — not part of the main FAMSF website.

export interface SiteNavItem {
	label: string;
	href: string;
	children?: SiteNavItem[];
}

export const siteNavigation: SiteNavItem[] = [
	{ label: "Explore", href: "/explore" },
	{ label: "Search", href: "/search-results" },
	{ label: "My Finds", href: "/my-finds" },
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

// Footer groups model the live, public collection site — wireframe-internal
// pages (object-detail, artist-page, etc.) are reachable from the wireframe
// index, not the footer.
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
