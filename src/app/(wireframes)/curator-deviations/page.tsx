import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { ScopePage } from "@/providers/ScopeProvider";

const SHEET_URL =
	"https://docs.google.com/spreadsheets/d/1I97lEsZ4sVdZi8EsyucZXl7gFTQzZMOncBN_oSAO9jo/edit?gid=0#gid=0";

export default function CuratorDeviationsPage() {
	return (
		<ScopePage id="curator-deviations">
			<WireframeSection label="Curator rule deviations" className="py-8">
				<Container size="md">
					<SectionLabel className="mb-6">Curator rule deviations</SectionLabel>
					<p className="text-body text-gray-700 leading-relaxed mb-4">
						Places where the data in TMS doesn't match the FAMSF Object
						Cataloguing Guidelines. Sampled from the live extract (~150K
						objects, May 2026).
					</p>
					<p className="text-body text-gray-700 leading-relaxed mb-6">
						Kept as a working spreadsheet so curators and the ETL team can edit
						it together. Each row records the rule, what curators ship instead,
						the scale of the gap, and whether the pipeline or the wireframe
						compensates.
					</p>
					<a
						href={SHEET_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 font-mono text-meta text-gray-500 shadow-sm hover:border-gray-400 hover:bg-gray-50"
					>
						Open the spreadsheet ↗
					</a>
				</Container>
			</WireframeSection>
		</ScopePage>
	);
}
