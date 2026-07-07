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

export interface ImageCaption {
	/** Text before the title (artist, trailing ", "). */
	pre: string;
	/** The work's title / descriptive name. */
	title: string;
	/** True for a real title (italic); false for a descriptive name (roman). */
	titleItalic: boolean;
	/** Everything after the title, starting with ", " (year, medium … credit). */
	post: string;
}

interface CaptionSource {
	primary_artist?: string | null;
	title?: string | null;
	display_date?: string | null;
	medium?: string | null;
	dimensions?: string | null;
	credit_line?: string | null;
	accession_number?: string | null;
	/** Photography / copyright credit line, appended last where present. */
	photo_credit?: string | null;
}

/**
 * House-style image caption (object-page notes, rule 7):
 *   Artist, <title | description>, year. Medium, dimensions. Fine Arts
 *   Museums of San Francisco, credit line, accession number. Photo credit.
 *
 * The title is italic for real titles, roman for descriptive/assigned names
 * (see normaliseTitle). NB deliberately NO ", courtesy of …" — that clause is
 * only for the "cite this image" credit given to external users, not the
 * on-page caption. Returns structured segments so the caller can italicise the
 * title; `pre + title + post` is the full string.
 */
export function formatImageCaption(doc: CaptionSource): ImageCaption {
	const { display, isDescriptive } = normaliseTitle(doc.title);

	const pre = doc.primary_artist ? `${doc.primary_artist}, ` : "";

	// After the title: ", year. Medium, dimensions. FAMSF, credit, accession. Photo."
	const year = normaliseDateRange(doc.display_date);
	const firstSentenceTail = year ? `, ${year}.` : ".";

	const makeDims = [doc.medium, doc.dimensions].filter(Boolean).join(", ");
	const mediumSentence = makeDims ? ` ${makeDims}.` : "";

	const famsf = [
		"Fine Arts Museums of San Francisco",
		doc.credit_line,
		doc.accession_number,
	].filter(Boolean);
	const famsfSentence = ` ${famsf.join(", ")}.`;

	const photo = doc.photo_credit ? ` ${doc.photo_credit}.` : "";

	return {
		pre,
		title: display,
		titleItalic: !isDescriptive && display !== "" && display !== "Untitled",
		post: `${firstSentenceTail}${mediumSentence}${famsfSentence}${photo}`,
	};
}
