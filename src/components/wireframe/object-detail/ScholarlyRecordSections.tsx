import {
	BibliographyText,
	Container,
	ExhibitionRow,
	ProvenanceText,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import type {
	ExhibitionEntry,
	ProvenanceStructured,
} from "@/lib/collection-document";

interface Props {
	exhibitions: ExhibitionEntry[];
	hasExhibitions: boolean;
	/** Pre-sanitised HTML (sanitised server-side in the page). */
	exhibitionHistoryHtml: string | null;
	hasProvenance: boolean;
	provenanceStructured: ProvenanceStructured | null;
	provenanceRaw: string | null;
	bibliographyText: string | null;
}

/**
 * Exhibition history + provenance + bibliography — the three dense,
 * researcher-facing record blocks. Curatorial Fellows asked for a two-column
 * layout to reduce scrolling (stakeholder synthesis), now the standard layout:
 * the three full-width sections stay stacked but each block's entries flow
 * across two CSS columns (so a long provenance / bibliography list halves its
 * vertical run).
 */
export function ScholarlyRecordSections({
	exhibitions,
	hasExhibitions,
	exhibitionHistoryHtml,
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
			<FieldSourceBadge field="exhibitions" block />
			{/* CSS multi-column flows the rows by height; each row
			    breaks-inside-avoid so it never splits across the boundary. */}
			<div className="columns-2 gap-x-10 [&>*]:mb-3 [&>*]:break-inside-avoid">
				{exhibitions.map((e) => (
					<ExhibitionRow
						key={e.ExhibitionID}
						title={e.ExhTitle}
						date={e.DisplayDate ?? undefined}
						venue={e.VenueName ?? undefined}
						href={`/exhibition-detail?id=${e.ExhibitionID}`}
					/>
				))}
			</div>
			{exhibitionHistoryHtml && (
				<ScopeMark label="Exhibition history text">
					<details className="mt-4 border-t border-gray-200 pt-4 group">
						<summary className="cursor-pointer list-none font-mono text-label tracking-[0.08em] text-gray-500 hover:text-gray-700">
							<span className="mr-1 inline-block transition-transform group-open:rotate-90">
								▸
							</span>
							Full exhibition history (raw curator text)
							<FieldSourceBadge field="exhibition_history_text" />
						</summary>
						<p
							className="mt-3 whitespace-pre-line font-mono text-meta text-gray-600 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised server-side via allow-list
							dangerouslySetInnerHTML={{ __html: exhibitionHistoryHtml }}
						/>
					</details>
				</ScopeMark>
			)}
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
					columns
				/>
				{/* Raw curator text, collapsed: only when a structured payload is
				    already shown above (else ProvenanceText's raw fallback is the
				    raw text and this would duplicate it). */}
				{provenanceStructured && (
					<ScopeMark label="Provenance text">
						<details className="group mt-4 border-t border-gray-200 pt-4">
							<summary className="cursor-pointer list-none font-mono text-label tracking-[0.08em] text-gray-500 hover:text-gray-700">
								<span className="mr-1 inline-block transition-transform group-open:rotate-90">
									▸
								</span>
								Full provenance (raw curator text)
								<FieldSourceBadge field="provenance" />
							</summary>
							<p className="mt-3 whitespace-pre-line font-mono text-meta text-gray-600">
								{provenanceRaw}
							</p>
						</details>
					</ScopeMark>
				)}
			</div>
		) : null;

	const bibliographyBlock = bibliographyText ? (
		<div>
			<span id="bibliography" className="sr-only">
				Bibliography
			</span>
			<SectionLabel className="mb-4">Bibliography</SectionLabel>
			<FieldSourceBadge field="bibliography_text" block />
			<BibliographyText value={bibliographyText} columns />
			{/* Raw curator text, collapsed: BibliographyText reformats the raw
			    string into a numbered list, so expose the unprocessed source for
			    verification (mirrors exhibition history). */}
			<ScopeMark label="Bibliography text">
				<details className="group mt-4 border-t border-gray-200 pt-4">
					<summary className="cursor-pointer list-none font-mono text-label tracking-[0.08em] text-gray-500 hover:text-gray-700">
						<span className="mr-1 inline-block transition-transform group-open:rotate-90">
							▸
						</span>
						Full bibliography (raw curator text)
						<FieldSourceBadge field="bibliography_text" />
					</summary>
					<p className="mt-3 whitespace-pre-line font-mono text-meta text-gray-600">
						{bibliographyText}
					</p>
				</details>
			</ScopeMark>
		</div>
	) : null;

	// Each block's entries flow across two columns inside the section (handled
	// in the blocks above). A wide container gives the columns room to breathe.
	return (
		<>
			{exhibitionsBlock && (
				<WireframeSection
					label="Exhibitions"
					className="border-b border-gray-300 py-8"
				>
					<Container size="lg">{exhibitionsBlock}</Container>
				</WireframeSection>
			)}
			{provenanceBlock && (
				<WireframeSection
					label="Provenance"
					className="border-b border-gray-300 py-8"
				>
					<Container size="lg">{provenanceBlock}</Container>
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
