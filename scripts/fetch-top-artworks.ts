/**
 * Fetch ES records for the top GA artwork titles.
 *
 * Reads /tmp/famsf-top60.tsv (pagePath \t pageTitle \t views), runs a
 * title-targeted query against the cf-famsf-collection index, and writes the
 * top hit per title to /tmp/famsf-top-artworks.json.
 *
 * Usage: bun run scripts/fetch-top-artworks.ts
 */

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://cf-api.lukehmu.com/api/v1";
const INDEX = "cf-famsf-collection";
const FIELDS = [
	"id",
	"accession_number",
	"title",
	"display_date",
	"date_begin",
	"date_end",
	"medium",
	"medium_parts",
	"dimensions",
	"dimensions_structured",
	"credit_line",
	"description",
	"identifying_description",
	"is_compound",
	"department",
	"classification",
	"culture",
	"style",
	"period",
	"dynasty",
	"movement",
	"copyright",
	"accession_date",
	"on_view",
	"label_text",
	"edition",
	"signed",
	"inscribed",
	"markings",
	"constituents",
	"media",
	"exhibitions",
	"geography",
	"term_place_of_creation",
	"term_period",
	"term_style",
	"term_school",
	"primary_artist",
	"primary_image_thumb",
	"iiif_thumbnail_url",
].join(",");

interface GaRow {
	pagePath: string;
	pageTitle: string;
	views: number;
}

interface EsHit {
	_id: string;
	_score: number;
	_source: Record<string, unknown>;
}

interface EsResponse {
	hits?: { hits?: EsHit[]; total?: { value: number } };
}

function readGaRows(path: string): GaRow[] {
	const text = readFileSync(path, "utf8");
	return text
		.trim()
		.split("\n")
		.map((line) => {
			const [pagePath, pageTitle, viewsStr] = line.split("\t");
			return { pagePath, pageTitle, views: Number(viewsStr) };
		})
		.filter((r) => r.pagePath?.startsWith("/artworks/") && r.pageTitle);
}

async function searchTitle(title: string): Promise<EsHit | null> {
	const params = new URLSearchParams({
		q: title,
		perPage: "5",
		fields: FIELDS,
	});
	const res = await fetch(`${API}/${INDEX}?${params}`, {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		console.error(`HTTP ${res.status} for "${title}"`);
		return null;
	}
	const body = (await res.json()) as EsResponse;
	const hits = body.hits?.hits ?? [];
	if (hits.length === 0) return null;

	// Prefer the hit whose title matches case-insensitively; otherwise top by score.
	const lower = title.toLowerCase().trim();
	const exact = hits.find(
		(h) => String(h._source.title ?? "").toLowerCase().trim() === lower,
	);
	return exact ?? hits[0];
}

async function main() {
	const inputPath = "/tmp/famsf-top60.tsv";
	const outPath = "/tmp/famsf-top-artworks.json";
	const rows = readGaRows(inputPath);
	console.log(`Loaded ${rows.length} GA rows.`);

	const seen = new Set<string>();
	const results: { ga: GaRow; hit: EsHit }[] = [];
	for (const row of rows) {
		const key = row.pageTitle.trim();
		if (seen.has(key)) continue;
		seen.add(key);
		const hit = await searchTitle(row.pageTitle);
		if (!hit) {
			console.warn(`No hit: ${row.pageTitle}`);
			continue;
		}
		results.push({ ga: row, hit });
		if (results.length >= 50) break;
		// Be polite — avoid bursts.
		await new Promise((r) => setTimeout(r, 100));
	}

	writeFileSync(outPath, JSON.stringify(results, null, 2));
	console.log(`Wrote ${results.length} hits to ${outPath}`);
}

main();
