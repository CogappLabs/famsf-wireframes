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
		meta: "6 min read",
	},
	{
		kind: "Video",
		title: "Behind the scenes: textile storage",
		desc: "How 20,000 fragile costumes and textiles are kept safe",
		meta: "4 min watch",
	},
	{
		kind: "Audio",
		title: "The story of Water Lilies",
		desc: "A curator on Monet's late garden paintings",
		meta: "12 min listen",
	},
	{
		kind: "Article",
		title: "Reattributing a Dutch portrait",
		desc: "What technical imaging revealed beneath the varnish",
		meta: "8 min read",
	},
];

// Recently-acquired works strip (NEW organization). Dedicated module showing
// actual recent works.
const NEW_ACQUISITIONS = [
	{
		title: "Untitled (Seascape)",
		artist: "Joan Brown",
		acquired: "Acquired 2025",
	},
	{
		title: "Standing Figure",
		artist: "Ruth Asawa",
		acquired: "Acquired 2025",
	},
	{
		title: "View of the Bay",
		artist: "Wayne Thiebaud",
		acquired: "Acquired 2024",
	},
	{
		title: "Ceremonial Vessel",
		artist: "Unknown maker",
		acquired: "Acquired 2024",
	},
	{
		title: "Self-Portrait",
		artist: "Elmer Bischoff",
		acquired: "Acquired 2024",
	},
];

function CollectionLandingContent() {
	return (
		<ScopePage id="collection-landing">
			<div className="min-h-screen bg-white">
				{/* Hero: page header + tagline */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("collection.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("collection.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-700">
							{t("collection.intro")}
						</p>
						<ImagePlaceholder
							aspect="21/9"
							label="[Hero: rotating gallery installation image]"
							className="mt-8 border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* Search bar: basic filters + advanced search accessible */}
				<WireframeSection
					label="Search bar"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("collection.searchHeading")}
						</SectionLabel>
						<CollectionAutocomplete />
						<ScopeMark label="Basic filters">
							<div className="mt-4 flex flex-wrap items-center gap-2">
								<span className="font-mono text-meta text-gray-500">
									Filter to:
								</span>
								{BASIC_FILTERS.map((f) => (
									<Link
										key={f.key}
										href={`/search-results?${f.key}=true`}
										className="border border-gray-300 px-3 py-1 font-mono text-meta text-gray-500 transition-colors hover:border-gray-500 hover:bg-gray-50"
									>
										{f.label}
									</Link>
								))}
							</div>
						</ScopeMark>
						<p className="mt-3 font-mono text-meta text-gray-400">
							Or use{" "}
							<Link
								href="/search-results"
								className="underline hover:text-gray-600"
							>
								{t("search.advancedToggle")}
							</Link>{" "}
							with filters for geography, culture, material, date range, and
							more
						</p>
					</Container>
				</WireframeSection>

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
							<SectionLabel className="mb-2">
								{t("collection.themesHeading")}
							</SectionLabel>
							<p className="mb-6 max-w-[var(--container-md)] font-mono text-meta text-gray-500">
								{t("collection.themesIntro")}
							</p>
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
											<p className="mt-2 font-mono text-meta text-gray-500">
												{theme.desc}
											</p>
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
									<p className="mt-1 font-mono text-meta text-gray-500">
										{area.count} {t("collection.objectsSuffix")}
									</p>
									<p className="mt-2 font-mono text-meta text-gray-500">
										{area.desc}
									</p>
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
							<SectionLabel className="mb-2">
								{t("collection.readWatchListenHeading")}
							</SectionLabel>
							<p className="mb-6 max-w-[var(--container-md)] font-mono text-meta text-gray-500">
								{t("collection.readWatchListenIntro")}
							</p>
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
							<SectionLabel className="mb-2">
								{t("collection.newToCollectionsHeading")}
							</SectionLabel>
							<p className="mb-6 max-w-[var(--container-md)] font-mono text-meta text-gray-500">
								{t("collection.newToCollectionsIntro")}
							</p>
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
												{work.artist}
											</p>
											<p className="mt-2 font-mono text-label text-gray-400">
												{work.acquired}
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
