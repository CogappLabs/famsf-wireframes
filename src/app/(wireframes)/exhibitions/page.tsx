import { loadSampleDocs } from "@/lib/sample-docs-registry";
import ExhibitionsClient from "./ExhibitionsClient";

export interface ExhibitionListEntry {
	id: number;
	title: string;
	date: string;
	venue: string;
	objectCount: number;
	endYear: number | null;
}

const VENUE_PATTERNS: Array<[RegExp, string]> = [
	[/de young/i, "de Young"],
	[/legion of honor/i, "Legion of Honor"],
	[/fine arts museums/i, "FAMSF"],
	[/fine arts museum/i, "FAMSF"],
];

function normaliseVenue(raw: string): string {
	for (const [re, name] of VENUE_PATTERNS) {
		if (re.test(raw)) return name;
	}
	return raw.split(",")[0]?.trim() || "Other venue";
}

function extractEndYear(date: string): number | null {
	const years = date.match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/g);
	if (!years || years.length === 0) return null;
	return Math.max(...years.map((y) => Number.parseInt(y, 10)));
}

export default function ExhibitionsIndexPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});

	const map = new Map<number, ExhibitionListEntry>();
	for (const doc of docs) {
		for (const exh of doc.exhibitions ?? []) {
			const id = exh.ExhibitionID;
			if (!map.has(id)) {
				map.set(id, {
					id,
					title: exh.ExhTitle,
					date: exh.DisplayDate,
					venue: normaliseVenue(exh.VenueName ?? ""),
					objectCount: 0,
					endYear: extractEndYear(exh.DisplayDate ?? ""),
				});
			}
			const entry = map.get(id);
			if (entry) entry.objectCount += 1;
		}
	}

	const exhibitions = Array.from(map.values()).sort((a, b) => {
		const ay = a.endYear ?? -Infinity;
		const by = b.endYear ?? -Infinity;
		if (by !== ay) return by - ay;
		return a.title.localeCompare(b.title);
	});

	return <ExhibitionsClient exhibitions={exhibitions} />;
}
