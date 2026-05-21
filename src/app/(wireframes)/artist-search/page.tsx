import {
	constituentSlugByName,
	loadConstituentSamples,
} from "@/lib/constituent-samples-registry";
import ArtistSearchClient from "./ArtistSearchClient";

export default function ArtistSearchPage() {
	const entries = loadConstituentSamples();
	const constituents = entries.map((e) => e.doc);
	return (
		<ArtistSearchClient
			constituents={constituents}
			slugByName={constituentSlugByName()}
		/>
	);
}
