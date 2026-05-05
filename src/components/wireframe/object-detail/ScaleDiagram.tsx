/**
 * Scale diagram — object size relative to a 170cm human silhouette.
 * High value for sculpture and decorative arts.
 */

import {
	Container,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { SampleObject } from "@/lib/sample-data";
import { t } from "@/lib/strings";

export function ScaleDiagram({ obj }: { obj: SampleObject }) {
	return (
		<ScopeMark label="Scale diagram">
			<WireframeSection
				label="Scale diagram"
				className="border-t border-gray-300 py-8"
			>
				<Container size="md">
					<SectionLabel className="mb-2">
						{t("object.scaleHeading")}
					</SectionLabel>
					<p className="mb-4 font-mono text-label text-gray-500">
						{t("object.scaleHint")}
					</p>
					<div className="flex h-48 items-end justify-center gap-8 border border-dashed border-gray-300 bg-gray-50 p-4">
						<div className="flex flex-col items-center">
							<div className="h-44 w-12 border-2 border-gray-700 bg-gray-200" />
							<span className="mt-1 font-mono text-label text-gray-500">
								170 cm human
							</span>
						</div>
						<div className="flex flex-col items-center">
							<div className="h-32 w-20 border-2 border-amber-700 bg-amber-100" />
							<span className="mt-1 font-mono text-label text-gray-500">
								{obj.dimensions}
							</span>
						</div>
					</div>
					<p className="mt-2 font-mono text-label text-gray-400">
						{t("object.scaleDiagramPlaceholder")}
					</p>
				</Container>
			</WireframeSection>
		</ScopeMark>
	);
}
