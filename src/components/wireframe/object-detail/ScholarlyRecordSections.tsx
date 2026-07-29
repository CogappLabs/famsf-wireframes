import {
	BibliographyText,
	Container,
	ProvenanceText,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import type {
	ExhibitionHistoryLine,
	ProvenanceStructured,
} from "@/lib/collection-document";

interface Props {
	/** Pre-formatted exhibition prose, one entry per line. The served index has
	 *  no structured venue/date/title fields, so these cannot be linked out to
	 *  an exhibition record or reformatted per the house style. */
	exhibitionLines: ExhibitionHistoryLine[];
	hasExhibitions: boolean;
	hasProvenance: boolean;
	provenanceStructured: ProvenanceStructured | null;
	provenanceRaw: string | null;
	bibliographyText: string | null;
}

/**
 * Exhibition history + provenance + bibliography — the three dense,
 * researcher-facing record blocks, stacked full-width. Only provenance splits
 * into two columns (lines left, footnotes right); exhibition history and
 * bibliography read as a single column.
 */
export function ScholarlyRecordSections({
	exhibitionLines,
	hasExhibitions,
	hasProvenance,
	provenanceStructured,
	provenanceRaw,
	bibliographyText,
}: Props) {
	if (!hasExhibitions && !(hasProvenance && provenanceRaw) && !bibliographyText)
		return null;

	const exhibitionsBlock = hasExhibitions ? (
		<div>
			<span id="exhibitions" className="sr-only">
				Exhibitions
			</span>
			<SectionLabel className="mb-4">Exhibition history</SectionLabel>
			<FieldSourceBadge field="exhibition_history_lines" block />
			<div className="flex flex-col gap-3">
				{exhibitionLines.map((line) => (
					<p
						key={line.order}
						className="border-l-2 border-gray-200 pl-3 font-mono text-meta leading-relaxed text-gray-700"
					>
						{line.text}
					</p>
				))}
			</div>
		</div>
	) : null;

	const provenanceBlock =
		hasProvenance && provenanceRaw ? (
			<div>
				<span id="provenance" className="sr-only">
					Provenance
				</span>
				<SectionLabel className="mb-4">Provenance</SectionLabel>
				<FieldSourceBadge field="provenance" block />
				<ProvenanceText
					structured={provenanceStructured}
					rawFallback={provenanceRaw}
				/>
			</div>
		) : null;

	const bibliographyBlock = bibliographyText ? (
		<div>
			<span id="bibliography" className="sr-only">
				Bibliography
			</span>
			<SectionLabel className="mb-4">Bibliography</SectionLabel>
			<FieldSourceBadge field="bibliography_text" block />
			<BibliographyText value={bibliographyText} />
		</div>
	) : null;

	// Order follows the June 18 2026 page-layouts spec: provenance →
	// exhibition history → bibliography.
	return (
		<>
			{provenanceBlock && (
				<WireframeSection
					label="Provenance"
					className="border-b border-gray-300 py-8"
				>
					<Container size="lg">{provenanceBlock}</Container>
				</WireframeSection>
			)}
			{exhibitionsBlock && (
				<WireframeSection
					label="Exhibitions"
					className="border-b border-gray-300 py-8"
				>
					<Container size="lg">{exhibitionsBlock}</Container>
				</WireframeSection>
			)}
			{bibliographyBlock && (
				<WireframeSection
					label="Bibliography"
					className="border-b border-gray-300 py-8"
				>
					<Container size="lg">{bibliographyBlock}</Container>
				</WireframeSection>
			)}
		</>
	);
}
