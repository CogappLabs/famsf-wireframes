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
		id: "example",
		title: "Example Page",
		description:
			"Starter wireframe demonstrating every available template component",
		status: "wip",
	},
	{
		id: "content-page",
		title: "Content Page",
		description:
			"Long-form informational page with breadcrumb, body sections, and sidebar links",
		status: "wip",
	},
	{
		id: "sitemap",
		title: "Site Map",
		description:
			"Information architecture — page hierarchy and navigation structure",
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
		label: "Pages",
		href: "",
		children: [
			{ label: "Example", href: "/example" },
			{ label: "Content Page", href: "/content-page" },
		],
	},
	{ label: "Site Map", href: "/sitemap" },
];

// ── Footer link groups ───────────────────────────────────────────────

export interface FooterGroup {
	heading: string;
	links: { label: string; href: string }[];
}

export const footerGroups: FooterGroup[] = [
	{
		heading: "Pages",
		links: pages.map((p) => ({ label: p.title, href: `/${p.id}` })),
	},
];
