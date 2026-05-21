import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import SeedJourneyClient from "./SeedJourneyClient";

export default function SeedJourneyPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <SeedJourneyClient docs={docs} slugById={objectSlugById()} />;
}
