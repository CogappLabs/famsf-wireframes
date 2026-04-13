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
 * Helper to build issue tracker URLs. Replace with your own tracker.
 * Examples:
 *   const linear = (id: string) => `https://linear.app/team/issue/${id}`;
 *   const jira = (id: string) => `https://yourorg.atlassian.net/browse/${id}`;
 */
const issue = (id: string) => `https://linear.app/team/issue/${id}`;

/**
 * Keys use the format "pageId/label" where:
 * - pageId matches the ScopePage id prop (usually the route segment)
 * - label matches the WireframeSection or ScopeMark label prop
 *
 * Example: "homepage/Hero" annotates <WireframeSection label="Hero">
 * inside <ScopePage id="homepage">.
 */
export const scope: Record<string, ScopeEntry> = {
	// ── Example page ───────────────────────────────────────────────────
	"example/Hero": { mvp: true, issueUrl: issue("EX-1") },
	"example/Key stats": { mvp: true, issueUrl: issue("EX-2") },
	"example/Features": {
		mvp: true,
		note: "Content TBD",
		issueUrl: issue("EX-3"),
	},
	"example/Related links": { mvp: true, issueUrl: issue("EX-4") },
	"example/Contact form": {
		mvp: false,
		note: "Form integration TBD",
		issueUrl: issue("EX-5"),
	},

	// ── Content page ───────────────────────────────────────────────────
	"content-page/Page header": { mvp: true, issueUrl: issue("CP-1") },
	"content-page/Body": { mvp: true, issueUrl: issue("CP-2") },
	"content-page/Sidebar": {
		mvp: false,
		note: "Related content feed TBD",
		issueUrl: issue("CP-3"),
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
