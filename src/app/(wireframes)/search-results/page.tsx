import { loadConstituentSamples } from "@/lib/constituent-samples-registry";
import {
	loadGridFacetsDocs,
	loadSampleDocs,
	objectSlugById,
} from "@/lib/sample-docs-registry";
import SearchResultsClient from "./SearchResultsClient";

export default function SearchResultsPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	// Real-data slice (~600 docs, curator-taxonomy facets baked on) used only
	// by the `grid-facets` variation's hierarchical left-column facets.
	const gridFacetsDocs = loadGridFacetsDocs();
	const constituentEntries = loadConstituentSamples();
	const constituents = constituentEntries.map((e) => e.doc);
	const constituentSlugById: Record<number, string> = {};
	for (const e of constituentEntries) {
		constituentSlugById[e.doc.id] = e.slug;
	}
	return (
		<SearchResultsClient
			docs={docs}
			gridFacetsDocs={gridFacetsDocs}
			constituents={constituents}
			constituentSlugById={constituentSlugById}
			objectSlugById={objectSlugById()}
		/>
	);
}
