/**
 * Scale diagram: object size relative to a 170cm human silhouette.
 *
 * Reads parsed dimensions from ``dimensions_structured[].measures`` (set
 * by the pipeline's ``parse_dimensions`` util). Prefers the "Overall"
 * row, then any displayed row, then the first row. Falls back to nothing
 * if no row has a numeric height.
 */

import {
	Container,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type {
	CollectionDocument,
	DimensionEntry,
} from "@/lib/collection-document";
import { t } from "@/lib/strings";

const HUMAN_CM = 170;
const BANANA_CM = 18;
const FRAME_HEIGHT_PX = 220;

function pickPrimaryDimension(
	rows: DimensionEntry[],
): DimensionEntry | undefined {
	const visible = rows.filter((r) => r.Displayed);
	const pool = visible.length > 0 ? visible : rows;
	return (
		pool.find((r) => r.ElementName === "Overall") ??
		pool.find((r) => r.measures?.height_cm != null) ??
		pool[0]
	);
}

export function ScaleDiagram({ obj }: { obj: CollectionDocument }) {
	const primary = pickPrimaryDimension(obj.dimensions_structured ?? []);
	const heightCm = primary?.measures?.height_cm ?? null;
	const widthCm = primary?.measures?.width_cm ?? null;

	if (heightCm == null) return null;

	const maxCm = Math.max(HUMAN_CM, heightCm);
	const pxPerCm = FRAME_HEIGHT_PX / (maxCm * 1.1);
	const humanH = HUMAN_CM * pxPerCm;
	const bananaW = BANANA_CM * pxPerCm;
	const bananaH = bananaW * 0.55; // crescent silhouette taller than thickness alone
	const objH = heightCm * pxPerCm;
	const objW = widthCm != null ? Math.max(20, widthCm * pxPerCm) : objH * 0.6;
	const labelWidth = Math.max(objW, 120);
	const objLabel = primary?.DisplayDimensions ?? `${heightCm} cm`;

	return (
		<ScopeMark label="Scale diagram">
			<WireframeSection
				label="Scale diagram"
				className="border-t border-gray-300 py-8"
			>
				<Container size="md">
					<SectionLabel className="mb-4">
						{t("object.scaleHeading")}
					</SectionLabel>

					<div
						className="flex items-end justify-center gap-16 border-b border-gray-300"
						style={{ height: FRAME_HEIGHT_PX }}
					>
						<svg
							viewBox="0 0 40 100"
							preserveAspectRatio="xMidYMax meet"
							style={{ height: humanH }}
							className="w-auto fill-gray-300"
							aria-hidden
						>
							<title>Human silhouette for scale</title>
							<circle cx="20" cy="10" r="7" />
							<path d="M13 18 h14 v3 h-14 z" />
							<path d="M8 22 h24 v28 q0 4 -4 4 h-16 q-4 0 -4 -4 z" />
							<path d="M11 54 h7 v44 h-7 z" />
							<path d="M22 54 h7 v44 h-7 z" />
						</svg>
						<svg
							viewBox="0 0 100 55"
							preserveAspectRatio="xMidYMax meet"
							style={{ width: bananaW, height: bananaH }}
							aria-hidden
						>
							<title>Banana for scale</title>
							{/* Banana body: thicker crescent arcing up */}
							<path
								d="M10 42 Q 18 16, 50 12 Q 80 10, 92 22 Q 96 28, 92 32 Q 80 26, 56 30 Q 28 34, 20 48 Q 12 50, 10 42 Z"
								className="fill-yellow-300 stroke-yellow-600"
								strokeWidth="1.5"
							/>
							{/* Stem on left tip */}
							<path
								d="M10 42 q -4 -4 -5 -10 q 3 0 6 4 z"
								className="fill-yellow-700"
							/>
							{/* Brown tip on right */}
							<circle cx="93" cy="23" r="2.2" className="fill-yellow-800" />
						</svg>
						<div
							className="border border-gray-700"
							style={{ width: objW, height: objH }}
							aria-hidden
						/>
					</div>

					<div className="mt-2 flex justify-center gap-16 font-mono text-label">
						<span
							className="text-center text-gray-500"
							style={{ width: humanH * 0.4 }}
						>
							170 cm
						</span>
						<span
							className="text-center text-gray-500"
							style={{ width: bananaW }}
						>
							18 cm
						</span>
						<span
							className="text-center text-gray-700"
							style={{ width: labelWidth }}
						>
							{objLabel}
						</span>
					</div>
					{primary?.ElementName && (
						<p className="mt-1 text-center font-mono text-label text-gray-400">
							{primary.ElementName}
						</p>
					)}
				</Container>
			</WireframeSection>
		</ScopeMark>
	);
}
