import Link from "next/link";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { loadSampleDocs } from "@/lib/sample-docs-registry";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import { slugify } from "../collection-area/[slug]/page";

interface CollectionAreaEntry {
	name: string;
	objectCount: number;
}

// "Collection area" is FAMSF's public-facing name for a curatorial department:
// the `department` field on each document IS the collection area (CW-30 treats
// them as one). This landing lists them with object counts; each card links to
// the collection-area detail page.
export default function CollectionAreasIndexPage() {
	const entries = loadSampleDocs();
	const map = new Map<string, CollectionAreaEntry>();

	for (const e of entries) {
		const dept = e.doc.department;
		if (!dept) continue;
		if (!map.has(dept)) {
			map.set(dept, { name: dept, objectCount: 0 });
		}
		const entry = map.get(dept);
		if (entry) entry.objectCount += 1;
	}

	const areas = Array.from(map.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);

	return (
		<ScopePage id="collection-areas">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: "Collection areas" },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>Collection areas</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							Explore by collection area
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							The collection spans more than 5,000 years across the de Young and
							the Legion of Honor. It is organised into curatorial areas, from
							the Achenbach Foundation for Graphic Arts to Ancient Art. Pick an
							area to explore its scope, highlights, and on-view works.
						</p>
					</Container>
				</WireframeSection>

				<WireframeSection label="Listing" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{areas.length} {areas.length === 1 ? "area" : "areas"}
						</SectionLabel>
						{areas.length === 0 ? (
							<p className="font-mono text-body text-gray-500">
								No collection areas in sample data.
							</p>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{areas.map((a) => (
									<Link
										key={a.name}
										href={`/collection-area/${slugify(a.name)}`}
										className="flex flex-col border border-gray-300 transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder aspect="1/1" label={`[${a.name}]`} />
										<div className="flex flex-1 flex-col p-4">
											<h3 className="font-mono text-card font-medium leading-snug">
												{a.name}
											</h3>
											<p className="mt-auto pt-2 font-mono text-meta text-gray-500">
												{a.objectCount}{" "}
												{a.objectCount === 1 ? "object" : "objects"} in sample
											</p>
										</div>
									</Link>
								))}
							</div>
						)}
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
