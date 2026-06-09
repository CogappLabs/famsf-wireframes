import {
	Container,
	ImagePlaceholder,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import type { ChildCard } from "@/lib/collection-document";

const CHILD_CARD_LIMIT = 12;

/**
 * Object-detail child-records section (CW-32, parent-child inline): a thumbnail
 * grid when child_cards are populated, otherwise a flat accession-ID fallback
 * split into physical / virtual children. Renders nothing without child ids.
 */
export function ChildRecordsSection({
	childCards,
	physicalChildIds,
	virtualChildIds,
}: {
	childCards: ChildCard[];
	physicalChildIds: number[];
	virtualChildIds: number[];
}) {
	const hasChildIds = physicalChildIds.length > 0 || virtualChildIds.length > 0;
	if (!hasChildIds) return null;

	const hasChildCards = childCards.length > 0;
	const visibleChildCards = childCards.slice(0, CHILD_CARD_LIMIT);
	const hiddenChildCardCount = childCards.length - visibleChildCards.length;

	return (
		<WireframeSection
			label="Child records"
			className="border-b border-gray-300 py-8"
		>
			<Container>
				<SectionLabel className="mb-4">
					Child records (
					{childCards.length > 0
						? childCards.length
						: physicalChildIds.length + virtualChildIds.length}
					)
				</SectionLabel>
				<FieldSourceBadge field="child_cards" block />

				{hasChildCards ? (
					<>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{visibleChildCards.map((card) => (
								<div
									key={card.id}
									className="border border-gray-200 hover:border-gray-400"
								>
									<ImagePlaceholder
										aspect="1/1"
										label={
											card.iiif_thumbnail_url
												? "[IIIF thumb]"
												: card.has_iiif
													? "[IIIF available]"
													: "[No image]"
										}
									/>
									<div className="px-2.5 py-2">
										<p className="font-mono text-label tracking-wide text-gray-400">
											{card.accession_number}
										</p>
										{card.title && (
											<p className="mt-0.5 font-mono text-meta text-gray-700 leading-snug">
												{card.title}
											</p>
										)}
										{(card.primary_artist_display || card.display_date) && (
											<p className="mt-0.5 font-mono text-label text-gray-400">
												{[card.primary_artist_display, card.display_date]
													.filter(Boolean)
													.join(" · ")}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
						{hiddenChildCardCount > 0 && (
							<p className="mt-4 font-mono text-meta text-gray-500">
								+ {hiddenChildCardCount} more
							</p>
						)}
					</>
				) : (
					<>
						{physicalChildIds.length > 0 && (
							<div className="mb-4">
								<TombstoneLabel className="mb-2 block">
									Physical children ({physicalChildIds.length})
								</TombstoneLabel>
								<p className="font-mono text-meta text-gray-700">
									{physicalChildIds.slice(0, 10).join(", ")}
									{physicalChildIds.length > 10 && (
										<span className="text-gray-400">
											{" "}
											and {physicalChildIds.length - 10} more
										</span>
									)}
								</p>
							</div>
						)}
						{virtualChildIds.length > 0 && (
							<div>
								<TombstoneLabel className="mb-2 block">
									Virtual children ({virtualChildIds.length})
								</TombstoneLabel>
								<p className="font-mono text-meta text-gray-700">
									{virtualChildIds.slice(0, 10).join(", ")}
									{virtualChildIds.length > 10 && (
										<span className="text-gray-400">
											{" "}
											and {virtualChildIds.length - 10} more
										</span>
									)}
								</p>
							</div>
						)}
					</>
				)}
			</Container>
		</WireframeSection>
	);
}
