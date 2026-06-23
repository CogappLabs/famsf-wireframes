import { notFound } from "next/navigation";
import { t } from "@/lib/strings";
import {
	AREA_BY_SLUG,
	type AreaData,
	AreaPageLayout,
	type Featured,
	featuredSlug,
	slugify,
} from "../page";

// Featured-collection child page. A sub-collection within a collection area
// (e.g. "The Rodin Collection" under European Decorative Arts) rendered with
// the *same* template as the parent area page (AreaPageLayout), just with the
// nested featured grid suppressed. Copy is wireframe-grade placeholder,
// synthesised from the parent Featured entry — there is no separate data store.

/** Build an AreaData for a featured sub-collection from its parent. Highlights,
 *  history, and media reuse the parent area's content (a real implementation
 *  would scope these to the sub-collection); intro is generated from the
 *  Featured blurb so each page reads as its own collection. */
function buildFeaturedArea(parent: AreaData, featured: Featured): AreaData {
	return {
		name: featured.name,
		museums: parent.museums,
		intro: [
			`${featured.desc} ${featured.count} within the museums' ${parent.name} holdings.`,
			"This is a featured sub-collection: a curated grouping within the wider collection area, with its own highlights, history, and resources. Copy here is placeholder for the wireframe.",
		],
		history: parent.history,
		highlights: parent.highlights,
		// A featured page has no nested featured grid, so this is unused.
		featured: [],
		media: parent.media,
		resources: parent.resources,
	};
}

/** Every (area slug, featured slug) pair, for static generation. */
export function generateStaticParams() {
	return Object.entries(AREA_BY_SLUG).flatMap(([slug, area]) =>
		area.featured.map((f) => ({ slug, featured: featuredSlug(f.name) })),
	);
}

type Props = { params: Promise<{ slug: string; featured: string }> };

export default async function FeaturedCollectionPage({ params }: Props) {
	const { slug, featured } = await params;
	const parent = AREA_BY_SLUG[slug];
	if (!parent) notFound();

	const entry = parent.featured.find((f) => slugify(f.name) === featured);
	if (!entry) notFound();

	const area = buildFeaturedArea(parent, entry);

	return (
		<AreaPageLayout
			area={area}
			backHref={`/collection-area/${slug}`}
			backLabel={`${t("area.backTo")} ${parent.name}`}
			showFeatured={false}
		/>
	);
}
