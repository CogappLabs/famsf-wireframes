"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import JumpToNav from "@/components/wireframe/JumpToNav";
import {
	ConstituentList,
	EditorialColumn,
	InCopyrightModal,
	PhysicalDescription,
	RelatedWorksSection,
	ScaleDiagram,
	VisuallySimilarGrid,
} from "@/components/wireframe/object-detail";
import {
	type CopyrightStatus,
	type GeoXref,
	getExhibitions,
	getObject,
	getRelatedObjects,
	objects,
	type SampleObject,
} from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const LAYOUT_VARIATIONS = [
	{ key: "standard", label: "Standard" },
	{ key: "two-column", label: "Two-column" },
] as const;

function TombstoneGroup({
	label,
	children,
	className = "",
}: {
	label: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={className}>
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
}: {
	label: string;
	value: string;
	href?: string;
}) {
	return (
		<div>
			<span className="font-mono text-label uppercase tracking-wide text-gray-400">
				{label}
			</span>
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

const COPYRIGHT_DISPLAY: Record<
	CopyrightStatus,
	{ icon: string; labelKey: string; tone: string }
> = {
	"public-domain": {
		icon: "PD",
		labelKey: "object.rightsNoCopyright",
		tone: "border-green-300 bg-green-50 text-green-800",
	},
	"in-copyright": {
		icon: "©",
		labelKey: "object.rightsInCopyright",
		tone: "border-amber-300 bg-amber-50 text-amber-800",
	},
	"copyright-unknown": {
		icon: "?",
		labelKey: "object.rightsCopyrightUnknown",
		tone: "border-gray-300 bg-gray-50 text-gray-700",
	},
};

const GEO_TYPE_ORDER: Record<string, number> = {
	Path: 0,
	"Find Site": 1,
	Place: 2,
	Region: 3,
};

function sortedGeo(geo: GeoXref[] | undefined): GeoXref[] {
	if (!geo) return [];
	return [...geo].sort(
		(a, b) =>
			(GEO_TYPE_ORDER[a.type ?? "Place"] ?? 99) -
			(GEO_TYPE_ORDER[b.type ?? "Place"] ?? 99),
	);
}

function ObjectDetailContent() {
	const variation = usePageVariations(LAYOUT_VARIATIONS);
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	// Fall back to first object if no id
	const obj: SampleObject = getObject(id ?? "") ?? objects[0];
	const exhs = getExhibitions(obj.id);
	const [showCopyrightModal, setShowCopyrightModal] = useState(false);
	const related = getRelatedObjects(obj);

	const galleryImages =
		obj.images && obj.images.length > 0
			? obj.images
			: [
					{ label: "Front", altText: "" },
					{ label: "Detail", altText: "" },
					{ label: "Frame", altText: "" },
				];
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const safeIndex = Math.min(selectedImageIndex, galleryImages.length - 1);
	const selectedImage = galleryImages[safeIndex];

	return (
		<ScopePage id="object-detail">
			{showCopyrightModal && (
				<InCopyrightModal onClose={() => setShowCopyrightModal(false)} />
			)}
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: obj.department, href: "/collection-area" },
							{ label: obj.title },
						]}
					/>
				</Container>

				{/* SEO landing context — present everywhere, scope-marked so
				    stakeholders can verify the page works for direct-from-Google
				    visitors without prior browse context. */}
				<ScopeMark label="SEO landing context">
					<span aria-hidden="true" className="sr-only" />
				</ScopeMark>

				{/* Parent record banner */}
				{obj.parent && (
					<ScopeMark label="Parent record">
						<Container className="border-b border-gray-200 bg-gray-50 py-3">
							<div className="flex items-center justify-between gap-3">
								<div>
									<span className="font-mono text-label uppercase tracking-wide text-gray-400">
										{t("object.partOfHeading")} &middot; {obj.parent.type}
									</span>
									<p className="font-mono text-meta text-gray-700">
										{obj.parent.title}
									</p>
								</div>
								<Link
									href={`/parent-record?id=${obj.parent.id}`}
									className="font-mono text-label uppercase tracking-wide text-gray-600 underline hover:text-gray-900"
								>
									{t("object.viewParentRecord")} &rarr;
								</Link>
							</div>
						</Container>
					</ScopeMark>
				)}

				{/* Jump-to navigation */}
				<ScopeMark label="Jump-to navigation">
					<Container className="border-b border-gray-200 py-2">
						<JumpToNav
							items={[
								{ label: t("object.tombstoneHeading"), id: "tombstone" },
								{ label: t("object.labelTextHeading"), id: "about" },
								{ label: t("object.physicalHeading"), id: "physical" },
								{ label: t("object.constituentsHeading"), id: "constituents" },
								{ label: t("object.provenanceHeading"), id: "provenance" },
								{ label: t("object.exhibitionsHeading"), id: "exhibitions" },
								{ label: t("object.mediaHeading"), id: "media" },
								{ label: t("object.relatedHeading"), id: "related" },
							]}
						/>
					</Container>
				</ScopeMark>

				{/* Image gallery */}
				<WireframeSection
					label="Image gallery"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<ImagePlaceholder
							aspect="16/9"
							label={`[${obj.title} \u2014 ${selectedImage.label} \u2014 high-res, zoomable (IIIF deep zoom)]`}
							className="border border-gray-300"
						/>
						{selectedImage.altText && (
							<ScopeMark label="Alt text">
								<div className="mt-2 border border-gray-200 bg-gray-50 px-3 py-2">
									<span className="font-mono text-label uppercase tracking-wide text-gray-400">
										{t("object.altTextLabel")}
									</span>
									<p className="mt-0.5 font-mono text-meta text-gray-600">
										{selectedImage.altText}
									</p>
								</div>
							</ScopeMark>
						)}
						<WireframeSection label="Image actions">
							<div className="mt-3 flex items-center gap-3">
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-500"
								>
									{t("object.zoomIn")}
								</button>
								<button
									type="button"
									onClick={() => {
										if (obj.copyrightStatus === "in-copyright") {
											setShowCopyrightModal(true);
										}
									}}
									className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-500"
								>
									{t("object.downloadImage")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-label uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-500"
								>
									{t("object.requestImage")}
								</button>
								<span className="ml-auto font-mono text-label text-gray-400">
									{safeIndex + 1} of {galleryImages.length} images
								</span>
							</div>
						</WireframeSection>

						{/* Thumbnail strip — click to swap the main image. */}
						<div className="mt-3 flex gap-2">
							{galleryImages.map((img, i) => {
								const active = i === safeIndex;
								return (
									<button
										key={img.label}
										type="button"
										onClick={() => setSelectedImageIndex(i)}
										aria-pressed={active}
										aria-label={`Show ${img.label} view`}
										title={img.altText || undefined}
										className={`w-20 transition-colors ${
											active
												? "border-2 border-gray-900"
												: "border border-gray-300 hover:border-gray-500"
										}`}
									>
										<ImagePlaceholder aspect="1/1" label={`[${img.label}]`} />
									</button>
								);
							})}
						</div>
					</Container>
				</WireframeSection>

				{/* About this work + Tombstone */}
				<Container className="border-b border-gray-300 py-8">
					<div className="flex flex-col gap-10">
						{/* Title block, quick actions, label text */}
						<WireframeSection label="Label text">
							<SectionLabel className="mb-2">{t("object.label")}</SectionLabel>
							<h1 className="font-mono text-page font-semibold leading-[1.15] tracking-tight">
								{obj.title}
							</h1>
							<p className="mt-1">
								{obj.attribution && (
									<ScopeMark label="Uncertainty qualifiers">
										<span className="font-mono text-body italic text-gray-400">
											{obj.attribution}{" "}
										</span>
									</ScopeMark>
								)}
								<Link
									href={`/artist-page?name=${encodeURIComponent(obj.artist)}`}
									className="font-mono text-body text-gray-600 underline decoration-gray-300 hover:decoration-gray-600"
								>
									{obj.artist}
								</Link>
							</p>
							{obj.artistDates && (
								<p className="font-mono text-meta text-gray-500">
									{obj.artistNationality}, {obj.artistDates}
								</p>
							)}
							<p className="mt-1 font-mono text-meta text-gray-400">
								{obj.date} &middot; {obj.medium}
							</p>

							{/* Quick actions */}
							<div className="mt-4 flex gap-2">
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-label text-gray-600"
								>
									{t("object.addToFavourites")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-label text-gray-600"
								>
									{t("object.shareRecord")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-label text-gray-600"
								>
									{t("object.printRecord")}
								</button>
							</div>

							{/* About this work */}
							{obj.labelText && (
								<div className="mt-6 border-t border-gray-200 pt-6">
									<div className="flex items-center gap-3">
										<SectionLabel>{t("object.labelTextHeading")}</SectionLabel>
										<ScopeMark label="Content source">
											<span className="border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-label text-gray-400">
												{t("object.contentSourceLabel")}
											</span>
										</ScopeMark>
									</div>
									<p className="mt-4 font-mono text-body leading-relaxed text-gray-600">
										{obj.labelText}
									</p>
								</div>
							)}
						</WireframeSection>

						{/* Tombstone metadata */}
						<WireframeSection label="Tombstone">
							<div className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-gray-200 pt-6 sm:grid-cols-2 lg:grid-cols-3">
								<TombstoneGroup label={t("object.tombstoneGroupCreation")}>
									<TombstoneField
										label={t("object.fieldDate")}
										value={obj.date}
										href={
											obj.dateBegin || obj.dateEnd
												? `/search-results?${new URLSearchParams({
														dateBegin: String(
															obj.dateBegin ?? obj.dateEnd ?? "",
														),
														dateEnd: String(obj.dateEnd ?? obj.dateBegin ?? ""),
													}).toString()}`
												: `/search-results?q=${encodeURIComponent(obj.date)}`
										}
									/>
									<TombstoneField
										label={t("object.fieldMedium")}
										value={obj.medium}
										href="/search-results"
									/>
									{obj.technique && (
										<TombstoneField
											label={t("object.fieldTechnique")}
											value={obj.technique}
											href="/search-results"
										/>
									)}
									{obj.dimensionsStructured &&
									obj.dimensionsStructured.length > 0 ? (
										<div>
											<span className="font-mono text-label uppercase tracking-wide text-gray-400">
												{t("object.fieldDimensions")}
											</span>
											<ul className="mt-0.5 flex flex-col gap-0.5">
												{obj.dimensionsStructured.map((d) => (
													<li
														key={d.description}
														className="font-mono text-meta text-gray-700"
													>
														<span className="text-gray-500">
															{d.description}:{" "}
														</span>
														{d.displayDimensions}
													</li>
												))}
											</ul>
										</div>
									) : (
										<TombstoneField
											label={t("object.fieldDimensions")}
											value={obj.dimensions}
										/>
									)}
								</TombstoneGroup>

								{(obj.culture ||
									(obj.geography && obj.geography.length > 0) ||
									(obj.placeOfCreation && obj.placeOfCreation.length > 0)) && (
									<TombstoneGroup label={t("object.tombstoneGroupOrigin")}>
										{obj.culture && (
											<TombstoneField
												label={t("object.fieldCulture")}
												value={obj.culture}
												href="/search-results"
											/>
										)}
										{obj.placeOfCreation && obj.placeOfCreation.length > 0 && (
											<div>
												<span className="font-mono text-label uppercase tracking-wide text-gray-400">
													{t("object.fieldPlaceOfCreation")}
												</span>
												<div className="mt-0.5 flex flex-wrap items-baseline gap-x-1 font-mono text-meta text-gray-700">
													{obj.placeOfCreation.map((p, i, arr) => (
														<span key={p} className="flex items-baseline gap-1">
															<Link
																href="/search-results"
																className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
															>
																{p}
															</Link>
															{i < arr.length - 1 && (
																<span className="text-gray-400">›</span>
															)}
														</span>
													))}
												</div>
											</div>
										)}
										{obj.geography && obj.geography.length > 0 && (
											<div>
												<span className="font-mono text-label uppercase tracking-wide text-gray-400">
													{t("object.fieldGeography")}
												</span>
												<ul className="mt-0.5 flex flex-col gap-0.5">
													{sortedGeo(obj.geography).map((g) => (
														<li
															key={`${g.type ?? ""}-${g.place}`}
															className="flex items-baseline gap-2"
														>
															{g.type && (
																<span className="font-mono text-label uppercase tracking-wide text-gray-400">
																	{g.type}
																</span>
															)}
															<Link
																href="/search-results"
																className="font-mono text-meta text-gray-700 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
															>
																{g.place}
																{g.certainty && (
																	<span className="text-gray-400">
																		{" "}
																		({g.certainty})
																	</span>
																)}
															</Link>
														</li>
													))}
												</ul>
											</div>
										)}
									</TombstoneGroup>
								)}

								<TombstoneGroup
									label={t("object.tombstoneGroupClassification")}
								>
									{obj.departments && obj.departments.length > 1 ? (
										<div>
											<span className="font-mono text-label uppercase tracking-wide text-gray-400">
												{t("object.fieldDepartments")}
											</span>
											<div className="mt-0.5 flex flex-col gap-0.5">
												{obj.departments.map((d) => (
													<Link
														key={d}
														href="/collection-area"
														className="font-mono text-meta text-gray-700 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
													>
														{d}
													</Link>
												))}
											</div>
										</div>
									) : (
										<TombstoneField
											label={t("object.fieldDepartment")}
											value={obj.department}
											href="/collection-area"
										/>
									)}
									<TombstoneField
										label={t("object.fieldClassification")}
										value={obj.classification}
										href="/search-results"
									/>
									{obj.subclassification && (
										<TombstoneField
											label={t("object.fieldSubclassification")}
											value={obj.subclassification}
										/>
									)}
								</TombstoneGroup>

								<TombstoneGroup label={t("object.tombstoneGroupAcquisition")}>
									<TombstoneField
										label={t("object.fieldCreditLine")}
										value={obj.creditLine}
										href="/search-results"
									/>
									{obj.accessionDate && (
										<TombstoneField
											label={t("object.fieldAccessionDate")}
											value={obj.accessionDate}
										/>
									)}
									{obj.onView && obj.gallery && (
										<ScopeMark label="Museum location">
											<TombstoneField
												label={t("object.fieldOnView")}
												value={obj.gallery}
											/>
										</ScopeMark>
									)}
								</TombstoneGroup>

								<TombstoneGroup label={t("object.tombstoneGroupIdentifiers")}>
									<TombstoneField
										label={t("object.fieldAccession")}
										value={obj.accession}
									/>
									{obj.alternateAccessions &&
										obj.alternateAccessions.length > 0 && (
											<TombstoneField
												label={t("object.fieldAlternateAccessions")}
												value={obj.alternateAccessions.join(", ")}
											/>
										)}
									{obj.edition && (
										<TombstoneField
											label={t("object.fieldEdition")}
											value={obj.edition}
										/>
									)}
									{obj.alternateTitles && obj.alternateTitles.length > 0 && (
										<TombstoneField
											label={t("object.fieldAlternateTitles")}
											value={obj.alternateTitles.join("; ")}
										/>
									)}
									{obj.objectNames && obj.objectNames.length > 0 && (
										<TombstoneField
											label={t("object.fieldObjectNames")}
											value={obj.objectNames.join("; ")}
											href="/search-results"
										/>
									)}
								</TombstoneGroup>

								{/* Attributes (chips) — span full grid row */}
								{(obj.keywords?.length ||
									obj.period ||
									obj.school ||
									obj.style ||
									obj.movement) && (
									<ScopeMark
										label="Attributes"
										className="sm:col-span-2 lg:col-span-3"
									>
										<TombstoneGroup label={t("object.attributesHeading")}>
											{obj.period && (
												<div className="flex items-center gap-2">
													<span className="font-mono text-label uppercase tracking-wide text-gray-400">
														{t("object.fieldPeriod")}
													</span>
													<Link
														href="/search-results"
														className="border border-gray-300 px-2 py-0.5 font-mono text-label text-gray-700 hover:border-gray-500"
													>
														{obj.period}
													</Link>
												</div>
											)}
											{obj.school && (
												<div className="flex items-center gap-2">
													<span className="font-mono text-label uppercase tracking-wide text-gray-400">
														{t("object.fieldSchool")}
													</span>
													<Link
														href="/search-results"
														className="border border-gray-300 px-2 py-0.5 font-mono text-label text-gray-700 hover:border-gray-500"
													>
														{obj.school}
													</Link>
												</div>
											)}
											{obj.style && (
												<div className="flex items-center gap-2">
													<span className="font-mono text-label uppercase tracking-wide text-gray-400">
														{t("object.fieldStyle")}
													</span>
													<Link
														href="/search-results"
														className="border border-gray-300 px-2 py-0.5 font-mono text-label text-gray-700 hover:border-gray-500"
													>
														{obj.style}
													</Link>
												</div>
											)}
											{obj.movement && (
												<div className="flex items-center gap-2">
													<span className="font-mono text-label uppercase tracking-wide text-gray-400">
														{t("object.fieldMovement")}
													</span>
													<Link
														href="/search-results"
														className="border border-gray-300 px-2 py-0.5 font-mono text-label text-gray-700 hover:border-gray-500"
													>
														{obj.movement}
													</Link>
												</div>
											)}
											{obj.keywords && obj.keywords.length > 0 && (
												<div>
													<span className="font-mono text-label uppercase tracking-wide text-gray-400">
														{t("object.fieldKeywords")}
													</span>
													<div className="mt-1 flex flex-wrap gap-1">
														{obj.keywords.map((k) => (
															<Link
																key={k}
																href="/search-results"
																className="border border-gray-300 px-2 py-0.5 font-mono text-label text-gray-700 hover:border-gray-500"
															>
																{k}
															</Link>
														))}
													</div>
												</div>
											)}
										</TombstoneGroup>
									</ScopeMark>
								)}
							</div>

							{/* Rights — full-width below grid */}
							<ScopeMark label="Rights & citation">
								<div className="mt-6 border-t border-gray-200 pt-6">
									<SectionLabel className="mb-2">
										{t("object.rightsHeading")}
									</SectionLabel>
									{(() => {
										const status: CopyrightStatus =
											obj.copyrightStatus ?? "copyright-unknown";
										const cfg = COPYRIGHT_DISPLAY[status];
										return (
											<div className="flex items-start gap-3">
												<div
													className={`flex h-10 w-10 shrink-0 items-center justify-center border font-mono text-meta font-semibold ${cfg.tone}`}
												>
													{cfg.icon}
												</div>
												<div>
													<p className="font-mono text-meta text-gray-700">
														{t(cfg.labelKey)}
													</p>
													{obj.copyrightHolder && (
														<p className="mt-0.5 font-mono text-label text-gray-500">
															{obj.copyrightHolder}
														</p>
													)}
													<p className="mt-0.5 font-mono text-label text-gray-400 underline">
														{t("object.rightsStatementLink")}
													</p>
												</div>
											</div>
										);
									})()}
								</div>
							</ScopeMark>
						</WireframeSection>
					</div>
				</Container>

				<PhysicalDescription obj={obj} />

				<ScaleDiagram obj={obj} />

				<ConstituentList constituents={obj.constituents} />

				<EditorialColumn />
				<VisuallySimilarGrid candidates={related} />

				{/* Scholarly essay */}
				<ScopeMark label="Scholarly essay">
					<WireframeSection
						label="Scholarly essay"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("object.scholarlyHeading")}
							</SectionLabel>
							<div className="flex h-32 items-center justify-center border border-dashed border-gray-300">
								<span className="font-mono text-meta text-gray-400">
									{t("object.scholarlyPlaceholder")}
								</span>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Provenance + Exhibitions */}
				{variation === "two-column" ? (
					<div className="border-t border-gray-300 py-8">
						<Container>
							<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
								<WireframeSection label="Provenance">
									<SectionLabel className="mb-4">
										{t("object.provenanceHeading")}
									</SectionLabel>
									<div className="space-y-2 font-mono text-meta text-gray-600">
										<p>[Provenance data for {obj.title}]</p>
									</div>
								</WireframeSection>

								{exhs.length > 0 && (
									<WireframeSection label="Exhibition history">
										<SectionLabel className="mb-4">
											{t("object.exhibitionsHeading")}
										</SectionLabel>
										<div className="flex flex-col gap-3">
											{exhs.map((exh) => (
												<div
													key={exh.title}
													className="border-l-2 border-gray-200 pl-3"
												>
													<p className="font-mono text-meta font-medium text-gray-700">
														{exh.title}
													</p>
													<p className="font-mono text-label text-gray-500">
														{exh.date} &middot; {exh.venue}
													</p>
												</div>
											))}
										</div>
									</WireframeSection>
								)}
							</div>
						</Container>
					</div>
				) : (
					<>
						<WireframeSection
							label="Provenance"
							className="border-t border-gray-300 py-8"
						>
							<Container size="md">
								<SectionLabel className="mb-4">
									{t("object.provenanceHeading")}
								</SectionLabel>
								<div className="space-y-2 font-mono text-meta text-gray-600">
									<p>[Provenance data for {obj.title}]</p>
								</div>
							</Container>
						</WireframeSection>

						{exhs.length > 0 && (
							<WireframeSection
								label="Exhibition history"
								className="border-t border-gray-300 py-8"
							>
								<Container size="md">
									<SectionLabel className="mb-4">
										{t("object.exhibitionsHeading")}
									</SectionLabel>
									<div className="flex flex-col gap-3">
										{exhs.map((exh) => (
											<div
												key={exh.title}
												className="border-l-2 border-gray-200 pl-3"
											>
												<p className="font-mono text-meta font-medium text-gray-700">
													{exh.title}
												</p>
												<p className="font-mono text-label text-gray-500">
													{exh.date} &middot; {exh.venue}
												</p>
											</div>
										))}
									</div>
								</Container>
							</WireframeSection>
						)}
					</>
				)}

				{/* Citation */}
				<WireframeSection
					label="Rights & citation"
					className="border-t border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("object.citationHeading")}
						</SectionLabel>
						<div className="border border-gray-200 bg-gray-50 p-4">
							<p className="font-mono text-meta text-gray-600">
								{obj.artist}, <em>{obj.title}</em>, {obj.date}, {obj.medium},{" "}
								{obj.dimensions}. Fine Arts Museums of San Francisco,{" "}
								{obj.creditLine}, {obj.accession}.
							</p>
							<button
								type="button"
								className="mt-2 font-mono text-label text-gray-500 underline"
							>
								{t("object.copyCitation")}
							</button>
						</div>
					</Container>
				</WireframeSection>

				<RelatedWorksSection related={related} />

				{/* 3D / Video / Audio */}
				<ScopeMark label="Media (3D, video, audio)">
					<WireframeSection
						label="Media"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								<span id="media">{t("object.mediaHeading")}</span>
							</SectionLabel>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="flex h-48 items-center justify-center border border-dashed border-gray-300">
									<span className="font-mono text-meta text-gray-400">
										{t("object.3dPlaceholder")}
									</span>
								</div>
								<div className="flex h-48 items-center justify-center border border-dashed border-gray-300">
									<span className="font-mono text-meta text-gray-400">
										{t("object.videoPlaceholder")}
									</span>
								</div>
							</div>

							{/* Audio — list of tour stops / commentary */}
							<div className="mt-4">
								<SectionLabel className="mb-2">
									{t("object.audioHeading")}
								</SectionLabel>
								{obj.audioMedia && obj.audioMedia.length > 0 ? (
									<ul className="flex flex-col gap-2">
										{obj.audioMedia.map((a) => (
											<li
												key={a.title}
												className="flex items-center gap-3 border border-gray-300 px-3 py-2"
											>
												<button
													type="button"
													className="flex h-9 w-9 shrink-0 items-center justify-center border border-gray-400 font-mono text-label uppercase tracking-wide text-gray-700 hover:border-gray-700"
												>
													▶
												</button>
												<div className="flex-1">
													<p className="font-mono text-meta text-gray-700">
														{a.title}
													</p>
													{a.description && (
														<p className="font-mono text-label text-gray-500">
															{a.description}
														</p>
													)}
												</div>
												<span className="font-mono text-label text-gray-400">
													{a.duration}
												</span>
											</li>
										))}
									</ul>
								) : (
									<div className="flex h-20 items-center justify-center border border-dashed border-gray-300">
										<span className="font-mono text-meta text-gray-400">
											{t("object.audioPlaceholder")}
										</span>
									</div>
								)}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Educational resources */}
				<ScopeMark label="Educational resources">
					<WireframeSection
						label="Educational resources"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("object.eduHeading")}
							</SectionLabel>
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-4 border border-gray-300 p-4">
									<span className="border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-label text-blue-700">
										{t("edu.lessonPlanBadge")}
									</span>
									<div>
										<p className="font-mono text-body font-medium">
											Impressionism and the Modern City
										</p>
										<p className="font-mono text-meta text-gray-500">
											Grades 6&ndash;12 &middot; 2&ndash;3 class periods
										</p>
									</div>
								</div>
								<Link
									href="/educational-resources"
									className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
								>
									{t("object.eduViewAll")} &rarr;
								</Link>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Data disclaimer */}
				<WireframeSection
					label="Data disclaimer"
					className="border-t border-gray-200 py-6"
				>
					<Container size="md">
						<div className="flex items-start gap-3 border border-gray-200 bg-gray-50 px-4 py-3">
							<span className="mt-0.5 font-mono text-label text-gray-400">
								i
							</span>
							<div>
								<p className="font-mono text-meta text-gray-500">
									{t("object.disclaimer")}
								</p>
								<button
									type="button"
									className="mt-1 font-mono text-label text-gray-500 underline"
								>
									{t("object.contactLink")}
								</button>
							</div>
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}

export default function ObjectDetailPage() {
	return (
		<Suspense>
			<ObjectDetailContent />
		</Suspense>
	);
}
