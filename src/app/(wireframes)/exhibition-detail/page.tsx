import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import ExhibitionDetailClient from "./ExhibitionDetailClient";

export interface ExhibitionSummary {
	id: number;
	title: string;
	date: string;
	venue: string;
	objectIds: number[];
}

export default function ExhibitionDetailPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});

	const exhibitionMap = new Map<number, ExhibitionSummary>();
	for (const doc of docs) {
		for (const exh of doc.exhibitions ?? []) {
			if (!exhibitionMap.has(exh.ExhibitionID)) {
				exhibitionMap.set(exh.ExhibitionID, {
					id: exh.ExhibitionID,
					title: exh.ExhTitle,
					date: exh.DisplayDate,
					venue: exh.VenueName,
					objectIds: [],
				});
			}
			exhibitionMap.get(exh.ExhibitionID)?.objectIds.push(doc.id);
		}
	}

	const exhibitions = Array.from(exhibitionMap.values()).sort(
		(a, b) => b.objectIds.length - a.objectIds.length,
	);

	return (
		<ExhibitionDetailClient
			exhibitions={exhibitions}
			docs={docs}
			slugById={objectSlugById()}
		/>
	);
}
