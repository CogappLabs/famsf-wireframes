import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import CollectorPageClient from "./CollectorPageClient";

export default function CollectorPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <CollectorPageClient docs={docs} slugById={objectSlugById()} />;
}
