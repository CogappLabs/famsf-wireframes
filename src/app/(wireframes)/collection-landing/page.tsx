"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
	Container,
	ExternalLink,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import CollectionAutocomplete from "@/components/wireframe/CollectionAutocomplete";
import { homepageHighlights } from "@/lib/collection-members";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import { slugify } from "../collection-area/[slug]/page";

// Section order follows the June 18 2026 page-layouts spec ("New organization"):
// header + tagline → search bar → highlights → thematic exploration →
// collection areas → read/watch/listen → new to the collections.
// Off-spec sections (stats, dual pathways, gallery browse, what-to-see,
// timeline, more-ways-in, browse-by-type) were removed to match the doc flow.

// Collection areas == TMS Departments (CW-30). The nine departments below are
// the only ones carrying web-visible objects; counts are web-visible object
// counts probed from live TMS (vCI_PrismObjectsFilter_Cogapp), ordered by size.
// "Arts of Africa, Oceania, and the Americas" is a single TMS department (AOA),
// not the three separate areas an earlier wireframe pass invented.
const COLLECTION_AREAS = [
	{
		name: "Achenbach Foundation for Graphic Arts",
		count: "118,773",
		desc: "One of the largest works-on-paper collections in the US: prints, drawings, photographs, and artists' books",
	},
	{
		name: "Costume and Textile Arts",
		count: "12,381",
		desc: "20,000+ objects spanning 120+ countries and cultures, from ancient textiles to contemporary fashion",
	},
	{
		name: "European Decorative Arts and Sculpture",
		count: "6,535",
		desc: "Porcelain, furniture, silver, sculpture, and the world-renowned Rodin collection",
	},
	{
		name: "Arts of Africa, Oceania, and the Americas",
		count: "6,330",
		desc: "Sculpture, masks, textiles, regalia, and ceremonial objects from across Africa, Oceania, and the Americas",
	},
	{
		name: "American Decorative Arts and Sculpture",
		count: "2,865",
		desc: "Decorative arts, sculpture, and design from the colonial era to the present",
	},
	{
		name: "Ancient Art",
		count: "1,316",
		desc: "Greek, Roman, and Near Eastern antiquities spanning 5,000 years",
	},
	{
		name: "American Paintings",
		count: "833",
		desc: "American painting from the colonial period through the mid-20th century",
	},
	{
		name: "European Paintings",
		count: "793",
		desc: "European painting from the medieval period to the early 20th century, including major French holdings",
	},
	{
		name: "Contemporary Art",
		count: "224",
		desc: "Contemporary art and programming across all media",
	},
];

// Basic-search filter chips. Submit appends to /search-results query string.
// Lean-MVP homepage pass (2026-06-09): dropped Highlights (no editorial owner),
// Has image (not a useful entry filter here) and Popular (needs analytics).
const BASIC_FILTERS = [
	{ key: "open_access", label: "Open access" },
	{ key: "on_view", label: "On view" },
];

// Real cross-department Web Highlights for the homepage row: the top-ranked
// curator pick from each collection area (one work per department).
const HIGHLIGHTS = homepageHighlights(8).map((m) => ({
	title: m.title ?? "Untitled",
	artist: m.artist ?? "",
	date: m.date ?? "",
}));

// Full-bleed promo mosaic (Figma node 174:1464), sitting above Highlights.
// A flexible editorial slot: each cell is one of three kinds, so curators can
// mix a headline number, a pointer to any existing page, or a plain image.
//   stat  — big number + caption, optionally linked
//   link  — title + count/standfirst over an image
//   image — image only, credited (fills out the grid rhythm)
// `span: 2` makes a cell take two columns on the 3-col desktop grid. Each cell
// carries its own `id` — several cells repeat the same credit, so the id is what
// keys them.
type PromoCell = { id: string; span?: number } & (
	| { kind: "stat"; value: string; caption: string; href?: string }
	| { kind: "link"; title: string; meta?: string; href: string }
	| { kind: "image"; credit: string }
);

const PROMO_CELLS: PromoCell[] = [
	{
		id: "area-eur-dec",
		kind: "link",
		title: "European Decorative Arts and Sculpture",
		meta: "6,535 objects",
		href: "/collection-area/european-decorative-arts-and-sculpture",
	},
	{
		id: "stat-portraits",
		kind: "stat",
		value: "9,104",
		caption: "Portraits",
		href: "/search-results",
	},
	{ id: "img-1", kind: "image", credit: "Josef Albers, 1966" },
	{ id: "img-2", kind: "image", credit: "Josef Albers, 1966" },
	{
		id: "area-achenbach",
		kind: "link",
		title: "Achenbach Foundation for Graphic Arts",
		meta: "118,773 objects",
		href: "/collection-area/achenbach-foundation-for-graphic-arts",
	},
	{ id: "img-3", kind: "image", credit: "Josef Albers, 1966" },
];

// Curated thematic-discovery tiles (NEW organization, 2026-06-18 page layouts).
// Editorial themes, not browse facets. Each routes a pre-canned search:
// a free-text theme query PLUS one seeded facet (`facet=type:value`, seeded by
// GridFacetsView.seedSelectionFromFacet) so the result lands pre-filtered.
// Curator-editable list per FAMSF feedback.
const THEMES = [
	{
		name: "Environment",
		desc: "Land, sea, and our changing climate",
		facet: "classification:Paintings",
	},
	{
		name: "Making",
		desc: "Process, craft, and the hand of the maker",
		facet: "material:Metal",
	},
	{
		name: "Portraiture",
		desc: "Faces, identity, and the painted self",
		facet: "classification:Paintings",
	},
	{
		name: "The Sea",
		desc: "Oceans, voyages, and coastal life",
		facet: "classification:Paintings",
	},
	{
		name: "Devotion and ritual",
		desc: "Sacred objects and ceremony",
		facet: "department:Arts of Africa, Oceania, and the Americas",
	},
	{
		name: "Power and politics",
		desc: "Authority, protest, and the state",
		facet: "classification:Prints",
	},
];

// Editorial article / video / audio cards (NEW organization).
const READ_WATCH_LISTEN = [
	{
		kind: "Article",
		title: "Conserving the Rodin bronzes",
		desc: "Inside the studio as conservators stabilise a century of patina",
		meta: "6 min. read",
	},
	{
		kind: "Video",
		title: "Behind the scenes: textile storage",
		desc: "How 20,000 fragile costumes and textiles are kept safe",
		meta: "4 min. watch",
	},
	{
		kind: "Audio",
		title: "The story of Water Lilies",
		desc: "A curator on Monet's late garden paintings",
		meta: "12 min. listen",
	},
	{
		kind: "Article",
		title: "Reattributing a Dutch portrait",
		desc: "What technical imaging revealed beneath the varnish",
		meta: "8 min. read",
	},
];

// Recently-acquired works strip (NEW organization). Dedicated module showing
// actual recent works. Shows the artwork year (matching Highlights), not the
// acquisition year.
const NEW_ACQUISITIONS = [
	{
		title: "Untitled (Seascape)",
		artist: "Joan Brown",
		date: "1963",
	},
	{
		title: "Standing Figure",
		artist: "Ruth Asawa",
		date: "1959",
	},
	{
		title: "View of the Bay",
		artist: "Wayne Thiebaud",
		date: "1968",
	},
	{
		title: "Ceremonial Vessel",
		artist: "Unknown maker",
		date: "ca. 600–900",
	},
	{
		title: "Self-Portrait",
		artist: "Elmer Bischoff",
		date: "1955",
	},
];

function CollectionLandingContent() {
	return (
		<ScopePage id="collection-landing">
			<div className="min-h-screen bg-white">
				{/* Hero: full-bleed background video with the search bar overlaid
				    near the bottom, per the Figma comp (node 174:1464). Short tagline
				    replaces the old page heading + long intro. */}
				<WireframeSection label="Hero" className="border-b border-gray-300">
					{/* Dark fill + diagonal hatch stand in for the video frame, so the
					    hero reads as a full-bleed background rather than a blank band.
					    Height is capped on the sized box itself (a cap on the parent
					    would crop the search bar off the bottom). */}
					<div className="relative bg-gray-800">
						<div
							aria-hidden
							className="absolute inset-0 opacity-25"
							style={{
								backgroundImage:
									"repeating-linear-gradient(45deg, transparent 0 14px, rgb(255 255 255 / 0.35) 14px 15px)",
							}}
						/>
						<div className="relative h-[min(56.25vw,70vh)] w-full">
							<span className="absolute inset-x-0 top-8 text-center font-mono text-body text-gray-400">
								[Hero: gallery installation video, autoplay + muted, looping]
							</span>
							{/* Search block sits inside the video frame at the bottom. */}
							<div className="absolute inset-x-0 bottom-0">
								<Container>
									<p className="mb-4 font-mono text-body text-white">
										{t("collection.intro")}
									</p>
									<ScopeMark label="Search bar">
										<div className="bg-gray-900/90 p-6 lg:mb-12">
											{/* Label, filter chips and advanced search share one row
										    above the input (Figma) rather than stacking below it. */}
											<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
												{/* SectionLabel bakes in text-gray-900, which ties with a
												    plain override and wins; !text-white forces it light
												    against the dark panel. */}
												<SectionLabel className="!text-white">
													{t("collection.searchHeading")}
												</SectionLabel>
												<div className="ml-auto flex flex-wrap items-center gap-3">
													<span className="font-mono text-meta text-gray-400">
														Filter to:
													</span>
													{BASIC_FILTERS.map((f) => (
														<Link
															key={f.key}
															href={`/search-results?${f.key}=true`}
															className="rounded-full border border-gray-500 px-4 py-1.5 font-mono text-meta text-gray-200 transition-colors hover:border-white hover:text-white"
														>
															{f.label}
														</Link>
													))}
													<Link
														href="/search-results"
														className="font-mono text-meta text-gray-300 underline hover:text-white"
													>
														{t("search.advancedToggle")}
													</Link>
												</div>
											</div>
											<CollectionAutocomplete className="mt-4" />
										</div>
									</ScopeMark>
								</Container>
							</div>
						</div>
					</div>
				</WireframeSection>

				{/* Promo mosaic: a flexible editorial slot above Highlights. Cells can
				    be a stat, a link to any existing page, or a plain image, so this
				    block can promote whatever content needs surfacing. */}
				<ScopeMark label="Promo mosaic">
					<WireframeSection
						label="Promo mosaic"
						className="border-b border-gray-300 py-12"
					>
						<Container>
							<SectionLabel className="mb-6">
								{t("collection.promoHeading")}
							</SectionLabel>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{PROMO_CELLS.map((cell) => {
									const spanClass = cell.span === 2 ? "sm:col-span-2" : "";

									if (cell.kind === "stat") {
										const body = (
											<div className="flex aspect-square flex-col justify-center border border-gray-300 bg-gray-100 p-6">
												<span className="font-mono text-page font-semibold leading-none tabular-nums">
													{cell.value}
												</span>
												<span className="mt-3 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
													{cell.caption}
												</span>
											</div>
										);
										return cell.href ? (
											<Link
												key={cell.id}
												href={cell.href}
												className={`transition-opacity hover:opacity-80 ${spanClass}`}
											>
												{body}
											</Link>
										) : (
											<div key={cell.id} className={spanClass}>
												{body}
											</div>
										);
									}

									if (cell.kind === "link") {
										return (
											<Link
												key={cell.id}
												href={cell.href}
												className={`flex flex-col border border-gray-300 transition-colors hover:border-gray-500 ${spanClass}`}
											>
												<ImagePlaceholder
													aspect="4/3"
													label={`[${cell.title}]`}
												/>
												<div className="p-4">
													<h3 className="font-mono text-card font-medium leading-snug">
														{cell.title}
													</h3>
													{cell.meta && (
														<span className="mt-2 inline-block font-mono text-label text-gray-500">
															{cell.meta}
														</span>
													)}
												</div>
											</Link>
										);
									}

									// image: no link target, credit line only
									return (
										<div
											key={cell.id}
											className={`flex flex-col border border-gray-300 ${spanClass}`}
										>
											<ImagePlaceholder
												aspect="4/3"
												label={`[${cell.credit}]`}
											/>
											<span className="p-4 font-mono text-label text-gray-500">
												{cell.credit}
											</span>
										</div>
									);
								})}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Highlights module */}
				<WireframeSection
					label="Highlights"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("collection.highlightsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{HIGHLIGHTS.map((work) => (
								<Link
									key={work.title}
									href="/objects/sample/water-lilies-1973-3"
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder aspect="4/5" label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-card font-medium leading-snug">
											{work.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{work.artist}, {work.date}
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Thematic exploration: curated theme tiles (NEW organization) */}
				<ScopeMark label="Thematic exploration">
					<WireframeSection
						label="Thematic exploration"
						className="border-b border-gray-300 py-12"
					>
						<Container>
							<SectionLabel className="mb-6">
								{t("collection.themesHeading")}
							</SectionLabel>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{THEMES.map((theme) => (
									<Link
										key={theme.name}
										href={`/search-results?variation=grid-facets&q=${encodeURIComponent(theme.name)}&facet=${encodeURIComponent(theme.facet)}`}
										className="flex flex-col border border-gray-300 transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder aspect="3/2" label={`[${theme.name}]`} />
										<div className="p-4">
											<h3 className="font-mono text-card font-medium leading-snug">
												{theme.name}
											</h3>
										</div>
									</Link>
								))}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Collection areas */}
				<WireframeSection
					label="Browse by area"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("collection.browseHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{COLLECTION_AREAS.map((area) => (
								<Link
									key={area.name}
									href={`/collection-area/${slugify(area.name)}`}
									className="flex flex-col border border-gray-300 p-5 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder
										aspect="1/1"
										label={`[${area.name}]`}
										className="mb-4"
									/>
									<h3 className="font-mono text-card font-medium leading-snug">
										{area.name}
									</h3>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Read, watch + listen: editorial content (NEW organization) */}
				<ScopeMark label="Read watch listen">
					<WireframeSection
						label="Read watch listen"
						className="border-b border-gray-300 py-12"
					>
						<Container>
							<SectionLabel className="mb-6">
								{t("collection.readWatchListenHeading")}
							</SectionLabel>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{READ_WATCH_LISTEN.map((item) => (
									<ExternalLink
										key={item.title}
										href="https://www.famsf.org/learn-engage/read-watch-listen"
										corner
										className="flex flex-col border border-gray-300 transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder aspect="16/9" label={`[${item.kind}]`} />
										<div className="flex flex-1 flex-col p-4">
											<span className="font-mono text-label uppercase tracking-[0.08em] text-gray-400">
												{item.kind}
											</span>
											<h3 className="mt-2 font-mono text-card font-medium leading-snug">
												{item.title}
											</h3>
											<p className="mt-2 font-mono text-meta text-gray-500">
												{item.desc}
											</p>
											<span className="mt-3 font-mono text-label text-gray-400">
												{item.meta}
											</span>
										</div>
									</ExternalLink>
								))}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* New to the collections: recent acquisitions strip (NEW organization) */}
				<ScopeMark label="New to the collections">
					<WireframeSection label="New to the collections" className="py-12">
						<Container>
							<SectionLabel className="mb-6">
								{t("collection.newToCollectionsHeading")}
							</SectionLabel>
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
								{NEW_ACQUISITIONS.map((work) => (
									<Link
										key={work.title}
										href="/objects/sample/water-lilies-1973-3"
										className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder aspect="4/5" label={`[${work.title}]`} />
										<div className="p-3">
											<h3 className="font-mono text-card font-medium leading-snug">
												{work.title}
											</h3>
											<p className="mt-0.5 font-mono text-label text-gray-500">
												{work.artist}, {work.date}
											</p>
										</div>
									</Link>
								))}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}

export default function CollectionLandingPage() {
	return (
		<Suspense>
			<CollectionLandingContent />
		</Suspense>
	);
}
