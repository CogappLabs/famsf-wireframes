import { loadSampleDocs, objectSlugById } from "@/lib/sample-docs-registry";
import MyFindsClient from "./MyFindsClient";

export default function MyFindsPage() {
	const entries = loadSampleDocs();
	const seen = new Set<number>();
	const docs = entries
		.map((e) => e.doc)
		.filter((d) => {
			if (seen.has(d.id)) return false;
			seen.add(d.id);
			return true;
		});
	return <MyFindsClient docs={docs} slugById={objectSlugById()} />;
}
