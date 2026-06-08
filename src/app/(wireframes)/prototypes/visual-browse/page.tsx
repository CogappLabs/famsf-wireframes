import { iiifImageUrl, primaryMedia } from "@/lib/collection-document";
import { loadSampleDocs } from "@/lib/sample-docs-registry";
import { ScopePage } from "@/providers/ScopeProvider";
import VisualBrowseClient, { type BrowseItem } from "./VisualBrowseClient";

// Server component: read real pipeline docs (fs-backed registry), keep
// only those with an image, project down to the lean shape the client
// grid needs. The visual browser is deliberately image-led, so docs
// without media are dropped rather than shown as grey boxes.
export default function VisualBrowsePage() {
	const items: BrowseItem[] = loadSampleDocs()
		.map((entry): BrowseItem | null => {
			const { doc, slug } = entry;
			const media = primaryMedia(doc);
			if (!media) return null;
			return {
				slug,
				title: doc.title ?? doc.accession_number,
				artist: doc.primary_artist_display ?? null,
				date: doc.display_date ?? doc.display_year ?? null,
				department: doc.department ?? null,
				imageUrl: iiifImageUrl(media.media_master_id, "!800,800"),
				aspect:
					media.pixel_w && media.pixel_h ? media.pixel_w / media.pixel_h : null,
			};
		})
		.filter((x): x is BrowseItem => x !== null);

	return (
		<ScopePage id="prototypes/visual-browse">
			<VisualBrowseClient items={items} />
		</ScopePage>
	);
}
