import type { CollectionDocument } from "@/lib/collection-document";
import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs: CollectionDocument[] = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <ExploreClient docs={docs} slugById={objectSlugById()} />;
}
