import {
	Container,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";

const CHILD_ID_LIMIT = 10;

/**
 * Object-detail child-records section (CW-32, parent-child inline). Renders
 * nothing without child ids. Virtual (Runway collection) children are omitted
 * per the FAMSF field-exclusion list.
 *
 * The served index carries only the bare child ObjectID array, so the intended
 * thumbnail grid (title, artist, date, thumb per child) cannot be built. The
 * pipeline would need to denormalise those child fields onto the parent.
 */
export function ChildRecordsSection({
	physicalChildIds,
}: {
	physicalChildIds: number[];
}) {
	if (physicalChildIds.length === 0) return null;

	const visibleIds = physicalChildIds.slice(0, CHILD_ID_LIMIT);
	const hiddenCount = physicalChildIds.length - visibleIds.length;

	return (
		<WireframeSection
			label="Child records"
			className="border-b border-gray-300 py-8"
		>
			<Container>
				<SectionLabel className="mb-4">
					Child records ({physicalChildIds.length})
				</SectionLabel>
				<FieldSourceBadge field="physical_child_ids" block />

				<TombstoneLabel className="mb-2 block">
					Physical children ({physicalChildIds.length})
				</TombstoneLabel>
				<p className="font-mono text-meta text-gray-700">
					{visibleIds.join(", ")}
					{hiddenCount > 0 && (
						<span className="text-gray-400"> and {hiddenCount} more</span>
					)}
				</p>
			</Container>
		</WireframeSection>
	);
}
