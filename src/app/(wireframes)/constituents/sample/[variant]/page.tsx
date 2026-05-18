import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import {
	findConstituentBySlug,
	loadConstituentSamples,
} from "@/lib/constituent-samples-registry";
import { ScopePage } from "@/providers/ScopeProvider";

export function generateStaticParams() {
	return loadConstituentSamples().map((e) => ({ variant: e.slug }));
}

// ── Page ──────────────────────────────────────────────────────────────

type Props = { params: Promise<{ variant: string }> };

export default async function SampleConstituentPage({ params }: Props) {
	const { variant } = await params;
	const entry = findConstituentBySlug(variant);
	if (!entry) notFound();
	const doc = entry.doc;

	const sampleObjects = doc.sample_objects ?? [];
	const displayBios = doc.display_bios ?? [];
	const facets = doc.facets ?? null;

	// Deduplicate bios — only show distinct bio text entries.
	const distinctBios = displayBios.filter(
		(b, i, arr) => arr.findIndex((x) => x.bio === b.bio) === i,
	);

	return (
		<ScopePage id="constituents/sample">
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{ label: "Sample Constituents", href: "/constituents/sample" },
							{ label: variant.charAt(0).toUpperCase() + variant.slice(1) },
						]}
					/>
				</Container>

				{/* Tombstone */}
				<Container className="border-b border-gray-300 py-8">
					<WireframeSection label="Tombstone">
						<h1 className="font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{doc.name}
						</h1>
						<FieldSourceBadge field="constituent_name" block />

						{doc.display_date && (
							<p className="mt-1 font-mono text-body text-gray-600">
								{doc.display_date}
								<FieldSourceBadge field="constituent_display_date" />
							</p>
						)}

						{doc.nationality && (
							<p className="mt-0.5 font-mono text-meta text-gray-500">
								{doc.nationality}
								<FieldSourceBadge field="constituent_nationality" />
							</p>
						)}

						{doc.alpha_sort && (
							<p className="mt-2 font-mono text-label text-gray-400">
								Sort key: {doc.alpha_sort}
								<FieldSourceBadge field="constituent_alpha_sort" />
							</p>
						)}

						<div className="mt-6 flex flex-wrap gap-3">
							<span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label text-gray-600">
								{doc.object_count} object{doc.object_count === 1 ? "" : "s"} in
								collection
								<FieldSourceBadge field="constituent_object_count" />
							</span>
						</div>

						{/* Dates */}
						{(doc.begin_date_iso || doc.end_date_iso) && (
							<div className="mt-6 flex gap-8 border-t border-gray-100 pt-4">
								{doc.begin_date_iso && (
									<div>
										<TombstoneLabel>Born</TombstoneLabel>
										<FieldSourceBadge field="constituent_begin_date_iso" />
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											{doc.begin_date_iso}
										</p>
									</div>
								)}
								{doc.end_date_iso && (
									<div>
										<TombstoneLabel>Died</TombstoneLabel>
										<FieldSourceBadge field="constituent_end_date_iso" />
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											{doc.end_date_iso}
										</p>
									</div>
								)}
							</div>
						)}

						{/* Institution */}
						{doc.institution && (
							<div className="mt-4">
								<TombstoneLabel>Institution</TombstoneLabel>
								<FieldSourceBadge field="constituent_institution" block />
								<p className="mt-0.5 font-mono text-meta text-gray-700">
									{doc.institution}
								</p>
							</div>
						)}
					</WireframeSection>
				</Container>

				{/* Biography */}
				{(doc.biography || distinctBios.length > 0) && (
					<WireframeSection
						label="Biography"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">Biography</SectionLabel>

							{/* Single bio prose block */}
							{doc.biography && distinctBios.length <= 1 && (
								<div>
									<FieldSourceBadge field="constituent_biography" block />
									<p className="font-mono text-body leading-relaxed text-gray-600">
										{doc.biography}
									</p>
								</div>
							)}

							{/* Multiple distinct bios as list */}
							{distinctBios.length > 1 && (
								<div>
									<FieldSourceBadge field="constituent_display_bios" block />
									<div className="flex flex-col gap-4">
										{distinctBios.map((b) => (
											<div
												key={b.display_order}
												className="border-l-2 border-gray-200 pl-3"
											>
												<TombstoneLabel className="mb-1 block">
													Bio entry {b.display_order}
												</TombstoneLabel>
												<p className="font-mono text-body leading-relaxed text-gray-600">
													{b.bio}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Facets — aggregated across this constituent's works */}
				{facets && (
					<WireframeSection
						label="Facets"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<SectionLabel className="mb-4">
								Collection breakdown ({facets.total_works} work
								{facets.total_works === 1 ? "" : "s"})
							</SectionLabel>

							{/* Summary chips */}
							<div className="mb-6 flex flex-wrap gap-3 font-mono text-label">
								{facets.date_range && (
									<span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
										{facets.date_range.earliest_year}–
										{facets.date_range.latest_year}
									</span>
								)}
								<span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
									{facets.on_view_count} on view
								</span>
								<span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
									{facets.has_iiif_count} with IIIF
								</span>
								<span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
									{facets.exhibited_count} exhibited
								</span>
							</div>

							{/* Facet column grid */}
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<FacetList
									title="Classifications"
									rows={facets.classifications}
								/>
								<FacetList title="Departments" rows={facets.departments} />
								<FacetList
									title="Top places of creation"
									rows={facets.top_places_of_creation}
								/>
								<FacetList title="Top subjects" rows={facets.top_subjects} />
								<FacetList title="Top materials" rows={facets.top_materials} />
								<FacetList title="Top styles" rows={facets.top_styles} />
								<FacetList title="Top movements" rows={facets.top_movements} />
							</div>

							{facets.decade_histogram.length > 0 && (
								<DecadeHistogram rows={facets.decade_histogram} />
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Sample objects */}
				{sampleObjects.length > 0 && (
					<WireframeSection
						label="Sample objects"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<SectionLabel className="mb-4">
								Works in collection ({doc.object_count} total
								{sampleObjects.length < doc.object_count &&
									`, ${sampleObjects.length} shown`}
								){" "}
								<Link
									href={`/search-results?constituent=${doc.id}`}
									className="ml-2 font-mono text-label normal-case underline decoration-gray-300 hover:decoration-gray-600"
								>
									view all →
								</Link>
							</SectionLabel>
							<FieldSourceBadge field="constituent_sample_objects" block />
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{sampleObjects.map((obj) => (
									<div
										key={obj.id}
										className="border border-gray-200 hover:border-gray-400"
									>
										<ImagePlaceholder
											aspect="1/1"
											label={obj.has_iiif ? "[IIIF available]" : "[No image]"}
										/>
										<div className="px-2.5 py-2">
											<p className="font-mono text-label uppercase tracking-wide text-gray-400">
												{obj.accession_number}
											</p>
											{obj.title && (
												<p className="mt-0.5 font-mono text-meta text-gray-700 leading-snug">
													{obj.title}
												</p>
											)}
											{(obj.primary_artist_display || obj.display_date) && (
												<p className="mt-0.5 font-mono text-label text-gray-400">
													{[obj.primary_artist_display, obj.display_date]
														.filter(Boolean)
														.join(" · ")}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</Container>
					</WireframeSection>
				)}

				{/* Document metadata footer */}
				<Container className="py-6">
					<div className="border border-gray-200 bg-gray-50 px-4 py-3">
						<p className="font-mono text-label text-gray-500">
							Pipeline document &middot; id {doc.id} &middot; indexed{" "}
							{doc.indexed_at.slice(0, 10)}
							{entry.doc._sample_meta && (
								<>
									{" "}
									&middot; {entry.doc._sample_meta.populated_fields} fields
									populated &middot; picked{" "}
									{entry.doc._sample_meta.picked_at.slice(0, 10)}
								</>
							)}{" "}
							&middot;{" "}
							<Link
								href="/constituents/sample"
								className="underline decoration-gray-300 hover:decoration-gray-600"
							>
								back to variants
							</Link>
						</p>
					</div>
				</Container>
			</div>
		</ScopePage>
	);
}

function DecadeHistogram({
	rows,
}: {
	rows: { decade: number; count: number }[];
}) {
	// Fill gaps so missing decades render as zero-height columns.
	const decades = rows.map((r) => r.decade);
	const start = Math.min(...decades);
	const end = Math.max(...decades);
	const counts = new Map(rows.map((r) => [r.decade, r.count]));
	const filled: { decade: number; count: number }[] = [];
	for (let d = start; d <= end; d += 10) {
		filled.push({ decade: d, count: counts.get(d) ?? 0 });
	}
	const max = Math.max(...filled.map((d) => d.count), 1);

	const CHART_PX = 160;
	return (
		<div className="mt-8">
			<TombstoneLabel className="mb-3 block">By decade</TombstoneLabel>
			<div className="flex items-end gap-1" style={{ height: `${CHART_PX}px` }}>
				{filled.map((b) => {
					const barPx = (b.count / max) * CHART_PX;
					return (
						<div
							key={b.decade}
							className="flex h-full flex-1 flex-col items-center justify-end"
						>
							<span className="mb-1 font-mono text-label text-gray-500 leading-none">
								{b.count > 0 ? b.count : ""}
							</span>
							<div
								className="w-full bg-gray-400"
								style={{ height: `${barPx}px` }}
								title={`${b.decade}s: ${b.count}`}
							/>
						</div>
					);
				})}
			</div>
			<div className="mt-1 flex gap-1 border-t border-gray-300 pt-1">
				{filled.map((b) => (
					<span
						key={b.decade}
						className="flex-1 text-center font-mono text-label text-gray-500"
					>
						{`${b.decade}s`}
					</span>
				))}
			</div>
		</div>
	);
}

function FacetList({
	title,
	rows,
}: {
	title: string;
	rows: { value: string; count: number }[];
}) {
	if (!rows || rows.length === 0) return null;
	const max = Math.max(...rows.map((r) => r.count));
	return (
		<div>
			<TombstoneLabel className="mb-2 block">{title}</TombstoneLabel>
			<div className="flex flex-col gap-1">
				{rows.map((r) => {
					const pct = max > 0 ? (r.count / max) * 100 : 0;
					return (
						<div key={r.value} className="flex items-center gap-2">
							<span
								className="flex-1 truncate font-mono text-meta text-gray-700"
								title={r.value}
							>
								{r.value}
							</span>
							<div className="relative h-2 w-16 bg-gray-100">
								<div
									className="absolute inset-y-0 left-0 bg-gray-400"
									style={{ width: `${pct}%` }}
								/>
							</div>
							<span className="w-8 text-right font-mono text-label text-gray-500">
								{r.count}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
