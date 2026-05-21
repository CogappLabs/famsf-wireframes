import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import ImageOrdersClient from "./ImageOrdersClient";

export default function ImageOrdersPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <ImageOrdersClient docs={docs} slugById={objectSlugById()} />;
}
