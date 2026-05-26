import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { ScopePage } from "@/providers/ScopeProvider";

const SHEET_URL =
	"https://docs.google.com/spreadsheets/d/1uFubduRY-BFzobfw3HgjHtMWh8QJYKAMQy1nJnpVzXY/edit?gid=0#gid=0";

export default function TransformationsPage() {
	return (
		<ScopePage id="transformations">
			<WireframeSection
				label="Source-to-wireframe transformations"
				className="py-8"
			>
				<Container size="md">
					<SectionLabel className="mb-6">
						Source → wireframe transformations
					</SectionLabel>
					<p className="text-body text-gray-700 leading-relaxed mb-4">
						What we change to the TMS data between the source database and the
						page you see. Four layers: the TMS tables themselves, the Dagster
						pipeline, the Elasticsearch index shape, and the wireframe render.
					</p>
					<p className="text-body text-gray-700 leading-relaxed mb-6">
						Kept as a working spreadsheet so curators, the ETL team, and the
						front-end can stay in sync as rules move between layers. Each row
						names the source state, the transformation, and where it lives.
					</p>
					<a
						href={SHEET_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 font-mono text-meta text-gray-800 shadow-sm hover:border-gray-400 hover:bg-gray-50"
					>
						Open the spreadsheet ↗
					</a>
				</Container>
			</WireframeSection>
		</ScopePage>
	);
}
