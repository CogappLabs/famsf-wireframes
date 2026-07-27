import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	Container,
	ScopeMark,
	SectionLabel,
	TombstoneLabel,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import JumpToNav from "@/components/wireframe/JumpToNav";
import {
	ChildRecordsSection,
	ImageSection,
	RelatedWorksSection,
	RightsCitationSection,
	ScholarlyRecordSections,
} from "@/components/wireframe/object-detail";
import TomatoEasterEgg from "@/components/wireframe/TomatoEasterEgg";
import {
	allMedia,
	alternateTitles,
	isPublicDomain,
	placeAncestry,
} from "@/lib/collection-document";
import { constituentSlugById } from "@/lib/constituent-samples-registry";
import {
	findSampleBySlug,
	loadSampleDocs,
	objectSlugById,
} from "@/lib/sample-docs-registry";
import { t } from "@/lib/strings";
import {
	formatImageCaption,
	formatIsoDate,
	normaliseDateRange,
	normaliseTitle,
} from "@/lib/text-format";
import { ScopePage } from "@/providers/ScopeProvider";

// ── Variant registry ──────────────────────────────────────────────────
// Slugs and docs are auto-discovered from src/data/sample-docs/*.json.
// To add a new sample: drop the JSON in, no code edit required.

// The pipeline slug is `{accession}/{title-slug}`, so it spans two path
// segments and the route has to be a catch-all.
export function generateStaticParams() {
	return loadSampleDocs().map((e) => ({ variant: e.slug.split("/") }));
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Convert a snake_case field name to a human-readable label. */
/**
 * Keep only the "Overall:" element of a raw dimensions string, dropping the
 * secondary elements (Framed, Sheet, Mount, …) that follow it. Falls back to
 * the whole string when no "Overall:" element is present.
 */
function overallDimensions(dims: string): string {
	const match = dims.match(/Overall:\s*(.+?)(?=\s+\p{Lu}[\p{L} ]*:|$)/u);
	return match ? match[1].trim() : dims;
}

function humaniseFieldName(field: string): string {
	return field
		.replace(/^term_/, "")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** term_* field keys in preferred display order.
 * Period/Reign/Dynasty/Style/Movement/School and Subject are omitted per the
 * FAMSF object-page field-exclusion list (Style/period/movement, Subject tags). */
const TERM_FIELDS = [
	"term_place_of_creation",
	"term_place_of_fabrication",
	"term_place_name_at_creation",
	"term_related_geography",
	"term_find_spot",
	"term_materials",
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

type Props = { params: Promise<{ variant: string[] }> };

export default async function SampleObjectPage({ params }: Props) {
	const { variant } = await params;
	const entry = findSampleBySlug(variant.join("/"));
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
	const displayDate = normaliseDateRange(doc.date_display ?? undefined);

	// Alternate titles (exclude the primary, which is already doc.title)
	const alternates = alternateTitles(doc);

	// Group constituents by role, sorted by lowest display_order in each group.
	// Deduped on constituent id + role: TMS object xrefs can repeat a person.
	const constituents = doc.constituents ?? [];
	const seenConstituents = new Set<string>();
	const uniqueConstituents = constituents.filter((c) => {
		const key = `${c.id}-${c.role}`;
		if (seenConstituents.has(key)) return false;
		seenConstituents.add(key);
		return true;
	});

	const constituentsByRole = uniqueConstituents.reduce<
		Map<string, typeof uniqueConstituents>
	>((map, c) => {
		const group = map.get(c.role) ?? [];
		group.push(c);
		map.set(c.role, group);
		return map;
	}, new Map());

	const sortedRoles = [...constituentsByRole.entries()].sort(
		([, a], [, b]) =>
			Math.min(...a.map((c) => c.display_order)) -
			Math.min(...b.map((c) => c.display_order)),
	);

	const hasConstituents = uniqueConstituents.length > 0;
	const exhibitionLines = doc.exhibition_history_lines ?? [];
	const hasExhibitions = exhibitionLines.length > 0;
	const physicalChildIds = doc.physical_child_ids ?? [];
	const mediumParts = doc.medium_parts ?? [];
	const hasDescription = !!doc.web_text;
	const onViewLocation =
		doc.on_view && (doc.location_building || doc.location_room)
			? [doc.location_building, doc.location_room].filter(Boolean).join(", ")
			: null;

	const slugById = objectSlugById();
	const constituentSlugs = constituentSlugById();

	// Parent pointer: the index serves virtual_parent_ids only (bare ids).
	const parentId = doc.virtual_parent_ids?.[0] ?? null;
	const parentSlug = parentId !== null ? (slugById[parentId] ?? null) : null;
	const parentHref = parentSlug ? `/objects/sample/${parentSlug}` : null;

	// Museum location only makes sense for something on display; a stored object
	// should not advertise a gallery it is not in.
	const museumLocation = doc.on_view
		? (doc.location_string ??
			doc.location_room ??
			doc.location_building ??
			null)
		: null;

	// Curated collections this object belongs to (the "named collection").
	const namedCollections = doc.highlights ?? [];

	// Rights status: drives whether the download placeholder is disabled.
	const publicDomain = isPublicDomain(doc);
	// Rights-holder attribution only. Null on public-domain works, where the
	// rights statement carries the legal status instead.
	const copyrightStatement = doc.copyright ?? null;

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
	const citationDate = normaliseDateRange(doc.date_display ?? undefined);
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

	// House-style image caption (rule 7): Artist, <title>, year. Medium,
	// dimensions. FAMSF, credit line, accession number. Photo credit. Drops the
	// ", courtesy of …" clause — that belongs only to the external "cite this
	// image" credit, not the on-page caption.
	const imageCaption = formatImageCaption({
		primary_artist: doc.primary_artist,
		title: doc.title,
		display_date: doc.date_display,
		medium: doc.medium,
		// Only the raw dimensions string is served, so take the "Overall:" element.
		dimensions: doc.dimensions ? overallDimensions(doc.dimensions) : null,
		credit_line: doc.credit_line,
		accession_number: doc.accession_number,
		photo_credit: doc.copyright,
	});

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

				{/* Parent record banner. The index serves the parent as a bare id
				    (no title or accession), so the label falls back to the id when
				    the parent is not among the loaded samples. */}
				{parentId !== null && (
					<ScopeMark label="Parent record">
						<Container className="border-b border-gray-200 bg-gray-50 py-3">
							<div className="flex items-center justify-between gap-3">
								<div>
									<TombstoneLabel>
										Part of &middot; Parent record
									</TombstoneLabel>
									<p className="font-mono text-meta text-gray-700">
										{parentHref ? (
											`Object ${parentId}`
										) : (
											<span className="text-gray-400">
												Object {parentId} is not in the current index.
											</span>
										)}
									</p>
								</div>
								{parentHref && (
									<Link
										href={parentHref}
										className="font-mono text-label tracking-wide text-gray-500 underline hover:text-gray-900"
									>
										View parent record &rarr;
									</Link>
								)}
							</div>
						</Container>
					</ScopeMark>
				)}

				{/* Image section: renders if there are visible images OR if images were hidden */}
				<ImageSection
					visibleMedia={visibleMedia}
					hiddenCount={hiddenCount}
					hasAnyImage={hasAnyImage}
					isPublicDomain={publicDomain}
					caption={imageCaption}
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

								{/* Compound-parent badge. The Virtual (Runway collection /
								    virtual parents) badge is intentionally not rendered per the
								    FAMSF field-exclusion list. */}
								{doc.is_compound && (
									<div className="mb-3 flex flex-wrap gap-2">
										<span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-label tracking-wider text-gray-500">
											Compound Parent
										</span>
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

								{alternates.length > 0 && (
									<ul className="mt-1.5 flex flex-col gap-0.5">
										{alternates.map((t) => (
											<li
												key={`${t.type}-${t.display_order}`}
												className="font-mono text-meta text-gray-500"
											>
												<span className="text-gray-400">{t.type}:</span>{" "}
												{t.title}
											</li>
										))}
									</ul>
								)}

								{/* Artist, date, and medium all route to a filtered search. */}
								{doc.primary_artist_display && (
									<p className="mt-1 font-mono text-body text-gray-700">
										<Link
											href={`/search-results?facet=artist&value=${encodeURIComponent(doc.primary_artist)}`}
											className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
										>
											{doc.primary_artist_display}
										</Link>
										<FieldSourceBadge field="primary_artist_display" />
									</p>
								)}
								{displayDate && (
									<p className="mt-0.5 font-mono text-meta text-gray-500">
										<Link
											href={`/search-results?facet=date&value=${encodeURIComponent(doc.date_display ?? "")}`}
											className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
										>
											{displayDate}
										</Link>
										<FieldSourceBadge field="date_display" />
										{doc.medium && (
											<>
												{" "}
												&middot;{" "}
												<Link
													href={`/search-results?facet=material&value=${encodeURIComponent(doc.medium)}`}
													className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
												>
													{doc.medium}
												</Link>
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
							<ChildRecordsSection physicalChildIds={physicalChildIds} />
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
									{/* didactic_label (Object label text / wall text) intentionally
									    not rendered per FAMSF field-exclusion list */}
								</WireframeSection>
							)}

							{/* 2. Tombstone info (Level 1) — one flat field list, no
							    per-category sub-headers, so the core info reads as a single
							    tombstone with deeper-dive sections below. */}
							<WireframeSection label="Tombstone">
								<SectionLabel className="mb-4">Object details</SectionLabel>
								<div className="flex flex-col gap-2.5">
									{doc.date_display && (
										<TombstoneField
											label="Date"
											value={doc.date_display}
											href={`/search-results?facet=date&value=${encodeURIComponent(doc.date_display)}`}
											field="date_display"
										/>
									)}
									{doc.medium && (
										<div>
											<TombstoneField
												label="Medium"
												value={doc.medium}
												href={`/search-results?facet=material&value=${encodeURIComponent(doc.medium)}`}
												field="medium"
											/>
											{/* medium_parts chips: only when more than one part */}
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
									{doc.edition && (
										<TombstoneField
											label="Edition"
											value={doc.edition.trim()}
											field="edition"
										/>
									)}
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
											label="Object type"
											value={doc.classification}
											href={`/search-results?facet=classification&value=${encodeURIComponent(doc.classification)}`}
											field="classification"
										/>
									)}

									{/* Attribute term_* fields inline in the tombstone.
									    Geography fields are Tier 1 public per guidelines;
									    non-geography (Materials / Intended Market / …) are
									    Phase 2, gated via ScopeMark pending Tier-policy confirm. */}
									{hasTerms &&
										populatedTermGroups.map(({ field, label, entries }) => {
											const isGeo = GEOGRAPHY_TERM_FIELDS.has(
												field as TermField,
											);
											const inner = (
												<>
													<TombstoneLabel>{label}</TombstoneLabel>
													<FieldSourceBadge field={field} />
													{/* Each entry is its own bordered row: multiple places
													    ran together as plain lines were hard to tell apart. */}
													<ul className="mt-1 flex flex-col gap-2">
														{entries.map((entry) => {
															const showCertainty =
																entry.certainty &&
																entry.certainty !== "(not assigned)" &&
																entry.certainty !== "";
															// Specific to general, per curator feedback. The raw
															// Getty path runs the other way and starts at "World".
															const ancestry = placeAncestry(entry);
															return (
																<li
																	key={`${field}-${entry.term}`}
																	className="border-l-2 border-gray-200 pl-2.5 font-mono text-meta text-gray-700"
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
																	{ancestry.length > 0 && (
																		<span className="mt-0.5 block text-label text-gray-400">
																			{ancestry.map((n, i) => (
																				<span key={n.cn || n.term}>
																					{i > 0 && (
																						<span className="text-gray-300">
																							{", "}
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
									{/* Museum location only when the object is on display. */}
									{museumLocation && (
										<ScopeMark label="Museum location">
											<TombstoneField
												label="Museum location"
												value={museumLocation}
												field="location_string"
											/>
										</ScopeMark>
									)}

									{/* object_rights_type intentionally not shown per curator
									    feedback; copyright statement is kept. */}
									{doc.copyright && (
										<TombstoneField
											label="Copyright"
											value={doc.copyright}
											field="copyright"
										/>
									)}
								</div>
							</WireframeSection>

							{/* Additional information: the deeper-dive fields curators asked
							    to keep out of the main tombstone. Inscriptions and Signed are
							    listed but unavailable, as the index does not serve them. */}
							<WireframeSection label="Additional information">
								<details className="group">
									<summary className="cursor-pointer list-none">
										<SectionLabel className="inline-flex items-center">
											<span className="mr-1 inline-block transition-transform group-open:rotate-90">
												▸
											</span>
											Additional information
										</SectionLabel>
									</summary>
									<div className="mt-4 flex flex-col gap-2.5">
										{namedCollections.length > 0 && (
											<div>
												<TombstoneLabel>Named collection</TombstoneLabel>
												<FieldSourceBadge field="highlights" />
												{/* Not linked: the search-results Collection facet is the
												    FAMSF Collecting Area, a different grouping that has no
												    TMS field yet. Curated highlights have no facet of their
												    own to filter on. */}
												<ul className="mt-0.5 flex flex-col gap-0.5">
													{namedCollections.map((c) => (
														<li
															key={c.collection_slug}
															className="font-mono text-meta text-gray-700"
														>
															{c.collection_name}
														</li>
													))}
												</ul>
											</div>
										)}
										{doc.accession_iso_date && (
											<TombstoneField
												label="Accession date"
												value={formatIsoDate(doc.accession_iso_date)}
												field="accession_iso_date"
											/>
										)}
										{doc.medium && (
											<TombstoneField
												label="Material"
												value={doc.medium}
												href={`/search-results?facet=material&value=${encodeURIComponent(doc.medium)}`}
												field="medium"
											/>
										)}
										{/* Inscription(s) + Signed belong here per the field list,
										    but the index does not serve them yet. */}
										{doc.department && (
											<TombstoneField
												label="Department"
												value={doc.department}
												href={`/search-results?facet=department&value=${encodeURIComponent(doc.department)}`}
												field="department"
											/>
										)}
										{alternates.length > 0 && (
											<div>
												<TombstoneLabel>Alternate title</TombstoneLabel>
												<FieldSourceBadge field="titles" />
												<ul className="mt-0.5 flex flex-col gap-0.5">
													{alternates.map((t) => (
														<li
															key={`alt-${t.type}-${t.display_order}`}
															className="font-mono text-meta text-gray-700"
														>
															{t.title}
															<span className="ml-1.5 text-gray-400">
																({t.type})
															</span>
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</details>
							</WireframeSection>

							{/* 3. Dimensions */}
							{doc.dimensions && (
								<WireframeSection label="Dimensions">
									<span id="dimensions" className="sr-only">
										Dimensions
									</span>
									<SectionLabel className="mb-4">Dimensions</SectionLabel>
									<FieldSourceBadge field="dimensions" block />
									<p className="font-mono text-meta text-gray-700">
										{overallDimensions(doc.dimensions)}
									</p>
								</WireframeSection>
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
														.sort((a, b) => a.display_order - b.display_order)
														.map((c) => (
															<div
																key={`${c.id}-${c.role}`}
																className="border-l-2 border-gray-200 pl-3"
															>
																<p className="font-mono text-meta font-medium text-gray-700">
																	{/* Attribution qualifier ("Attributed to",
																	    "Possibly") sits ahead of the name. */}
																	{c.attribution_prefix && (
																		<span className="font-normal text-gray-500">
																			{c.attribution_prefix}{" "}
																		</span>
																	)}
																	{constituentSlugs[c.id] ? (
																		<Link
																			href={`/constituents/sample/${constituentSlugs[c.id]}`}
																			className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
																		>
																			{c.name}
																		</Link>
																	) : (
																		c.name
																	)}
																</p>
																{/* `dates` usually already leads with the
																    nationality ("French, 1840-1926"), so only add
																    it when it is not already there. */}
																{(() => {
																	const parts =
																		c.dates && c.nationality
																			? c.dates.includes(c.nationality)
																				? [c.dates]
																				: [c.nationality, c.dates]
																			: [c.nationality, c.dates].filter(
																					Boolean,
																				);
																	if (parts.length === 0) return null;
																	return (
																		<p className="font-mono text-label text-gray-500">
																			{parts.join(" · ")}
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

							{/* Provenance → Exhibition history → Bibliography.
							    ScholarlyRecordSections renders the three dense record blocks
							    in spec order. Each block still draws its own divider + wide
							    container, sitting inside the main column. */}
							<ScholarlyRecordSections
								exhibitionLines={exhibitionLines}
								hasExhibitions={hasExhibitions}
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
								isPublicDomain={publicDomain}
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

				{/* Document metadata footer */}
				<Container className="py-6">
					<div className="border border-gray-200 bg-gray-50 px-4 py-3">
						<p className="font-mono text-label text-gray-500">
							Pipeline document &middot; id {doc.id}
							{doc.last_modified && (
								<> &middot; updated {doc.last_modified.slice(0, 10)}</>
							)}{" "}
							&middot;{" "}
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
