import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	Container,
	ExhibitionRow,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import JumpToNav from "@/components/wireframe/JumpToNav";
import { allMedia, iiifImageUrl } from "@/lib/collection-document";
import { findSampleBySlug, loadSampleDocs } from "@/lib/sample-docs-registry";
import { ScopePage } from "@/providers/ScopeProvider";

// ── Variant registry ──────────────────────────────────────────────────
// Slugs and docs are auto-discovered from src/data/sample-docs/*.json.
// To add a new sample: drop the JSON in, no code edit required.

export function generateStaticParams() {
	return loadSampleDocs().map((e) => ({ variant: e.slug }));
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Convert a snake_case field name to a human-readable label. */
function humaniseFieldName(field: string): string {
	return field
		.replace(/^term_/, "")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** All 15 term_* field keys in preferred display order. */
const TERM_FIELDS = [
	"term_place_of_creation",
	"term_place_of_fabrication",
	"term_place_name_at_creation",
	"term_related_geography",
	"term_find_spot",
	"term_period",
	"term_reign",
	"term_dynasty",
	"term_style",
	"term_movement",
	"term_school",
	"term_materials",
	"term_subject",
	"term_intended_market",
	"term_rights_statement",
] as const;

type TermField = (typeof TERM_FIELDS)[number];

// ── Sub-components ────────────────────────────────────────────────────

function TombstoneGroup({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<section>
			<h3 className="mb-3 border-b border-gray-200 pb-1.5 font-mono text-label uppercase tracking-wide text-gray-500">
				{label}
			</h3>
			<div className="flex flex-col gap-2.5">{children}</div>
		</section>
	);
}

function TombstoneField({
	label,
	value,
	href,
	field,
}: {
	label: string;
	value: string;
	href?: string;
	field?: string;
}) {
	return (
		<div>
			<TombstoneLabel>{label}</TombstoneLabel>
			{field && <FieldSourceBadge field={field} />}
			{href ? (
				<p className="mt-0.5">
					<Link
						href={href}
						className="font-mono text-meta text-gray-700 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
					>
						{value}
					</Link>
				</p>
			) : (
				<p className="mt-0.5 font-mono text-meta text-gray-700">{value}</p>
			)}
		</div>
	);
}

// Strip simple HTML tags for display (web_text / didactic_label can contain <em>, <a>, etc.)
function stripHtml(html: string): string {
	return html.replace(/<[^>]+>/g, "");
}

// ── Page ──────────────────────────────────────────────────────────────

type Props = { params: Promise<{ variant: string }> };

export default async function SampleObjectPage({ params }: Props) {
	const { variant } = await params;
	const entry = findSampleBySlug(variant);
	if (!entry) notFound();
	const doc = entry.doc;

	const { visible: visibleMedia, hiddenCount } = allMedia(doc);
	const hasAnyImage = doc.has_iiif && visibleMedia.length > 0;

	// Collect populated term_* groups in display order
	const populatedTermGroups = TERM_FIELDS.flatMap((field) => {
		const entries = doc[field as TermField];
		if (!entries || entries.length === 0) return [];
		return [{ field, label: humaniseFieldName(field), entries }];
	});
	const hasTerms = populatedTermGroups.length > 0;

	// Alternate titles (exclude Primary Title, which is already in doc.title)
	const alternateTitles = doc.titles.filter(
		(t) => t.TitleType !== "Primary Title",
	);

	// Group constituents by Role, sorted by lowest DisplayOrder in each group
	const constituentsByRole = doc.constituents.reduce<
		Map<string, (typeof doc.constituents)[number][]>
	>((map, c) => {
		const group = map.get(c.Role) ?? [];
		group.push(c);
		map.set(c.Role, group);
		return map;
	}, new Map());

	const sortedRoles = [...constituentsByRole.entries()].sort(
		([, a], [, b]) =>
			Math.min(...a.map((c) => c.DisplayOrder)) -
			Math.min(...b.map((c) => c.DisplayOrder)),
	);

	const hasConstituents = doc.constituents.length > 0;
	const hasExhibitions = doc.exhibitions.length > 0;
	const physicalChildIds = doc.physical_child_ids ?? [];
	const virtualChildIds = doc.virtual_child_ids ?? [];
	const hasChildIds = physicalChildIds.length > 0 || virtualChildIds.length > 0;
	const childCards = doc.child_cards ?? [];
	const hasChildCards = childCards.length > 0;
	const CHILD_CARD_LIMIT = 12;
	const visibleChildCards = childCards.slice(0, CHILD_CARD_LIMIT);
	const hiddenChildCardCount = childCards.length - visibleChildCards.length;
	const mediumParts = doc.medium_parts ?? [];
	const hasDimensions =
		doc.dimensions_structured.length > 0 || !!doc.dimensions;
	const hasDescription = !!(
		doc.identifying_description ||
		doc.web_text ||
		doc.didactic_label
	);
	const onViewLocation =
		doc.on_view && (doc.location_building || doc.location_room)
			? [doc.location_building, doc.location_room].filter(Boolean).join(", ")
			: null;

	return (
		<ScopePage id="objects/sample">
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{ label: "Sample Objects", href: "/objects/sample" },
							{ label: variant.charAt(0).toUpperCase() + variant.slice(1) },
						]}
					/>
				</Container>

				{/* Jump-to nav */}
				<ScopeMark label="Jump-to navigation">
					<Container className="border-b border-gray-200 py-2">
						<JumpToNav
							items={[
								...(hasAnyImage || hiddenCount > 0
									? [{ label: "Image", id: "image" }]
									: []),
								{ label: "Object", id: "tombstone" },
								...(hasDescription ? [{ label: "About", id: "about" }] : []),
								...(hasDimensions
									? [{ label: "Dimensions", id: "dimensions" }]
									: []),
								...(hasConstituents
									? [{ label: "Constituents", id: "constituents" }]
									: []),
								...(hasExhibitions
									? [{ label: "Exhibitions", id: "exhibitions" }]
									: []),
								...(doc.has_provenance
									? [{ label: "Provenance", id: "provenance" }]
									: []),
							]}
						/>
					</Container>
				</ScopeMark>

				{/* Image section — renders if there are visible images OR if images were hidden */}
				{(hasAnyImage || hiddenCount > 0) && (
					<WireframeSection
						label="Image"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<span id="image" className="sr-only">
								Image
							</span>
							<FieldSourceBadge field="media" block />

							{hasAnyImage && visibleMedia.length === 1 && (
								/* Single image: preserve existing single-image layout */
								<div className="border border-gray-300">
									<ImagePlaceholder
										aspect="4/3"
										label={`[IIIF image — media_master_id ${visibleMedia[0].media_master_id}]`}
										className="border-0"
									/>
									{(visibleMedia[0].media_view ||
										visibleMedia[0].public_caption ||
										visibleMedia[0].photographer ||
										visibleMedia[0].credit_line) && (
										<div className="border-t border-gray-200 px-3 py-2">
											{visibleMedia[0].media_view && (
												<p className="font-mono text-label uppercase tracking-wide text-gray-500">
													{visibleMedia[0].media_view}
													<FieldSourceBadge field="media[].media_view" />
												</p>
											)}
											{visibleMedia[0].public_caption && (
												<p className="mt-0.5 font-mono text-meta text-gray-600">
													{visibleMedia[0].public_caption}
													<FieldSourceBadge field="media[].public_caption" />
												</p>
											)}
											{(visibleMedia[0].photographer ||
												visibleMedia[0].credit_line) && (
												<p className="mt-0.5 font-mono text-label text-gray-400">
													{visibleMedia[0].photographer ??
														visibleMedia[0].credit_line}
													<FieldSourceBadge
														field={
															visibleMedia[0].photographer
																? "media[].photographer"
																: "media[].credit_line"
														}
													/>
												</p>
											)}
										</div>
									)}
									<div className="border-t border-gray-200 px-3 py-2">
										<p className="font-mono text-label text-gray-400">
											Live IIIF URL:{" "}
											<a
												href={iiifImageUrl(
													visibleMedia[0].media_master_id,
													"!600,600",
												)}
												target="_blank"
												rel="noopener noreferrer"
												className="underline decoration-gray-300 hover:decoration-gray-600"
											>
												{iiifImageUrl(
													visibleMedia[0].media_master_id,
													"!600,600",
												)}
											</a>
										</p>
									</div>
								</div>
							)}

							{hasAnyImage && visibleMedia.length > 1 && (
								/* Multi-image carousel: CSS scroll-snap, no JS required */
								<div>
									{/* Main scroll container */}
									<div
										className="relative overflow-x-auto"
										style={{ scrollSnapType: "x mandatory" }}
									>
										<div className="flex">
											{visibleMedia.map((item, i) => {
												const imgUrl = iiifImageUrl(
													item.media_master_id,
													"!600,600",
												);
												return (
													<div
														key={item.media_master_id}
														id={`image-${i}`}
														className="min-w-full border border-gray-300"
														style={{ scrollSnapAlign: "start" }}
													>
														<ImagePlaceholder
															aspect="4/3"
															label={`[IIIF image ${i + 1} of ${visibleMedia.length} — media_master_id ${item.media_master_id}]`}
															className="border-0"
														/>
														<div className="border-t border-gray-200 px-3 py-2">
															<p className="font-mono text-label uppercase tracking-wide text-gray-500">
																Image {i + 1} of {visibleMedia.length}
																{item.media_view && (
																	<> &middot; {item.media_view}</>
																)}
															</p>
															{item.public_caption && (
																<p className="mt-0.5 font-mono text-meta text-gray-600">
																	{item.public_caption}
																	<FieldSourceBadge field="media[].public_caption" />
																</p>
															)}
															{(item.photographer || item.credit_line) && (
																<p className="mt-0.5 font-mono text-label text-gray-400">
																	{item.photographer ?? item.credit_line}
																	<FieldSourceBadge
																		field={
																			item.photographer
																				? "media[].photographer"
																				: "media[].credit_line"
																		}
																	/>
																</p>
															)}
															<p className="mt-1 font-mono text-label text-gray-400">
																Live IIIF URL:{" "}
																<a
																	href={imgUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="underline decoration-gray-300 hover:decoration-gray-600"
																>
																	{imgUrl}
																</a>
															</p>
														</div>
													</div>
												);
											})}
										</div>
									</div>

									{/* Thumbnail strip — anchor links to each slide */}
									<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
										{visibleMedia.map((item, i) => {
											const thumbUrl = iiifImageUrl(
												item.media_master_id,
												"!200,200",
											);
											return (
												<a
													key={item.media_master_id}
													href={`#image-${i}`}
													className="flex-shrink-0 border-2 border-gray-300 hover:border-gray-600"
													title={item.media_view ?? `Image ${i + 1}`}
												>
													<div style={{ width: "72px" }}>
														<ImagePlaceholder
															aspect="1/1"
															label={`${i + 1}`}
															className="border-0 text-[10px]"
														/>
													</div>
													<p className="px-1 pb-1 font-mono text-[10px] text-gray-500">
														{thumbUrl.replace(
															"https://famsf.emuseum.com/apis/iiif/image/v2/",
															"…/",
														)}
													</p>
												</a>
											);
										})}
									</div>
								</div>
							)}

							{/* Hidden-image note */}
							{hiddenCount > 0 && (
								<p className="mt-3 font-mono text-label text-gray-400">
									{hiddenCount} image{hiddenCount === 1 ? "" : "s"} hidden: not
									approved for web
								</p>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Tombstone */}
				<Container className="border-b border-gray-300 py-8">
					<WireframeSection label="Tombstone">
						<span id="tombstone" className="sr-only">
							Object
						</span>

						{/* Gap 3: Physical parent breadcrumb — only when physical_parent_id is set */}
						{doc.physical_parent_id && (
							<p className="mb-3 font-mono text-meta text-gray-500">
								Part of:{" "}
								{doc.parent_title && (
									<span className="text-gray-700">{doc.parent_title}</span>
								)}
								{doc.parent_accession_number && (
									<span className="text-gray-500">
										{" "}
										({doc.parent_accession_number})
									</span>
								)}
							</p>
						)}

						{/* Gap 1: is_compound / is_virtual badges */}
						{(doc.is_compound || doc.is_virtual) && (
							<div className="mb-3 flex flex-wrap gap-2">
								{doc.is_compound && (
									<span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label uppercase tracking-wider text-gray-500">
										Compound Parent
									</span>
								)}
								{doc.is_virtual && (
									<span className="inline-block rounded bg-amber-50 px-2 py-0.5 font-mono text-label uppercase tracking-wider text-amber-700">
										Virtual
									</span>
								)}
							</div>
						)}

						<h1 className="font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{doc.title ?? (
								<span className="text-gray-400">
									{doc.accession_number}{" "}
									<span className="text-meta">(untitled)</span>
								</span>
							)}
						</h1>
						<FieldSourceBadge field="title" block />

						{alternateTitles.length > 0 && (
							<ul className="mt-1.5 flex flex-col gap-0.5">
								{alternateTitles.map((t) => (
									<li
										key={`${t.TitleType}-${t.DisplayOrder}`}
										className="font-mono text-meta text-gray-500"
									>
										<span className="text-gray-400">{t.TitleType}:</span>{" "}
										{t.Title}
									</li>
								))}
							</ul>
						)}

						{doc.primary_artist_display && (
							<p className="mt-1 font-mono text-body text-gray-600">
								{doc.primary_artist_display}
								<FieldSourceBadge field="primary_artist_display" />
							</p>
						)}
						{doc.display_date && (
							<p className="mt-0.5 font-mono text-meta text-gray-400">
								{doc.display_date}
								<FieldSourceBadge field="display_date" />
								{doc.medium && (
									<>
										&middot; {doc.medium}
										<FieldSourceBadge field="medium" />
									</>
								)}
							</p>
						)}
						{onViewLocation && (
							<p className="mt-2 inline-flex items-center gap-1.5 font-mono text-meta text-emerald-700">
								<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
								On view
								<FieldSourceBadge field="on_view" />
								at {onViewLocation}
								<FieldSourceBadge field="location_building" />
								<FieldSourceBadge field="location_room" />
							</p>
						)}

						<div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-gray-200 pt-6 sm:grid-cols-2 lg:grid-cols-3">
							{/* Creation */}
							{(doc.display_date ||
								doc.medium ||
								doc.object_name ||
								doc.edition) && (
								<TombstoneGroup label="Creation">
									{doc.display_date && (
										<TombstoneField
											label="Date"
											value={doc.display_date}
											field="display_date"
										/>
									)}
									{doc.medium && (
										<div>
											<TombstoneField
												label="Medium"
												value={doc.medium}
												field="medium"
											/>
											{/* Gap 4: medium_parts chips — only when more than one part */}
											{mediumParts.length > 1 && (
												<div className="mt-1.5 flex flex-wrap gap-1.5">
													{mediumParts.map((part) => (
														<span
															key={part}
															className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label text-gray-600"
														>
															{part}
														</span>
													))}
												</div>
											)}
										</div>
									)}
									{doc.object_name && (
										<TombstoneField
											label="Object name"
											value={doc.object_name}
											field="object_name"
										/>
									)}
									{doc.edition && (
										<TombstoneField
											label="Edition"
											value={doc.edition.trim()}
											field="edition"
										/>
									)}
								</TombstoneGroup>
							)}

							{/* Classification */}
							{(doc.department || doc.classification) && (
								<TombstoneGroup label="Classification">
									{doc.department && (
										<TombstoneField
											label="Department"
											value={doc.department}
											href="/collection-area"
											field="department"
										/>
									)}
									{doc.classification && (
										<TombstoneField
											label="Classification"
											value={doc.classification}
											href="/search-results"
											field="classification"
										/>
									)}
								</TombstoneGroup>
							)}

							{/* Attributes — all populated term_* groups */}
							{hasTerms && (
								<TombstoneGroup label="Attributes">
									{populatedTermGroups.map(({ field, label, entries }) => (
										<div key={field}>
											<TombstoneLabel>{label}</TombstoneLabel>
											<FieldSourceBadge field={field} />
											<ul className="mt-0.5 flex flex-col gap-1">
												{entries.map((entry) => {
													const breadcrumb = entry.path
														.map((n) => n.term)
														.join(" > ");
													const showCertainty =
														entry.certainty &&
														entry.certainty !== "(not assigned)" &&
														entry.certainty !== "";
													return (
														<li
															key={`${field}-${entry.term}`}
															className="font-mono text-meta text-gray-700"
														>
															{entry.term}
															{showCertainty && (
																<TombstoneLabel className="ml-1.5">
																	({entry.certainty})
																</TombstoneLabel>
															)}
															{breadcrumb && (
																<span className="block text-label text-gray-400">
																	{breadcrumb}
																</span>
															)}
														</li>
													);
												})}
											</ul>
										</div>
									))}
								</TombstoneGroup>
							)}

							{/* Acquisition */}
							<TombstoneGroup label="Acquisition">
								{doc.credit_line && (
									<TombstoneField
										label="Credit line"
										value={doc.credit_line}
										field="credit_line"
									/>
								)}
								<TombstoneField
									label="Accession number"
									value={doc.accession_number}
									field="accession_number"
								/>
								{doc.accession_iso_date && (
									<TombstoneField
										label="Accessioned"
										value={doc.accession_iso_date}
										field="accession_iso_date"
									/>
								)}
							</TombstoneGroup>

							{/* Rights */}
							{doc.object_rights_type && (
								<TombstoneGroup label="Rights">
									<TombstoneField
										label="Rights type"
										value={doc.object_rights_type}
										field="object_rights_type"
									/>
									{doc.copyright && (
										<TombstoneField
											label="Copyright"
											value={doc.copyright}
											field="copyright"
										/>
									)}
								</TombstoneGroup>
							)}

							{/* Marks (maximal only) */}
							{(doc.signed || doc.inscribed || doc.markings) && (
								<TombstoneGroup label="Marks">
									{doc.signed && (
										<TombstoneField
											label="Signed"
											value={doc.signed}
											field="signed"
										/>
									)}
									{doc.inscribed && (
										<TombstoneField
											label="Inscribed"
											value={doc.inscribed}
											field="inscribed"
										/>
									)}
									{doc.markings && (
										<TombstoneField
											label="Markings"
											value={doc.markings.trim()}
											field="markings"
										/>
									)}
								</TombstoneGroup>
							)}
						</div>
					</WireframeSection>
				</Container>

				{/* Description */}
				{hasDescription && (
					<WireframeSection
						label="Description"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="about" className="sr-only">
								About
							</span>
							<SectionLabel className="mb-4">About this work</SectionLabel>
							{doc.identifying_description && (
								<div className="mb-4">
									<TombstoneLabel className="mb-1 block">
										Identifying description
									</TombstoneLabel>
									<FieldSourceBadge field="identifying_description" block />
									<p className="font-mono text-body leading-relaxed text-gray-600">
										{doc.identifying_description}
									</p>
								</div>
							)}
							{doc.web_text && (
								<div className="mb-4">
									<TombstoneLabel className="mb-1 block">
										Web text
									</TombstoneLabel>
									<FieldSourceBadge field="web_text" block />
									<p className="font-mono text-body leading-relaxed text-gray-600">
										{stripHtml(doc.web_text)}
									</p>
								</div>
							)}
							{doc.didactic_label && doc.didactic_label !== doc.web_text && (
								<div>
									<ScopeMark label="Didactic label">
										<TombstoneLabel className="mb-1 block">
											Didactic label
										</TombstoneLabel>
										<FieldSourceBadge field="didactic_label" block />
										<p className="font-mono text-body leading-relaxed text-gray-600">
											{stripHtml(doc.didactic_label)}
										</p>
									</ScopeMark>
								</div>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Dimensions */}
				{hasDimensions && (
					<WireframeSection
						label="Dimensions"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="dimensions" className="sr-only">
								Dimensions
							</span>
							<SectionLabel className="mb-4">Dimensions</SectionLabel>
							<FieldSourceBadge field="dimensions_structured" block />
							{doc.dimensions_structured.length > 0 ? (
								<ul className="flex flex-col gap-1.5">
									{doc.dimensions_structured.map((d) => {
										const label = d.ElementName ?? d.Description;
										return (
											<li
												key={`${d.Rank}-${d.DisplayDimensions}`}
												className="font-mono text-meta text-gray-700"
											>
												{label && (
													<span className="text-gray-500">{label}: </span>
												)}
												{d.DisplayDimensions}
												{!d.Displayed && (
													<span className="ml-2 font-mono text-label uppercase tracking-[0.08em] text-gray-400">
														(hidden)
													</span>
												)}
											</li>
										);
									})}
								</ul>
							) : (
								doc.dimensions && (
									<p className="font-mono text-meta text-gray-700">
										{doc.dimensions}
									</p>
								)
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Constituents */}
				{hasConstituents && (
					<WireframeSection
						label="Constituents"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="constituents" className="sr-only">
								Constituents
							</span>
							<SectionLabel className="mb-4">
								People and organisations
							</SectionLabel>
							<FieldSourceBadge field="constituents" block />
							<div className="flex flex-col gap-5">
								{sortedRoles.map(([role, members]) => (
									<div key={role}>
										<h3 className="mb-2 font-mono text-label uppercase tracking-wide text-gray-400">
											{role}
										</h3>
										<div className="flex flex-col gap-2">
											{members
												.slice()
												.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
												.map((c) => (
													<div
														key={c.ConstituentID}
														className="border-l-2 border-gray-200 pl-3"
													>
														<p className="font-mono text-meta font-medium text-gray-700">
															{c.DisplayName}
														</p>
														<p className="font-mono text-label text-gray-500">
															{c.Nationality && <>{c.Nationality}</>}
															{c.DisplayDate && (
																<>
																	{c.Nationality ? " · " : ""}
																	{c.DisplayDate}
																</>
															)}
														</p>
													</div>
												))}
										</div>
									</div>
								))}
							</div>
						</Container>
					</WireframeSection>
				)}

				{/* Exhibitions */}
				{hasExhibitions && (
					<WireframeSection
						label="Exhibitions"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="exhibitions" className="sr-only">
								Exhibitions
							</span>
							<SectionLabel className="mb-4">Exhibition history</SectionLabel>
							<FieldSourceBadge field="exhibitions" block />
							<div className="flex flex-col gap-3">
								{doc.exhibitions.map((e) => (
									<ExhibitionRow
										key={e.ExhibitionID}
										title={e.ExhTitle}
										date={e.DisplayDate ?? undefined}
										venue={e.VenueName ?? undefined}
									/>
								))}
							</div>
							{doc.exhibition_history_text && (
								<ScopeMark label="Exhibition history text">
									<div className="mt-4 border-t border-gray-200 pt-4">
										<TombstoneLabel className="mb-1 block">
											Full exhibition history (text)
										</TombstoneLabel>
										<FieldSourceBadge field="exhibition_history_text" block />
										<p className="whitespace-pre-line font-mono text-meta text-gray-600">
											{stripHtml(doc.exhibition_history_text)}
										</p>
									</div>
								</ScopeMark>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Provenance */}
				{doc.has_provenance && doc.provenance && (
					<WireframeSection
						label="Provenance"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="provenance" className="sr-only">
								Provenance
							</span>
							<SectionLabel className="mb-4">Provenance</SectionLabel>
							<FieldSourceBadge field="provenance" block />
							<p className="whitespace-pre-line font-mono text-body leading-relaxed text-gray-600">
								{doc.provenance}
							</p>
							{doc.bibliography_text && (
								<ScopeMark label="Bibliography">
									<div className="mt-4 border-t border-gray-200 pt-4">
										<SectionLabel className="mb-2">Bibliography</SectionLabel>
										<FieldSourceBadge field="bibliography_text" block />
										<p className="whitespace-pre-line font-mono text-meta text-gray-600">
											{stripHtml(doc.bibliography_text)}
										</p>
									</div>
								</ScopeMark>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Gap 2: Child records — thumbnail grid when child_cards populated, ID fallback otherwise */}
				{hasChildIds && (
					<WireframeSection
						label="Child records"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<SectionLabel className="mb-4">
								Child records (
								{childCards.length > 0
									? childCards.length
									: physicalChildIds.length + virtualChildIds.length}
								)
							</SectionLabel>
							<FieldSourceBadge field="child_cards" block />

							{hasChildCards ? (
								<>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
										{visibleChildCards.map((card) => (
											<div
												key={card.id}
												className="border border-gray-200 hover:border-gray-400"
											>
												<ImagePlaceholder
													aspect="1/1"
													label={
														card.iiif_thumbnail_url
															? "[IIIF thumb]"
															: card.has_iiif
																? "[IIIF available]"
																: "[No image]"
													}
												/>
												<div className="px-2.5 py-2">
													<p className="font-mono text-label uppercase tracking-wide text-gray-400">
														{card.accession_number}
													</p>
													{card.title && (
														<p className="mt-0.5 font-mono text-meta text-gray-700 leading-snug">
															{card.title}
														</p>
													)}
													{(card.primary_artist_display ||
														card.display_date) && (
														<p className="mt-0.5 font-mono text-label text-gray-400">
															{[card.primary_artist_display, card.display_date]
																.filter(Boolean)
																.join(" · ")}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
									{hiddenChildCardCount > 0 && (
										<p className="mt-4 font-mono text-meta text-gray-500">
											+ {hiddenChildCardCount} more
										</p>
									)}
								</>
							) : (
								<>
									{physicalChildIds.length > 0 && (
										<div className="mb-4">
											<TombstoneLabel className="mb-2 block">
												Physical children ({physicalChildIds.length})
											</TombstoneLabel>
											<p className="font-mono text-meta text-gray-700">
												{physicalChildIds.slice(0, 10).join(", ")}
												{physicalChildIds.length > 10 && (
													<span className="text-gray-400">
														{" "}
														and {physicalChildIds.length - 10} more
													</span>
												)}
											</p>
										</div>
									)}
									{virtualChildIds.length > 0 && (
										<div>
											<TombstoneLabel className="mb-2 block">
												Virtual children ({virtualChildIds.length})
											</TombstoneLabel>
											<p className="font-mono text-meta text-gray-700">
												{virtualChildIds.slice(0, 10).join(", ")}
												{virtualChildIds.length > 10 && (
													<span className="text-gray-400">
														{" "}
														and {virtualChildIds.length - 10} more
													</span>
												)}
											</p>
										</div>
									)}
								</>
							)}
						</Container>
					</WireframeSection>
				)}

				{/* Document metadata footer */}
				<Container className="py-6">
					<div className="border border-gray-200 bg-gray-50 px-4 py-3">
						<p className="font-mono text-label text-gray-500">
							Pipeline document &middot; id {doc.id} &middot; indexed{" "}
							{doc.indexed_at.slice(0, 10)} &middot;{" "}
							<Link
								href="/objects/sample"
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
