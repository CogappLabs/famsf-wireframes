import Link from "next/link";
import { notFound } from "next/navigation";
import {
	BibliographyText,
	Breadcrumb,
	Container,
	ExhibitionRow,
	ImagePlaceholder,
	ProvenanceText,
	ScopeMark,
	SectionLabel,
	TombstoneLabel,
	TranscriptionList,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import JumpToNav from "@/components/wireframe/JumpToNav";
import {
	RelatedWorksSection,
	ScaleDiagram,
	VisuallySimilarGrid,
} from "@/components/wireframe/object-detail";
import { allMedia, iiifImageUrl } from "@/lib/collection-document";
import { constituentSlugById } from "@/lib/constituent-samples-registry";
import {
	findSampleBySlug,
	loadSampleDocs,
	objectSlugById,
} from "@/lib/sample-docs-registry";
import { normaliseDateRange, normaliseTitle } from "@/lib/text-format";
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

/** Geography-related term fields are Tier 1 public per guidelines.
 *  All other Attributes are "Phase 2" per Attributes section. */
const GEOGRAPHY_TERM_FIELDS = new Set<TermField>([
	"term_place_of_creation",
	"term_place_of_fabrication",
	"term_place_name_at_creation",
	"term_related_geography",
	"term_find_spot",
]);

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

// Sanitise inline HTML to an allow-list. Preserves italic/bold/line-break tags
// per cataloguing guidelines (Bibliography, Web Text, Didactic Label, etc.
// allow rich-text italics for book/journal titles, bold for emphasis, <br/>
// for FAMSF-specified line breaks). Strips everything else, including
// attributes and dangerous tags. Production should swap for DOMPurify.
const ALLOWED_TAGS = new Set([
	"em",
	"strong",
	"i",
	"b",
	"u",
	"br",
	"p",
	"ul",
	"ol",
	"li",
]);
function sanitiseHtml(html: string): string {
	return html.replace(/<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (_m, tag) => {
		const t = String(tag).toLowerCase();
		if (!ALLOWED_TAGS.has(t)) return "";
		const closing = _m.startsWith("</") ? "/" : "";
		const selfClose = t === "br" ? " /" : "";
		return `<${closing}${t}${selfClose}>`;
	});
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

	// Normalised primary title (handles Untitled + descriptive-bracket convention)
	const titleDisplay = normaliseTitle(doc.title);
	// Normalised display date (en dash between year tokens per guideline)
	const displayDate = normaliseDateRange(doc.display_date);

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

	// Parent record: link to the in-repo sample if known, else fall back to legacy route.
	const slugById = objectSlugById();
	const constituentSlugs = constituentSlugById();
	const parentSlug = doc.physical_parent_id
		? (slugById[doc.physical_parent_id] ?? null)
		: null;
	const parentHref = doc.physical_parent_id
		? parentSlug
			? `/objects/sample/${parentSlug}`
			: "/objects/sample"
		: null;

	// Museum location string for the Acquisition group.
	const museumLocation =
		doc.location_string ??
		doc.location_room ??
		doc.location_building ??
		"Not on view";

	// Rights status: drives whether the download placeholder is disabled.
	const isPublicDomain =
		doc.copyright?.toLowerCase().includes("public domain") ?? false;
	const copyrightStatement = doc.copyright ?? "Rights not specified";

	// Object Rights Statement: controlled-vocab term mapped to rightsstatements.org URI.
	// Guidelines section "Object Rights Statement" lists three canonical values.
	const rightsTerm = doc.term_rights_statement?.[0]?.term ?? null;
	const rightsStatementMap: Record<
		string,
		{ label: string; uri: string | null }
	> = {
		"In Copyright": {
			label: "In copyright",
			uri: "https://rightsstatements.org/page/InC/1.0/",
		},
		"No Copyright - United States": {
			label: "No copyright (United States)",
			uri: "https://rightsstatements.org/page/NoC-US/1.0/",
		},
		"No Copyright – United States": {
			label: "No copyright (United States)",
			uri: "https://rightsstatements.org/page/NoC-US/1.0/",
		},
		"Copyright Undetermined": {
			label: "Copyright undetermined",
			uri: "https://rightsstatements.org/page/UND/1.0/",
		},
	};
	const rightsStatementDisplay = rightsTerm
		? (rightsStatementMap[rightsTerm] ?? { label: rightsTerm, uri: null })
		: null;

	// Suggested citation built from tombstone fields. Industry-standard art
	// citation order: Artist, Title (Date), Medium, Credit Line, Accession No.
	const citationTitle = normaliseTitle(doc.title).display;
	const citationDate = normaliseDateRange(doc.display_date);
	const citationParts = [
		doc.primary_artist,
		citationTitle && citationDate
			? `${citationTitle} (${citationDate})`
			: citationTitle,
		doc.medium,
		doc.credit_line,
		doc.accession_number,
	].filter(Boolean);
	const suggestedCitation = `${citationParts.join(", ")}. Fine Arts Museums of San Francisco.`;

	// Related works pool: same department or same primary artist, excluding self.
	const allDocs = loadSampleDocs();
	const related = allDocs
		.filter((e) => e.doc.id !== doc.id)
		.filter(
			(e) =>
				(doc.department && e.doc.department === doc.department) ||
				(doc.primary_artist && e.doc.primary_artist === doc.primary_artist),
		)
		.slice(0, 8)
		.map((e) => e.doc);

	const lastUpdated = doc.last_modified ?? doc.indexed_at;

	return (
		<ScopePage id="objects/sample">
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{ label: "Sample Objects", href: "/objects/sample" },
							{ label: titleDisplay.display || doc.accession_number },
						]}
					/>
				</Container>

				{/* Parent record banner */}
				{doc.physical_parent_id && parentHref && (
					<ScopeMark label="Parent record">
						<Container className="border-b border-gray-200 bg-gray-50 py-3">
							<div className="flex items-center justify-between gap-3">
								<div>
									<TombstoneLabel>
										Part of &middot; Parent record
									</TombstoneLabel>
									<p className="font-mono text-meta text-gray-700">
										{doc.parent_title ?? "Parent record"}
										{doc.parent_accession_number && (
											<span className="ml-2 text-gray-500">
												({doc.parent_accession_number})
											</span>
										)}
									</p>
								</div>
								<Link
									href={parentHref}
									className="font-mono text-label uppercase tracking-wide text-gray-600 underline hover:text-gray-900"
								>
									View parent record &rarr;
								</Link>
							</div>
						</Container>
					</ScopeMark>
				)}

				{/* Image section: renders if there are visible images OR if images were hidden */}
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
										label={`[IIIF image: media_master_id ${visibleMedia[0].media_master_id}]`}
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
															label={`[IIIF image ${i + 1} of ${visibleMedia.length}: media_master_id ${item.media_master_id}]`}
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

									{/* Thumbnail strip: anchor links to each slide */}
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

							{/* Alt text placeholder */}
							<ScopeMark label="Alt text">
								<div className="mt-3 border border-gray-200 bg-gray-50 px-3 py-2">
									<TombstoneLabel>Alt text [placeholder]</TombstoneLabel>
									<p className="mt-0.5 font-mono text-meta text-gray-500">
										Alt text not yet provided
									</p>
								</div>
							</ScopeMark>

							{/* Image actions row [placeholder]: non-functional buttons. */}
							<WireframeSection label="Image actions">
								<div className="mt-3 flex flex-wrap items-center gap-3">
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 hover:border-gray-500"
									>
										Zoom
									</button>
									{isPublicDomain ? (
										<button
											type="button"
											className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 hover:border-gray-500"
										>
											Download
										</button>
									) : (
										<button
											type="button"
											disabled
											title="In copyright [placeholder]"
											className="cursor-not-allowed border border-gray-200 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-400"
										>
											Download (in copyright)
										</button>
									)}
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 hover:border-gray-500"
									>
										Share
									</button>
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 hover:border-gray-500"
									>
										Cite
									</button>
									<span className="ml-auto font-mono text-label text-gray-400">
										[placeholder]
									</span>
								</div>
							</WireframeSection>
						</Container>
					</WireframeSection>
				)}

				{/* Tombstone */}
				<Container className="border-b border-gray-300 py-8">
					<WireframeSection label="Tombstone">
						<span id="tombstone" className="sr-only">
							Object
						</span>

						{/* Gap 3: Physical parent breadcrumb: only when physical_parent_id is set */}
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

						<h1
							className={`font-mono text-page font-semibold leading-[1.15] tracking-tight ${titleDisplay.isDescriptive ? "italic" : ""}`}
						>
							{titleDisplay.display || (
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
										<span className="text-gray-400">
											{t.TitleTypeDisplay ?? t.TitleType}:
										</span>{" "}
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
						{displayDate && (
							<p className="mt-0.5 font-mono text-meta text-gray-400">
								{displayDate}
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
											{/* Gap 4: medium_parts chips: only when more than one part */}
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
									{/* object_name intentionally not rendered: guidelines mark it CMS-only (Art Finder) */}
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
											href={`/search-results?facet=department&value=${encodeURIComponent(doc.department)}`}
											field="department"
										/>
									)}
									{doc.classification && (
										<TombstoneField
											label="Classification"
											value={doc.classification}
											href={`/search-results?facet=classification&value=${encodeURIComponent(doc.classification)}`}
											field="classification"
										/>
									)}
								</TombstoneGroup>
							)}

							{/* Attributes: all populated term_* groups.
							    Geography fields are Tier 1 public per guidelines.
							    Non-geography (Period/Reign/Dynasty/Style/Movement/School/
							    Materials/Subject/Intended Market) are marked Phase 2 — gated
							    via ScopeMark pending FAMSF confirmation of 2026 policy flip. */}
							{hasTerms && (
								<TombstoneGroup label="Attributes">
									{populatedTermGroups.map(({ field, label, entries }) => {
										const isGeo = GEOGRAPHY_TERM_FIELDS.has(field as TermField);
										const inner = (
											<>
												<TombstoneLabel>{label}</TombstoneLabel>
												<FieldSourceBadge field={field} />
												<ul className="mt-0.5 flex flex-col gap-1">
													{entries.map((entry) => {
														const showCertainty =
															entry.certainty &&
															entry.certainty !== "(not assigned)" &&
															entry.certainty !== "";
														return (
															<li
																key={`${field}-${entry.term}`}
																className="font-mono text-meta text-gray-700"
															>
																<Link
																	href={`/search-results?facet=${field}&value=${encodeURIComponent(entry.term)}`}
																	className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
																>
																	{entry.term}
																</Link>
																{showCertainty && (
																	<TombstoneLabel className="ml-1.5">
																		({entry.certainty})
																	</TombstoneLabel>
																)}
																{entry.path.length > 0 && (
																	<span className="block text-label text-gray-400">
																		{entry.path.map((n, i) => (
																			<span key={n.cn || n.term}>
																				{i > 0 && (
																					<span className="text-gray-300">
																						{" "}
																						&gt;{" "}
																					</span>
																				)}
																				<Link
																					href={`/search-results?facet=${field}&value=${encodeURIComponent(n.term)}`}
																					className="hover:underline hover:decoration-gray-500"
																				>
																					{n.term}
																				</Link>
																			</span>
																		))}
																	</span>
																)}
															</li>
														);
													})}
												</ul>
											</>
										);
										return isGeo ? (
											<div key={field}>{inner}</div>
										) : (
											<ScopeMark
												key={field}
												label="Phase 2 (pending Tier policy confirm)"
											>
												<div>{inner}</div>
											</ScopeMark>
										);
									})}
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
								{/* accession_iso_date intentionally not rendered: guidelines mark Accession Date internal-only */}
								<ScopeMark label="Museum location">
									<TombstoneField
										label="Museum location"
										value={museumLocation}
										field="location_string"
									/>
								</ScopeMark>
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

							{/* Marks: Signed / Inscribed / Markings.
							    Guidelines (Mark(s), Inscription(s), Signed) currently mark these
							    fields internal-only. Wireframe surfaces them pending FAMSF
							    confirmation of 2026 Tier-policy flip. Wrap in ScopeMark so
							    stakeholders can see the gate. */}
							{(doc.signed || doc.inscribed || doc.markings) && (
								<TombstoneGroup label="Marks (pending Tier policy confirm)">
									{doc.signed && (
										<div>
											<TombstoneLabel>Signed</TombstoneLabel>
											<FieldSourceBadge field="signed" />
											<TranscriptionList
												segments={doc.signed_structured}
												rawFallback={doc.signed}
												className="mt-0.5"
											/>
										</div>
									)}
									{doc.inscribed && (
										<div>
											<TombstoneLabel>Inscribed</TombstoneLabel>
											<FieldSourceBadge field="inscribed" />
											<TranscriptionList
												segments={doc.inscribed_structured}
												rawFallback={doc.inscribed}
												className="mt-0.5"
											/>
										</div>
									)}
									{doc.markings && (
										<div>
											<TombstoneLabel>Markings</TombstoneLabel>
											<FieldSourceBadge field="markings" />
											<TranscriptionList
												segments={doc.markings_structured}
												rawFallback={doc.markings.trim()}
												className="mt-0.5"
											/>
										</div>
									)}
								</TombstoneGroup>
							)}
						</div>
					</WireframeSection>
				</Container>

				{/* Jump-to nav: moved below tombstone so the primary tombstone
				    fields land in view first; navigation lives at the start of
				    the deep-content scroll. */}
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
								...(doc.bibliography_text
									? [{ label: "Bibliography", id: "bibliography" }]
									: []),
								{ label: "Audio guide", id: "audio-guide" },
								{ label: "Scholarly essay", id: "scholarly-essay" },
								...(related.length > 0
									? [{ label: "Related works", id: "related" }]
									: []),
								{ label: "Rights & citation", id: "rights-citation" },
								{ label: "Educational resources", id: "educational-resources" },
							]}
						/>
					</Container>
				</ScopeMark>

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
							{/* identifying_description intentionally not rendered: cataloguing guidelines mark it internal-only */}
							{doc.web_text && (
								<ScopeMark label="Content source">
									<div className="mb-4">
										<TombstoneLabel className="mb-1 block">
											Web text
										</TombstoneLabel>
										<FieldSourceBadge field="web_text" block />
										<p
											className="font-mono text-body leading-relaxed text-gray-600 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
											dangerouslySetInnerHTML={{
												__html: sanitiseHtml(doc.web_text),
											}}
										/>
										<p className="mt-1 font-mono text-label text-gray-400">
											Source: TMS web_text
										</p>
									</div>
								</ScopeMark>
							)}
							{doc.didactic_label && doc.didactic_label !== doc.web_text && (
								<div>
									<ScopeMark label="Didactic label">
										<TombstoneLabel className="mb-1 block">
											Didactic label
										</TombstoneLabel>
										<FieldSourceBadge field="didactic_label" block />
										<p
											className="font-mono text-body leading-relaxed text-gray-600 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
											dangerouslySetInnerHTML={{
												__html: sanitiseHtml(doc.didactic_label),
											}}
										/>
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
							{doc.dimensions_structured.filter((d) => d.Displayed).length >
							0 ? (
								<ul className="flex flex-col gap-1.5">
									{doc.dimensions_structured
										.filter((d) => d.Displayed)
										.map((d) => {
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

				{/* Scale diagram */}
				{doc.dimensions && <ScaleDiagram obj={doc} />}

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
															{constituentSlugs[c.ConstituentID] ? (
																<Link
																	href={`/constituents/sample/${constituentSlugs[c.ConstituentID]}`}
																	className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
																>
																	{c.DisplayName}
																</Link>
															) : (
																c.DisplayName
															)}
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
														{(() => {
															const bio =
																c.display_bios?.[0]?.bio ?? c.Biography;
															if (!bio) return null;
															// Suppress when bio just repeats nationality+date row
															const above = [c.Nationality, c.DisplayDate]
																.filter(Boolean)
																.join(" · ");
															if (
																bio.trim() === above.trim() ||
																bio.trim() === c.DisplayDate?.trim()
															)
																return null;
															return (
																<p className="mt-1 font-mono text-label leading-relaxed text-gray-500">
																	{bio}
																</p>
															);
														})()}
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
										href={`/exhibition-detail?id=${e.ExhibitionID}`}
									/>
								))}
							</div>
							{doc.exhibition_history_text && (
								<ScopeMark label="Exhibition history text">
									<details className="mt-4 border-t border-gray-200 pt-4 group">
										<summary className="cursor-pointer list-none font-mono text-label uppercase tracking-[0.08em] text-gray-500 hover:text-gray-700">
											<span className="mr-1 inline-block transition-transform group-open:rotate-90">
												▸
											</span>
											Full exhibition history (raw curator text)
											<FieldSourceBadge field="exhibition_history_text" />
										</summary>
										<p
											className="mt-3 whitespace-pre-line font-mono text-meta text-gray-600 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
											dangerouslySetInnerHTML={{
												__html: sanitiseHtml(doc.exhibition_history_text),
											}}
										/>
									</details>
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
							<ProvenanceText
								structured={doc.provenance_structured}
								rawFallback={doc.provenance}
							/>
						</Container>
					</WireframeSection>
				)}

				{/* Bibliography */}
				{doc.bibliography_text && (
					<WireframeSection
						label="Bibliography"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<span id="bibliography" className="sr-only">
								Bibliography
							</span>
							<SectionLabel className="mb-4">Bibliography</SectionLabel>
							<FieldSourceBadge field="bibliography_text" block />
							<BibliographyText value={doc.bibliography_text} />
						</Container>
					</WireframeSection>
				)}

				{/* Gap 2: Child records: thumbnail grid when child_cards populated, ID fallback otherwise */}
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

				{/* Audio guide [placeholder] */}
				<WireframeSection
					label="Audio guide"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<span id="audio-guide" className="sr-only">
							Audio guide
						</span>
						<SectionLabel className="mb-4">
							Audio guide [placeholder]
						</SectionLabel>
						<ScopeMark label="Audio guide">
							<div className="flex items-center gap-4 border border-gray-300 p-4">
								<button
									type="button"
									aria-label="Play audio guide"
									className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 font-mono text-card text-gray-600 hover:border-gray-700 hover:bg-gray-50"
								>
									▶
								</button>
								<div className="flex flex-1 flex-col gap-2">
									<div className="flex items-baseline justify-between gap-3">
										<p className="font-mono text-meta font-medium text-gray-800">
											Curator's commentary
										</p>
										<p className="font-mono text-label text-gray-400">
											0:00 / 2:14
										</p>
									</div>
									<div className="h-1 w-full bg-gray-200">
										<div className="h-full w-0 bg-gray-500" />
									</div>
									<p className="font-mono text-label text-gray-500">
										Recorded by [curator name]. Transcript available.
									</p>
								</div>
							</div>
							<p className="mt-3 font-mono text-label text-gray-400">
								Data source TBD: audio guide recordings + transcripts not yet in
								TMS. Candidate sources: separate Craft entries, Bloomberg
								Connects feed, or a new TMS UserField pointing at an S3 URL.
							</p>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Scholarly essay [placeholder] */}
				<WireframeSection
					label="Scholarly essay"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<span id="scholarly-essay" className="sr-only">
							Scholarly essay
						</span>
						<SectionLabel className="mb-4">
							Scholarly essay [placeholder]
						</SectionLabel>
						<ScopeMark label="Scholarly essay">
							<div className="flex flex-col gap-4 font-mono text-body leading-relaxed text-gray-500">
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam, quis nostrud exercitation ullamco
									laboris nisi ut aliquip ex ea commodo consequat.
								</p>
								<p>
									Duis aute irure dolor in reprehenderit in voluptate velit esse
									cillum dolore eu fugiat nulla pariatur. Excepteur sint
									occaecat cupidatat non proident, sunt in culpa qui officia
									deserunt mollit anim id est laborum.
								</p>
								<p>
									Sed ut perspiciatis unde omnis iste natus error sit voluptatem
									accusantium doloremque laudantium, totam rem aperiam, eaque
									ipsa quae ab illo inventore veritatis et quasi architecto
									beatae vitae dicta sunt explicabo.
								</p>
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Related works (real sample-doc pool) */}
				{related.length > 0 && (
					<RelatedWorksSection
						related={related}
						currentDoc={doc}
						slugById={slugById}
					/>
				)}

				{/* Visually similar [placeholder]: reuses the related pool. */}
				{related.length > 0 && (
					<ScopeMark label="Visually similar">
						<VisuallySimilarGrid candidates={related} slugById={slugById} />
					</ScopeMark>
				)}

				{/* Rights & citation */}
				<WireframeSection
					label="Rights & citation"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<span id="rights-citation" className="sr-only">
							Rights & citation
						</span>
						<SectionLabel className="mb-4">Rights & citation</SectionLabel>
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
								<TombstoneLabel className="mb-1 block">
									Copyright
								</TombstoneLabel>
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
								<p className="whitespace-pre-line font-mono text-meta text-gray-600">
									{suggestedCitation}
								</p>
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Educational resources [placeholder] */}
				<WireframeSection
					label="Educational resources"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<span id="educational-resources" className="sr-only">
							Educational resources
						</span>
						<SectionLabel className="mb-4">
							Educational resources [placeholder]
						</SectionLabel>
						<ScopeMark label="Educational resources">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{[1, 2, 3].map((i) => (
									<Link
										key={i}
										href="/educational-resources"
										className="border border-gray-300 p-4 hover:border-gray-500"
									>
										<span className="inline-block border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-label text-blue-700">
											Lesson plan
										</span>
										<p className="mt-2 font-mono text-body text-gray-700">
											Lesson plan: {doc.classification ?? "Object"} in context{" "}
											{i}
										</p>
										<p className="mt-1 font-mono text-label text-gray-400">
											[placeholder]
										</p>
									</Link>
								))}
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Data disclaimer */}
				<Container className="py-4">
					<ScopeMark label="Data disclaimer">
						<p className="font-mono text-label text-gray-500">
							Data may be incomplete or under review. Last updated:{" "}
							{lastUpdated.slice(0, 10)}
						</p>
					</ScopeMark>
				</Container>

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
