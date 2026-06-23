import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	Container,
	ExternalLink,
	ScopeMark,
	SectionLabel,
	TombstoneLabel,
	TranscriptionList,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import JumpToNav from "@/components/wireframe/JumpToNav";
import {
	ChildRecordsSection,
	ImageSection,
	RelatedWorksSection,
	RightsCitationSection,
	ScaleDiagram,
	ScholarlyRecordSections,
} from "@/components/wireframe/object-detail";
import TomatoEasterEgg from "@/components/wireframe/TomatoEasterEgg";
import { allMedia } from "@/lib/collection-document";
import { constituentSlugById } from "@/lib/constituent-samples-registry";
import {
	findSampleBySlug,
	loadSampleDocs,
	objectSlugById,
} from "@/lib/sample-docs-registry";
import { t } from "@/lib/strings";
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
 * All other Attributes are "Phase 2" per Attributes section. */
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
			<h3 className="mb-3 border-b border-gray-200 pb-1.5 font-mono text-label tracking-wide text-gray-500">
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
	const childCards = doc.child_cards ?? [];
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
			<TomatoEasterEgg />
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
									className="font-mono text-label tracking-wide text-gray-500 underline hover:text-gray-900"
								>
									View parent record &rarr;
								</Link>
							</div>
						</Container>
					</ScopeMark>
				)}

				{/* Image section: renders if there are visible images OR if images were hidden */}
				<ImageSection
					visibleMedia={visibleMedia}
					hiddenCount={hiddenCount}
					hasAnyImage={hasAnyImage}
					isPublicDomain={isPublicDomain}
				/>
				{/* Jump-to nav: sits between the image gallery and the title so it's
				 the first thing to pin; the tombstone + deep content scroll under it. */}
				<ScopeMark
					label="Jump-to navigation"
					className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur"
				>
					<Container className="py-2">
						{/* Pared to the substantive deep-scroll destinations. Short or
						    tail sections (Image, Dimensions, Audio, Related, Educational)
						    are reachable by scrolling and left out to keep the bar short. */}
						<JumpToNav
							items={[
								// "Object" / tombstone anchor dropped from the bar: after the
								// two-column rebuild the title block sits in the left rail at
								// the top of the body, so the pill scrolled nowhere useful.
								// Order MUST match the main-column DOM order so scroll-spy +
								// click-to-scroll stay monotonic: about -> people ->
								// additional info -> provenance -> exhibitions ->
								// bibliography -> rights & citation.
								...(hasDescription
									? [{ label: t("object.jumpAbout"), id: "about" }]
									: []),
								...(hasConstituents
									? [{ label: t("object.jumpPeople"), id: "constituents" }]
									: []),
								...(doc.has_provenance
									? [{ label: t("object.jumpProvenance"), id: "provenance" }]
									: []),
								...(hasExhibitions
									? [{ label: t("object.jumpExhibitions"), id: "exhibitions" }]
									: []),
								...(doc.bibliography_text
									? [
											{
												label: t("object.jumpBibliography"),
												id: "bibliography",
											},
										]
									: []),
								{
									label: t("object.jumpRightsCitation"),
									id: "rights-citation",
								},
							]}
						/>
					</Container>
				</ScopeMark>
				{/* ── Band 2: two-column body ─────────────────────────────────
				    Narrow left rail (summary + audio + parent-child) pins while the
				    wide right main column scrolls. Stacks to a single column below
				    lg, left rail first. June 18 2026 page-layouts spec. */}
				<Container className="border-b border-gray-300 py-8">
					<div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
						{/* LEFT RAIL */}
						<aside className="flex flex-col gap-6 lg:sticky lg:top-16 lg:self-start">
							{/* 1. Title + subtitle block (relocated tombstone header) */}
							<div>
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
											<span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label tracking-wider text-gray-500">
												Compound Parent
											</span>
										)}
										{doc.is_virtual && (
											<span className="inline-block rounded bg-amber-50 px-2 py-0.5 font-mono text-label tracking-wider text-amber-700">
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
									<p className="mt-1 font-mono text-body text-gray-700">
										{doc.primary_artist_display}
										<FieldSourceBadge field="primary_artist_display" />
									</p>
								)}
								{displayDate && (
									<p className="mt-0.5 font-mono text-meta text-gray-500">
										{displayDate}
										<FieldSourceBadge field="display_date" />
										{doc.medium && (
											<>
												{" "}
												&middot; {doc.medium}
												<FieldSourceBadge field="medium" />
											</>
										)}
									</p>
								)}
							</div>

							{/* 2. On view status + location: distinct left-rail box.
							    The on-view line is shown only here (not also in the title
							    block above) to avoid duplicating venue + gallery. */}
							{onViewLocation && (
								<div className="border border-gray-200 bg-gray-50 px-3 py-2.5">
									<TombstoneLabel className="block">On view</TombstoneLabel>
									<p className="mt-0.5 flex items-center gap-1.5 font-mono text-meta text-emerald-700">
										<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
										{onViewLocation}
										<FieldSourceBadge field="location_building" />
										<FieldSourceBadge field="location_room" />
									</p>
								</div>
							)}

							{/* 3. Audio guide [placeholder] (relocated up from the tail) */}
							<WireframeSection label="Audio guide">
								<span id="audio-guide" className="sr-only">
									Audio guide
								</span>
								<SectionLabel className="mb-3">Audio guide</SectionLabel>
								<ScopeMark label="Audio guide">
									<div className="flex items-center gap-3 border border-gray-300 p-3">
										<button
											type="button"
											aria-label="Play audio guide"
											className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-400 font-mono text-card text-gray-600 hover:border-gray-700 hover:bg-gray-50"
										>
											▶
										</button>
										<div className="flex flex-1 flex-col gap-2">
											<div className="flex items-baseline justify-between gap-2">
												<p className="font-mono text-meta font-medium text-gray-700">
													Curator's commentary
												</p>
												<p className="font-mono text-label text-gray-400">
													0:00 / 2:14
												</p>
											</div>
											<div className="h-1 w-full bg-gray-200">
												<div className="h-full w-0 bg-gray-500" />
											</div>
											<div className="flex items-baseline justify-between gap-2">
												<p className="font-mono text-label text-gray-500">
													Recorded by [curator name]. Transcript available.
												</p>
												{/* Copy/paste affordance (June 18 request): lets visitors
												    lift the transcript text. Non-functional placeholder. */}
												<button
													type="button"
													className="shrink-0 border border-gray-300 px-2 py-0.5 font-mono text-label tracking-wide text-gray-500 hover:border-gray-500"
												>
													{t("object.copyTranscript")}
												</button>
											</div>
										</div>
									</div>
								</ScopeMark>
							</WireframeSection>

							{/* 4. Parent-child module (relocated up from the tail) */}
							<ChildRecordsSection
								childCards={childCards}
								physicalChildIds={physicalChildIds}
								virtualChildIds={virtualChildIds}
							/>
						</aside>

						{/* RIGHT MAIN COLUMN */}
						<div className="flex flex-col gap-10">
							{/* 1. Web text (Description) — top of the main column */}
							{hasDescription && (
								<WireframeSection label="Description">
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
													className="font-mono text-body leading-relaxed text-gray-700 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
													// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
													dangerouslySetInnerHTML={{
														__html: sanitiseHtml(doc.web_text),
													}}
												/>
											</div>
										</ScopeMark>
									)}
									{doc.didactic_label &&
										doc.didactic_label !== doc.web_text && (
											<div>
												<ScopeMark label="Didactic label">
													<TombstoneLabel className="mb-1 block">
														Didactic label
													</TombstoneLabel>
													<FieldSourceBadge field="didactic_label" block />
													<p
														className="font-mono text-body leading-relaxed text-gray-700 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
														// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
														dangerouslySetInnerHTML={{
															__html: sanitiseHtml(doc.didactic_label),
														}}
													/>
												</ScopeMark>
											</div>
										)}
								</WireframeSection>
							)}

							{/* 2. Tombstone info (Level 1) — the groups grid (header moved to rail) */}
							<WireframeSection label="Tombstone">
								<SectionLabel className="mb-4">Object details</SectionLabel>
								<div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
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
																	className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label text-gray-500"
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
													label="Collection area"
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
												const isGeo = GEOGRAPHY_TERM_FIELDS.has(
													field as TermField,
												);
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
										{/* Alternate / legacy accession number (sort_number when it
										    differs from the primary accession). */}
										{doc.sort_number &&
											doc.sort_number !== doc.accession_number && (
												<TombstoneField
													label="Alternate accession number"
													value={doc.sort_number}
													field="sort_number"
												/>
											)}
										{/* Accession date: guidelines mark it internal-only, so gate
										    behind the scope toggle pending Tier-policy confirm. */}
										{doc.accession_iso_date && (
											<ScopeMark label="Accession date (pending Tier policy confirm)">
												<TombstoneField
													label="Accession date"
													value={doc.accession_iso_date.slice(0, 10)}
													field="accession_iso_date"
												/>
											</ScopeMark>
										)}
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

							{/* 3. Dimensions */}
							{hasDimensions && (
								<WireframeSection label="Dimensions">
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
								</WireframeSection>
							)}

							{/* 3b. Scale diagram */}
							{doc.dimensions && (
								<ScopeMark label="Scale">
									<ScaleDiagram obj={doc} />
								</ScopeMark>
							)}

							{/* 4. People (constituents) */}
							{hasConstituents && (
								<WireframeSection label="People">
									<span id="constituents" className="sr-only">
										People
									</span>
									<SectionLabel className="mb-4">
										{t("object.sectionPeople")}
									</SectionLabel>
									<FieldSourceBadge field="constituents" block />
									<div className="flex flex-col gap-5">
										{sortedRoles.map(([role, members]) => (
											<div key={role}>
												<h3 className="mb-2 font-mono text-label tracking-wide text-gray-500">
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
								</WireframeSection>
							)}

							{/* Additional information (accession date + alternate accession)
							    was folded into the Acquisition tombstone group; the separate
							    expandable held too little to justify its own section. */}

							{/* Provenance → Exhibition history → Bibliography.
							    ScholarlyRecordSections renders the three dense record blocks
							    in spec order. Each block still draws its own divider + wide
							    container, sitting inside the main column. */}
							<ScholarlyRecordSections
								exhibitions={doc.exhibitions}
								hasExhibitions={hasExhibitions}
								exhibitionHistoryHtml={
									doc.exhibition_history_text
										? sanitiseHtml(doc.exhibition_history_text)
										: null
								}
								hasProvenance={doc.has_provenance}
								provenanceStructured={doc.provenance_structured ?? null}
								provenanceRaw={doc.provenance ?? null}
								bibliographyText={doc.bibliography_text ?? null}
							/>

							{/* 7. Long-form scholarly publications [expandable, placeholder]:
							    in-depth curatorial essays for select highlights. No dedicated
							    pipeline field today (data source TBD, distinct from the
							    bibliography). Always rendered as a placeholder per the layout. */}
							<WireframeSection label="Scholarly publications">
								<span id="scholarly-publications" className="sr-only">
									Scholarly publications
								</span>
								<ScopeMark label="Scholarly publications">
									<details className="group">
										<summary className="cursor-pointer list-none">
											<SectionLabel className="inline-flex items-center">
												<span className="mr-1 inline-block transition-transform group-open:rotate-90">
													▸
												</span>
												{t("object.scholarlyHeading")}
											</SectionLabel>
										</summary>
										<p className="mt-4 font-mono text-body leading-relaxed text-gray-500">
											{t("object.scholarlyPlaceholder")}
										</p>
									</details>
								</ScopeMark>
							</WireframeSection>

							{/* Rights & citation: spec folds rights into image + tombstone
							    and shows no standalone rights section in the body. Kept as a
							    useful MVP grouping (CW-52) at the end of the main column. */}
							<RightsCitationSection
								rightsStatementDisplay={rightsStatementDisplay}
								isPublicDomain={isPublicDomain}
								copyrightStatement={copyrightStatement}
								suggestedCitation={suggestedCitation}
							/>
						</div>
					</div>
				</Container>

				{/* ── Band 3: full-width recirculation + meta ─────────────────── */}

				{/* Related works (real sample-doc pool) */}
				{related.length > 0 && (
					<RelatedWorksSection
						related={related}
						currentDoc={doc}
						slugById={slugById}
					/>
				)}

				{/* Data disclaimer */}
				<Container className="py-4">
					<ScopeMark label="Data disclaimer">
						<p className="font-mono text-label text-gray-500">
							Data may be incomplete or under review. Last updated:{" "}
							{lastUpdated.slice(0, 10)}
							{" · "}
							{/* Error reporting on the data-accuracy disclaimer (June 18
							    layout). mailto placeholder; production routes to the
							    rights & reproductions / data-quality inbox. */}
							<ExternalLink
								href="mailto:collections@famsf.org?subject=Data%20correction"
								className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
							>
								{t("object.contactLink")}
							</ExternalLink>
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
