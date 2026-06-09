import {
	CitationBlock,
	Container,
	ScopeMark,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import { t } from "@/lib/strings";

export interface RightsStatementDisplay {
	label: string;
	uri: string | null;
}

/**
 * Object-detail rights + citation block (CW-52): rights statement with a
 * clickable rightsstatements.org link, copyright line, and a copy-to-clipboard
 * suggested citation. Sits right after Bibliography in the page flow.
 */
export function RightsCitationSection({
	rightsStatementDisplay,
	isPublicDomain,
	copyrightStatement,
	suggestedCitation,
}: {
	rightsStatementDisplay: RightsStatementDisplay | null;
	isPublicDomain: boolean;
	copyrightStatement: string;
	suggestedCitation: string;
}) {
	return (
		<WireframeSection
			label="Rights & citation"
			className="border-b border-gray-300 py-8"
		>
			<Container size="md">
				<span id="rights-citation" className="sr-only">
					Rights & citation
				</span>
				<SectionLabel className="mb-4">
					{t("object.sectionRightsCitation")}
				</SectionLabel>
				{rightsStatementDisplay && (
					<ScopeMark label="Rights statement">
						<div className="mb-6">
							<TombstoneLabel className="mb-1 block">
								Rights statement
							</TombstoneLabel>
							<FieldSourceBadge field="term_rights_statement" block />
							{rightsStatementDisplay.uri ? (
								<a
									href={rightsStatementDisplay.uri}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-meta text-blue-700 underline decoration-blue-300 hover:decoration-blue-600"
								>
									{rightsStatementDisplay.label}
								</a>
							) : (
								<p className="font-mono text-meta text-gray-700">
									{rightsStatementDisplay.label}
								</p>
							)}
							{!isPublicDomain && (
								<span
									title="In copyright [placeholder]"
									className="mt-1 ml-2 inline-block cursor-not-allowed font-mono text-label text-gray-400 underline decoration-gray-300"
								>
									More about reuse and image rights [placeholder]
								</span>
							)}
						</div>
					</ScopeMark>
				)}
				<ScopeMark label="Copyright">
					<div className="mb-6">
						<TombstoneLabel className="mb-1 block">Copyright</TombstoneLabel>
						<FieldSourceBadge field="copyright" block />
						<p className="font-mono text-meta text-gray-700">
							{copyrightStatement}
						</p>
					</div>
				</ScopeMark>
				<ScopeMark label="Suggested citation">
					<div>
						<TombstoneLabel className="mb-1 block">
							Suggested citation [placeholder]
						</TombstoneLabel>
						<p className="mb-3 font-mono text-meta text-gray-500">
							If you want to cite this object in research or publication, please
							use the credit below. The accession number stays stable even if
							the title or dating is revised.
						</p>
						<CitationBlock citation={suggestedCitation} />
					</div>
				</ScopeMark>
			</Container>
		</WireframeSection>
	);
}
