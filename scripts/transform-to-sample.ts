/**
 * Transform /tmp/famsf-top-artworks.json (ES raw hits) into SampleObject TS
 * literals, written to src/lib/sample-data.generated.ts.
 *
 * Usage: bun run scripts/transform-to-sample.ts
 */

import { readFileSync, writeFileSync } from "node:fs";

interface EsConstituent {
	ConstituentID: number;
	Role: string;
	RoleID?: number | null;
	DisplayName: string;
	Nationality?: string | null;
	BeginDate?: number | null;
	EndDate?: number | null;
	DisplayDate?: string | null;
	DisplayLabel?: string | null;
	DisplayOrder?: number | null;
	ConstituentType?: string | null;
}

interface EsMedia {
	MediaMasterID?: number;
	Rank?: number;
	PrimaryDisplay?: boolean;
	DisplayOrder?: number | null;
	MediaView?: string | null;
	PublicCaption?: string | null;
	Copyright?: string | null;
	ApprovedForWeb?: boolean;
	MediaType?: string;
	FileName?: string;
	PixelH?: number;
	PixelW?: number;
}

interface EsGeography {
	Continent?: string | null;
	Country?: string | null;
	Region?: string | null;
	PrimaryDisplay?: boolean | null;
}

interface EsDimensionsStructured {
	displaydimensions?: string | null;
	description?: string | null;
	displayed?: boolean | null;
	rank?: number | null;
}

interface EsSource {
	id: number;
	accession_number: string;
	title: string;
	display_date?: string | null;
	date_begin?: number | null;
	date_end?: number | null;
	medium?: string | null;
	medium_parts?: string[] | null;
	dimensions?: string | null;
	dimensions_structured?: EsDimensionsStructured[] | null;
	credit_line?: string | null;
	description?: string | null;
	identifying_description?: string | null;
	is_compound?: boolean | null;
	department?: string | null;
	classification?: string | null;
	culture?: string | null;
	style?: string | null;
	period?: string | null;
	dynasty?: string | null;
	movement?: string | null;
	copyright?: string | null;
	accession_date?: string | null;
	on_view?: boolean | null;
	label_text?: string | null;
	edition?: string | null;
	signed?: string | null;
	inscribed?: string | null;
	markings?: string | null;
	constituents?: EsConstituent[] | null;
	media?: EsMedia[] | null;
	geography?: EsGeography[] | null;
	term_place_of_creation?: string[] | null;
	primary_artist?: string | null;
	iiif_thumbnail_url?: string | null;
}

interface InputRow {
	ga: { pagePath: string; pageTitle: string; views: number };
	hit: { _id: string; _source: EsSource };
}

function ensureNonEmpty<T>(arr: T[] | null | undefined): T[] | undefined {
	if (!arr || arr.length === 0) return undefined;
	return arr;
}

function nonEmptyString(s: string | null | undefined): string | undefined {
	if (s === null || s === undefined) return undefined;
	const t = s.trim();
	return t.length > 0 ? t : undefined;
}

function yearOnly(date: string | null | undefined): string | undefined {
	if (!date) return undefined;
	const m = date.match(/\d{4}/);
	return m ? m[0] : undefined;
}

function mapCopyright(
	status: string | null | undefined,
): "public-domain" | "in-copyright" | "copyright-unknown" | undefined {
	if (!status) return "copyright-unknown";
	const s = status.toLowerCase();
	if (s.includes("no copyright") || s.includes("public domain"))
		return "public-domain";
	if (s.includes("in copyright") || s.includes("©") || s.includes("copyright"))
		return "in-copyright";
	return "copyright-unknown";
}

function transformConstituents(list: EsConstituent[] | null | undefined) {
	const arr = ensureNonEmpty(list);
	if (!arr) return undefined;
	return arr.map((c) => ({
		id: `C-${c.ConstituentID}`,
		name: c.DisplayName,
		role: c.Role,
		dates: c.DisplayDate ?? undefined,
		nationality: c.Nationality ?? undefined,
	}));
}

function pickPrimaryArtist(
	primary: string | null | undefined,
	constituents: EsConstituent[] | null | undefined,
): { artist: string; artistDates: string; artistNationality: string } {
	const c = constituents?.find((c) => c.Role === "Artist") ?? constituents?.[0];
	const artist = primary ?? c?.DisplayName ?? "Unknown";
	const artistDates = c?.DisplayDate ?? "";
	const artistNationality = c?.Nationality ?? "";
	return { artist, artistDates, artistNationality };
}

function transformImages(
	media: EsMedia[] | null | undefined,
): { label: string; altText: string }[] | undefined {
	const arr = ensureNonEmpty(media);
	if (!arr) return undefined;
	const ranked = [...arr].sort(
		(a, b) =>
			Number(b.PrimaryDisplay ?? false) - Number(a.PrimaryDisplay ?? false) ||
			(a.Rank ?? 99) - (b.Rank ?? 99),
	);
	return ranked.slice(0, 4).map((m, i) => ({
		label: m.MediaView ?? (i === 0 ? "Primary view" : `View ${i + 1}`),
		altText: m.PublicCaption ?? "",
	}));
}

function transformGeography(
	geo: EsGeography[] | null | undefined,
):
	| { place: string; type?: "Path" | "Find Site" | "Place" | "Region" }[]
	| undefined {
	const arr = ensureNonEmpty(geo);
	if (!arr) return undefined;
	const out: {
		place: string;
		type?: "Path" | "Find Site" | "Place" | "Region";
	}[] = [];
	for (const g of arr) {
		if (g.Country)
			out.push({
				place: [g.Country, g.Region, g.Continent].filter(Boolean).join(" > "),
				type: "Place",
			});
		else if (g.Region) out.push({ place: g.Region, type: "Region" });
		else if (g.Continent) out.push({ place: g.Continent, type: "Region" });
	}
	return out.length > 0 ? out : undefined;
}

function transformDimensionsStructured(
	dims: EsDimensionsStructured[] | null | undefined,
):
	| { description: string; displayDimensions: string }[]
	| undefined {
	const arr = ensureNonEmpty(dims);
	if (!arr) return undefined;
	const out = arr
		.filter((d) => d.displaydimensions && d.description)
		.map((d) => ({
			description: d.description ?? "",
			displayDimensions: d.displaydimensions ?? "",
		}));
	return out.length > 0 ? out : undefined;
}

function literal(value: unknown, indent = 1): string {
	const pad = "\t".repeat(indent);
	const padInner = "\t".repeat(indent + 1);
	if (value === undefined) return "undefined";
	if (value === null) return "null";
	if (typeof value === "string") {
		const escaped = value
			.replace(/\\/g, "\\\\")
			.replace(/`/g, "\\`")
			.replace(/\$\{/g, "\\${");
		return `\`${escaped}\``;
	}
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		const items = value.map((v) => `${padInner}${literal(v, indent + 1)}`);
		return `[\n${items.join(",\n")},\n${pad}]`;
	}
	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>).filter(
			([, v]) => v !== undefined,
		);
		if (entries.length === 0) return "{}";
		const lines = entries.map(
			([k, v]) =>
				`${padInner}${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${literal(v, indent + 1)}`,
		);
		return `{\n${lines.join(",\n")},\n${pad}}`;
	}
	return JSON.stringify(value);
}

// Curated IDs already present in src/lib/sample-data.ts — skip these to keep
// React keys unique once the generated set is spread alongside.
const CURATED_IDS = new Set([
	"100167", // Pissarro — The Road Near the Farm (Pissarro sample)
]);

function main() {
	const rows = JSON.parse(
		readFileSync("/tmp/famsf-top-artworks.json", "utf8"),
	) as InputRow[];

	const objects = rows
		.filter(({ hit }) => !CURATED_IDS.has(String(hit._source.id)))
		.map(({ ga, hit }) => {
		const s = hit._source;
		const { artist, artistDates, artistNationality } = pickPrimaryArtist(
			s.primary_artist,
			s.constituents,
		);
		return {
			id: String(s.id),
			title: nonEmptyString(s.title) ?? "Untitled",
			artist,
			artistDates,
			artistNationality,
			constituents: transformConstituents(s.constituents),
			date: nonEmptyString(s.display_date) ?? "",
			dateBegin: s.date_begin ?? undefined,
			dateEnd: s.date_end ?? undefined,
			medium: nonEmptyString(s.medium) ?? "",
			dimensions: nonEmptyString(s.dimensions) ?? "",
			dimensionsStructured: transformDimensionsStructured(
				s.dimensions_structured,
			),
			creditLine: nonEmptyString(s.credit_line) ?? "",
			accession: s.accession_number,
			accessionDate: yearOnly(s.accession_date),
			department: nonEmptyString(s.department) ?? "",
			classification: nonEmptyString(s.classification) ?? "",
			onView: Boolean(s.on_view),
			labelText: nonEmptyString(s.label_text),
			culture: nonEmptyString(s.culture),
			style: nonEmptyString(s.style),
			period: nonEmptyString(s.period),
			movement: nonEmptyString(s.movement),
			edition: nonEmptyString(s.edition),
			signed: nonEmptyString(s.signed),
			inscriptions: nonEmptyString(s.inscribed),
			markings: nonEmptyString(s.markings),
			identifyingDescription: nonEmptyString(s.identifying_description),
			images: transformImages(s.media),
			geography: transformGeography(s.geography),
			placeOfCreation: ensureNonEmpty(s.term_place_of_creation),
			copyrightStatus: mapCopyright(s.copyright),
			meta: { gaViews: ga.views, gaPath: ga.pagePath },
		};
	});

	const header = `/**
 * Auto-generated from real ES records for the top GA-viewed artworks.
 * Source: scripts/fetch-top-artworks.ts → scripts/transform-to-sample.ts
 * Generated: ${new Date().toISOString()}
 *
 * Do not hand-edit. Regenerate by re-running the scripts.
 */

import type { SampleObject } from "./sample-data";

export const topViewedObjects: SampleObject[] = [\n`;
	const body = objects
		.map((o) => {
			const { meta, ...rest } = o;
			return `\t// GA views (90d): ${meta.gaViews} — ${meta.gaPath}\n\t${literal(rest, 1)},`;
		})
		.join("\n");
	const footer = "\n];\n";

	writeFileSync(
		"src/lib/sample-data.generated.ts",
		header + body + footer,
	);
	console.log(`Wrote ${objects.length} objects to src/lib/sample-data.generated.ts`);
}

main();
