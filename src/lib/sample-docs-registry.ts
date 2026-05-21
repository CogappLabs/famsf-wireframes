/**
 * Auto-discovery of sample collection docs in src/data/sample-docs/.
 *
 * Filename conventions:
 *   minimal_{id}.json | median_{id}.json | maximal_{id}.json   -> spread set
 *   named_{slug}_{id}.json                                     -> named set
 *
 * Labels, tags and per-card metadata are derived from the document
 * shape itself (title, artist, is_compound, etc) rather than being
 * hand-edited in the page. Drop a new JSON into the directory and it
 * appears in both the index page and the [variant] route on next build.
 */

import fs from "node:fs";
import path from "node:path";
import type { CollectionDocument } from "./collection-document";
import { populatedFieldCount } from "./collection-document";

const DIR = path.join(process.cwd(), "src/data/sample-docs");

export type SampleGroup = "spread" | "named";

export interface SampleEntry {
	slug: string;
	filename: string;
	group: SampleGroup;
	label: string;
	tags: string[];
	doc: CollectionDocument;
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

function deriveTags(doc: CollectionDocument): string[] {
	const tags: string[] = [];
	if (doc.on_view) tags.push("on view");
	if (doc.has_iiif) tags.push("iiif");
	if (doc.is_compound) tags.push("compound parent");
	if (doc.is_virtual) tags.push("virtual");
	if ((doc.physical_child_ids?.length ?? 0) > 0) {
		tags.push(`${doc.physical_child_ids?.length} children`);
	}
	if ((doc.virtual_child_ids?.length ?? 0) > 0) {
		tags.push(`${doc.virtual_child_ids?.length} virtual children`);
	}
	if (doc.physical_parent_id) tags.push("compound child");
	return tags;
}

function deriveLabel(
	slug: string,
	group: SampleGroup,
	doc: CollectionDocument,
): string {
	if (group === "spread") {
		return SPREAD_LABELS[slug] ?? humaniseSlug(slug);
	}
	const title = doc.title?.trim();
	const artist = doc.primary_artist?.trim();
	if (title && artist && artist !== "Unknown artist")
		return `${title} (${artist})`;
	if (title) return title;
	return humaniseSlug(slug);
}

export function loadSampleDocs(): SampleEntry[] {
	// Pick the freshest file per slug. The sample_docs asset can emit
	// multiple minimal_/median_/maximal_ files over time (each pipeline
	// run picks a different ObjectID for the tier), and stale ones stay
	// on disk until manually cleaned. Sort by mtime descending so the
	// newest entry per slug wins.
	const files = fs
		.readdirSync(DIR)
		.filter((f) => f.endsWith(".json"))
		.map((f) => ({ f, mtime: fs.statSync(path.join(DIR, f)).mtimeMs }))
		.sort((a, b) => b.mtime - a.mtime)
		.map((x) => x.f);
	const entries: SampleEntry[] = [];
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
		) as CollectionDocument;
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
	// Spread first (minimal, median, maximal in that order), then named alphabetically.
	const spreadOrder = ["minimal", "median", "maximal"];
	return entries.sort((a, b) => {
		if (a.group !== b.group) return a.group === "spread" ? -1 : 1;
		if (a.group === "spread") {
			return spreadOrder.indexOf(a.slug) - spreadOrder.indexOf(b.slug);
		}
		return a.slug.localeCompare(b.slug);
	});
}

export function findSampleBySlug(slug: string): SampleEntry | undefined {
	return loadSampleDocs().find((e) => e.slug === slug);
}

/** {ObjectID -> slug} lookup. First sample-doc per id wins (registry is
 * already sorted newest-mtime first within each group). */
export function objectSlugById(): Record<number, string> {
	const out: Record<number, string> = {};
	for (const e of loadSampleDocs()) {
		if (out[e.doc.id] === undefined) out[e.doc.id] = e.slug;
	}
	return out;
}
