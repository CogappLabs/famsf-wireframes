import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import VisitPlannerClient from "./VisitPlannerClient";

export default function VisitPlannerPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <VisitPlannerClient docs={docs} slugById={objectSlugById()} />;
}
