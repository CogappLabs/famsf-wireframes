/**
 * Scale diagram: object size relative to a 170cm human silhouette.
 * High value for sculpture and decorative arts.
 */

import {
	Container,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";

const HUMAN_CM = 170;
const FRAME_HEIGHT_PX = 220;

function parseDimensionsCm(input: string): { w: number; h: number } | null {
	// Capture the "cm" leg only; tolerate two- or three-axis values.
	const cmSegment = input.split(/\s*\(/)[0];
	const nums = cmSegment.match(/[\d.]+/g);
	if (!nums || nums.length < 2) return null;
	const [a, b, c] = nums.map(Number);
	if (nums.length >= 3) return { w: Math.max(a, c), h: b };
	return { w: a, h: b };
}

export function ScaleDiagram({ obj }: { obj: CollectionDocument }) {
	const dims = obj.dimensions ? parseDimensionsCm(obj.dimensions) : null;
	const maxCm = Math.max(HUMAN_CM, dims?.h ?? 0);
	const pxPerCm = FRAME_HEIGHT_PX / (maxCm * 1.1); // 10% headroom
	const humanH = HUMAN_CM * pxPerCm;
	const objH = dims ? dims.h * pxPerCm : FRAME_HEIGHT_PX * 0.6;
	const objW = dims ? Math.max(20, dims.w * pxPerCm) : FRAME_HEIGHT_PX * 0.4;
	const labelWidth = Math.max(objW, 120);

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
							{/* Stylised silhouette: head, neck, torso + arms, legs. */}
							<circle cx="20" cy="10" r="7" />
							<path d="M13 18 h14 v3 h-14 z" />
							<path d="M8 22 h24 v28 q0 4 -4 4 h-16 q-4 0 -4 -4 z" />
							<path d="M11 54 h7 v44 h-7 z" />
							<path d="M22 54 h7 v44 h-7 z" />
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
							className="text-center text-gray-700"
							style={{ width: labelWidth }}
						>
							{obj.dimensions}
						</span>
					</div>
				</Container>
			</WireframeSection>
		</ScopeMark>
	);
}
