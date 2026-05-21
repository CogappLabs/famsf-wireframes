import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import EducationalResourcesClient from "./EducationalResourcesClient";

export default function EducationalResourcesPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <EducationalResourcesClient docs={docs} slugById={objectSlugById()} />;
}
