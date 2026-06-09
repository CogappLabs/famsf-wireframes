"use client";

import { Suspense } from "react";
import {
	BibliographyText,
	Container,
	ExhibitionRow,
	ProvenanceText,
	ScopeMark,
	SectionLabel,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import type {
	ExhibitionEntry,
	ProvenanceStructured,
} from "@/lib/collection-document";

const LAYOUT_VARIATIONS = [
	{ key: "standard", label: "Standard" },
	{ key: "two-column", label: "Two-column" },
] as const;

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
 * layout to reduce scrolling (stakeholder synthesis). The `two-column`
 * variation keeps the three full-width sections stacked but flows each block's
 * entries across two CSS columns (so a long provenance / bibliography list
 * halves its vertical run). `standard` keeps each block single-column.
 *
 * Client component so it can register the layout toggle in the top bar via
 * `usePageVariations` and be linked with a shareable `?variation=` URL.
 *
 * `usePageVariations` reads `useSearchParams`, which forces a client-side
 * bailout under static export, so the inner body is wrapped in `<Suspense>`
 * (mirrors `SearchResultsClient`).
 */
function ScholarlyRecordSectionsInner({
	exhibitions,
	hasExhibitions,
	exhibitionHistoryHtml,
	hasProvenance,
	provenanceStructured,
	provenanceRaw,
	bibliographyText,
}: Props) {
	const layout = usePageVariations(LAYOUT_VARIATIONS);
	const twoCol = layout === "two-column";

	if (!hasExhibitions && !(hasProvenance && provenanceRaw) && !bibliographyText)
		return null;

	const exhibitionsBlock = hasExhibitions ? (
		<div>
			<span id="exhibitions" className="sr-only">
				Exhibitions
			</span>
			<SectionLabel className="mb-4">Exhibition history</SectionLabel>
			<FieldSourceBadge field="exhibitions" block />
			{/* two-col: CSS multi-column flows the rows by height; each row
			    breaks-inside-avoid so it never splits across the boundary. */}
			<div
				className={
					twoCol
						? "columns-2 gap-x-10 [&>*]:mb-3 [&>*]:break-inside-avoid"
						: "flex flex-col gap-3"
				}
			>
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
					columns={twoCol}
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
			<BibliographyText value={bibliographyText} columns={twoCol} />
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

	// Both layouts stack the three full-width sections. `two-column` flows each
	// block's entries across two columns inside the section (handled in the
	// blocks above); `standard` keeps them single-column. A wider container in
	// two-col mode gives the columns room to breathe.
	const containerSize = twoCol ? "lg" : "md";

	return (
		<>
			{exhibitionsBlock && (
				<WireframeSection
					label="Exhibitions"
					className="border-b border-gray-300 py-8"
				>
					<Container size={containerSize}>{exhibitionsBlock}</Container>
				</WireframeSection>
			)}
			{provenanceBlock && (
				<WireframeSection
					label="Provenance"
					className="border-b border-gray-300 py-8"
				>
					<Container size={containerSize}>{provenanceBlock}</Container>
				</WireframeSection>
			)}
			{bibliographyBlock && (
				<WireframeSection
					label="Bibliography"
					className="border-b border-gray-300 py-8"
				>
					<Container size={containerSize}>{bibliographyBlock}</Container>
				</WireframeSection>
			)}
		</>
	);
}

export function ScholarlyRecordSections(props: Props) {
	return (
		<Suspense>
			<ScholarlyRecordSectionsInner {...props} />
		</Suspense>
	);
}
