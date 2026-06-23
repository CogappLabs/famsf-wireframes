// Real collection-area member data, generated from the pipeline export by
// `scripts/build_collection_data.py`. Two shapes: highlight-package members
// grouped by department (collection area), and named "(Web)" collection members
// keyed by collection slug. Drives the highlights grids and featured-collection
// child pages with real curator-picked works instead of hand-typed placeholders.

import data from "@/data/collection-area-members.json";

/** A collection member as carried in the generated data file. */
export interface CollectionMember {
	id: number;
	title: string | null;
	artist: string | null;
	date: string | null;
	medium: string | null;
	slug: string;
	/** Curator display rank within the highlight package (highlights only). */
	rank?: number;
}

interface CollectionData {
	highlightsByDepartment: Record<string, CollectionMember[]>;
	featuredMembers: Record<string, CollectionMember[]>;
}

const COLLECTION_DATA = data as CollectionData;

/** Real Web Highlights members for a collection area (department name), ordered
 *  by curator rank. Empty array if the department has no highlights data. */
export function highlightsForDepartment(
	department: string,
): CollectionMember[] {
	return COLLECTION_DATA.highlightsByDepartment[department] ?? [];
}

/** Real members of a named "(Web)" collection (e.g. Crown Point Press), by its
 *  slugified collection name. Empty array if not a real named collection. */
export function featuredMembersForSlug(slug: string): CollectionMember[] {
	return COLLECTION_DATA.featuredMembers[slug] ?? [];
}

/** A flat pool of highlight members across all departments, for the homepage
 *  highlights module. Deterministic order (department, then rank). */
export function allHighlightMembers(): CollectionMember[] {
	return Object.values(COLLECTION_DATA.highlightsByDepartment).flat();
}

/** The full department → highlight-members map (read-only). */
export function highlightsByDepartmentMap(): Record<
	string,
	CollectionMember[]
> {
	return COLLECTION_DATA.highlightsByDepartment;
}

/** A cross-department sample for the homepage highlights row: the top-ranked
 *  member from each department, capped at `limit`. Gives one recognisable work
 *  per collection area rather than a single department dominating. */
export function homepageHighlights(limit = 6): CollectionMember[] {
	const topPerDept = Object.values(COLLECTION_DATA.highlightsByDepartment)
		.map((members) => members[0])
		.filter((m): m is CollectionMember => Boolean(m));
	return topPerDept.slice(0, limit);
}
