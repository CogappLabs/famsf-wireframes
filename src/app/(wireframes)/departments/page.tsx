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

interface DepartmentEntry {
	name: string;
	objectCount: number;
}

export default function DepartmentsIndexPage() {
	const entries = loadSampleDocs();
	const map = new Map<string, DepartmentEntry>();

	for (const e of entries) {
		const dept = e.doc.department;
		if (!dept) continue;
		if (!map.has(dept)) {
			map.set(dept, { name: dept, objectCount: 0 });
		}
		const entry = map.get(dept);
		if (entry) entry.objectCount += 1;
	}

	const departments = Array.from(map.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);

	return (
		<ScopePage id="departments">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: "Departments" },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>Departments</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							Curatorial departments
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							The collection is organised into curatorial departments. Pick one
							to explore its scope, highlights, and staff.
						</p>
					</Container>
				</WireframeSection>

				<WireframeSection label="Listing" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{departments.length}{" "}
							{departments.length === 1 ? "department" : "departments"}
						</SectionLabel>
						{departments.length === 0 ? (
							<p className="font-mono text-body text-gray-500">
								No departments in sample data.
							</p>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{departments.map((d) => (
									<Link
										key={d.name}
										href={`/collection-area?name=${encodeURIComponent(d.name)}`}
										className="flex flex-col border border-gray-300 transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder aspect="1/1" label={`[${d.name}]`} />
										<div className="flex flex-1 flex-col p-4">
											<h3 className="font-mono text-card font-medium leading-snug">
												{d.name}
											</h3>
											<p className="mt-auto pt-2 font-mono text-meta text-gray-500">
												{d.objectCount}{" "}
												{d.objectCount === 1 ? "object" : "objects"} in sample
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
