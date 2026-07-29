/**
 * Shared display-normalisation helpers enforcing FAMSF cataloguing
 * guidelines at render time. Use these whenever rendering a TMS field on
 * any wireframe page — search results, object detail, artist page,
 * portfolio, exhibition, citation builders, etc.
 *
 * Pipeline ships data as curators typed it (minus HTML normalisation).
 * These helpers patch the guideline-vs-source-data gap on the way out.
 */

/** Cataloguing guideline ("Date") + house style ("close up en dashes"):
 *  a CLOSED-UP en dash between year-like tokens in date ranges, not a hyphen
 *  and not a spaced en dash. Replaces ` - ` / ` – ` / `-` between 3-4 digit
 *  numbers with `–` (no surrounding spaces). Safe on non-range strings (no-op). */
export function normaliseDateRange(value: string | null | undefined): string {
	if (!value) return "";
	return value.replace(/(\d{3,4})\s*[-–]\s*(\d{3,4})/g, "$1–$2");
}

/** Render an ISO date as "May 17, 1982". Curators asked for a written-out date
 *  rather than the raw ISO value; FAMSF house style is US month-first.
 *  Returns "" on an unparseable input. */
export function formatIsoDate(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(value.slice(0, 10));
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
}

export interface NormalisedTitle {
	display: string;
	isDescriptive: boolean;
}

/** Cataloguing guideline ("Titles"):
 *  - "Untitled" capitalised for untitled works.
 *  - Descriptive / cataloguer-assigned titles ship from TMS wrapped in
 *    angle brackets `<...>` and are sentence-case (first word + proper
 *    nouns only). Strip brackets at render time and flag the title as
 *    descriptive so callers can style it (italic / no italics) per
 *    house style. Primary titles (no brackets) pass through untouched.
 *
 *  Closing `>` is optional — long descriptive titles get truncated by
 *  TMS varchar caps and lose the closer (e.g. ObjectID 52010). Strip
 *  leading `<` + optional trailing `>` either way. */
export function normaliseTitle(
	raw: string | null | undefined,
): NormalisedTitle {
	if (!raw) return { display: "", isDescriptive: false };
	const trimmed = raw.trim();
	if (/^untitled$/i.test(trimmed))
		return { display: "Untitled", isDescriptive: false };
	if (trimmed.startsWith("<")) {
		const stripped = trimmed.replace(/^</, "").replace(/>$/, "").trim();
		return { display: stripped, isDescriptive: true };
	}
	return { display: trimmed, isDescriptive: false };
}

/** Plain-string convenience: just the display value, no descriptive flag.
 *  Use in list items / cards / breadcrumbs where italic styling isn't
 *  worth the structural branch. */
export function formatTitle(raw: string | null | undefined): string {
	return normaliseTitle(raw).display;
}
