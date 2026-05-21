/**
 * Auto-discovery of sample constituent docs in src/data/sample-constituents/.
 *
 * Filename conventions:
 *   minimal_{id}.json | median_{id}.json | maximal_{id}.json   -> spread set
 *   named_{slug}_{id}.json                                     -> named set
 *
 * Drop a new JSON into the directory and it appears in both the index page
 * and the [variant] route on next build.
 */

import fs from "node:fs";
import path from "node:path";
import type { ConstituentDocument } from "./constituent-document";
import { populatedFieldCount } from "./constituent-document";

const DIR = path.join(process.cwd(), "src/data/sample-constituents");

export type SampleGroup = "spread" | "named";

export interface ConstituentSampleEntry {
	slug: string;
	filename: string;
	group: SampleGroup;
	label: string;
	tags: string[];
	doc: ConstituentDocument;
	populatedFields: number;
	reason: string | null;
}

const SPREAD_LABELS: Record<string, string> = {
	minimal: "Minimal",
	median: "Median",
	maximal: "Maximal",
};

function humaniseSlug(slug: string): string {
	return slug
		.split("-")
		.map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
		.join(" ");
}

function deriveTags(doc: ConstituentDocument): string[] {
	const tags: string[] = [];
	if (doc.institution) tags.push("institution");
	if ((doc.display_bios?.length ?? 0) > 1) {
		tags.push(`${doc.display_bios?.length} bios`);
	}
	if (doc.object_count > 0) {
		tags.push(`${doc.object_count} object${doc.object_count === 1 ? "" : "s"}`);
	}
	return tags;
}

function deriveLabel(
	slug: string,
	group: SampleGroup,
	doc: ConstituentDocument,
): string {
	if (group === "spread") {
		return SPREAD_LABELS[slug] ?? humaniseSlug(slug);
	}
	const name = doc.name?.trim();
	if (name) return name;
	return humaniseSlug(slug);
}

export function loadConstituentSamples(): ConstituentSampleEntry[] {
	const files = fs
		.readdirSync(DIR)
		.filter((f) => f.endsWith(".json"))
		.map((f) => ({ f, mtime: fs.statSync(path.join(DIR, f)).mtimeMs }))
		.sort((a, b) => b.mtime - a.mtime)
		.map((x) => x.f);

	const entries: ConstituentSampleEntry[] = [];
	const seenSlugs = new Set<string>();

	for (const filename of files) {
		const namedMatch = filename.match(/^named_(.+)_\d+\.json$/);
		const spreadMatch = filename.match(/^(minimal|median|maximal)_\d+\.json$/);
		let slug: string;
		let group: SampleGroup;

		if (namedMatch) {
			slug = namedMatch[1];
			group = "named";
		} else if (spreadMatch) {
			slug = spreadMatch[1];
			group = "spread";
		} else {
			continue;
		}

		if (seenSlugs.has(slug)) continue;
		seenSlugs.add(slug);

		const doc = JSON.parse(
			fs.readFileSync(path.join(DIR, filename), "utf-8"),
		) as ConstituentDocument;

		entries.push({
			slug,
			filename,
			group,
			label: deriveLabel(slug, group, doc),
			tags: deriveTags(doc),
			doc,
			populatedFields: populatedFieldCount(doc),
			reason: doc._sample_meta?.reason ?? null,
		});
	}

	// Spread first (minimal, median, maximal), then named alphabetically.
	const spreadOrder = ["minimal", "median", "maximal"];
	return entries.sort((a, b) => {
		if (a.group !== b.group) return a.group === "spread" ? -1 : 1;
		if (a.group === "spread") {
			return spreadOrder.indexOf(a.slug) - spreadOrder.indexOf(b.slug);
		}
		return a.slug.localeCompare(b.slug);
	});
}

export function findConstituentBySlug(
	slug: string,
): ConstituentSampleEntry | undefined {
	return loadConstituentSamples().find((e) => e.slug === slug);
}

/** Resolve a constituent name (case-insensitive) to its slug, or null. */
export function findConstituentSlugByName(name: string): string | null {
	const lc = name.trim().toLowerCase();
	if (!lc) return null;
	const hit = loadConstituentSamples().find(
		(e) => (e.doc.name ?? "").toLowerCase() === lc,
	);
	return hit?.slug ?? null;
}

/** Build a quick {id -> slug} lookup. Useful for server pages that already
 * iterate registry entries and need to render links inside client children. */
export function constituentSlugById(): Record<number, string> {
	const out: Record<number, string> = {};
	for (const e of loadConstituentSamples()) out[e.doc.id] = e.slug;
	return out;
}

/** Build a {lowercase artist name -> slug} lookup. Useful for client pages
 * that have a free-text artist name and need to resolve to a constituent
 * route. */
export function constituentSlugByName(): Record<string, string> {
	const out: Record<string, string> = {};
	for (const e of loadConstituentSamples()) {
		if (e.doc.name) out[e.doc.name.toLowerCase()] = e.slug;
	}
	return out;
}
