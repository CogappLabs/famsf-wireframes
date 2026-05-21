"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
	Container,
	ImagePlaceholder,
	LinkCard,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import CollectionAutocomplete from "@/components/wireframe/CollectionAutocomplete";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const COLLECTION_AREAS = [
	{
		name: "Achenbach Foundation for Graphic Arts",
		count: "115,627",
		desc: "One of the largest works-on-paper collections in the US: prints, drawings, photographs, and artists' books",
	},
	{
		name: "Costume and Textile Arts",
		count: "11,983",
		desc: "20,000+ objects spanning 120+ countries and cultures, from ancient textiles to contemporary fashion",
	},
	{
		name: "European Decorative Arts and Sculpture",
		count: "6,063",
		desc: "Porcelain, furniture, silver, sculpture, and the world-renowned Rodin collection",
	},
	{
		name: "Arts of Africa",
		count: "1,842",
		desc: "Sculpture, masks, textiles, and ritual objects from across the African continent",
	},
	{
		name: "Arts of Oceania",
		count: "1,103",
		desc: "Carving, regalia, and ceremonial objects from Melanesia, Polynesia, and Micronesia",
	},
	{
		name: "Arts of the Americas",
		count: "2,522",
		desc: "Pre-Columbian, Indigenous American, and Latin American art across millennia",
	},
	{
		name: "American Decorative Arts and Sculpture",
		count: "2,483",
		desc: "Decorative arts, sculpture, and design from the colonial era to the present",
	},
	{
		name: "Ancient Art",
		count: "1,301",
		desc: "Greek, Roman, and Near Eastern antiquities spanning 5,000 years",
	},
	{
		name: "American Paintings",
		count: "796",
		desc: "American painting from the colonial period through the mid-20th century",
	},
	{
		name: "European Paintings",
		count: "757",
		desc: "European painting from the medieval period to the early 20th century, including major French holdings",
	},
	{
		name: "Contemporary Art",
		count: "34",
		desc: "Contemporary art and programming across all media",
	},
];

const SUB_COLLECTIONS = [
	{ name: "Photography", count: "5,881" },
	{ name: "Prints", count: "96,074" },
	{ name: "Drawings", count: "10,233" },
	{ name: "Paintings", count: "1,737" },
	{ name: "Sculpture", count: "2,274" },
	{ name: "Textiles", count: "2,644" },
	{ name: "Costume", count: "7,418" },
];

const TIMELINE_PERIODS = [
	{ label: "Ancient", range: "3000 BCE\u20131 CE", count: "1,204" },
	{ label: "Medieval", range: "1\u20131400", count: "892" },
	{ label: "Renaissance", range: "1400\u20131600", count: "3,471" },
	{ label: "Baroque", range: "1600\u20131750", count: "8,236" },
	{ label: "Modern", range: "1750\u20131900", count: "52,108" },
	{ label: "20th Century", range: "1900\u20132000", count: "31,445" },
	{ label: "Contemporary", range: "2000\u2013present", count: "1,891" },
];

const HIGHLIGHTS = [
	{
		title: "The Thinker",
		artist: "Auguste Rodin",
		date: "1904",
		dept: "European Sculpture",
	},
	{
		title: "Ocean Park #116",
		artist: "Richard Diebenkorn",
		date: "1979",
		dept: "American Paintings",
	},
	{
		title: "Water Lilies",
		artist: "Claude Monet",
		date: "ca. 1914\u20131917",
		dept: "European Paintings",
	},
	{
		title: "Woman in a Striped Dress",
		artist: "\u00c9douard Vuillard",
		date: "1895",
		dept: "European Paintings",
	},
	{
		title: "Teotitl\u00e1n del Valle Rug",
		artist: "Anonymous",
		date: "20th century",
		dept: "Costume and Textile Arts",
	},
	{
		title: "Standing Male Figure (Nkisi)",
		artist: "Unknown artist",
		date: "19th century",
		dept: "Arts of Africa",
	},
];

function CollectionLandingContent() {
	return (
		<ScopePage id="collection-landing">
			<div className="min-h-screen bg-white">
				{/* Hero */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("collection.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("collection.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							{t("collection.intro")}
						</p>
						<ImagePlaceholder
							aspect="21/9"
							label="[Hero: rotating gallery installation image]"
							className="mt-8 border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* Collection stats */}
				<WireframeSection
					label="Collection stats"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("collection.statsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard
								value={t("collection.stat1Value")}
								label={t("collection.stat1Label")}
							/>
							<StatCard
								value={t("collection.stat2Value")}
								label={t("collection.stat2Label")}
							/>
							<StatCard
								value={t("collection.stat3Value")}
								label={t("collection.stat3Label")}
							/>
							<StatCard
								value={t("collection.stat4Value")}
								label={t("collection.stat4Label")}
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Dual pathways: Explore vs Search */}
				<WireframeSection
					label="Dual pathways"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<LinkCard
								title={t("collection.exploreLabel")}
								description={t("collection.exploreDesc")}
								href="/explore"
								arrow
							/>
							<LinkCard
								title={t("collection.searchLabel")}
								description={t("collection.searchDesc")}
								href="/search-results"
								arrow
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Search bar */}
				<WireframeSection
					label="Search bar"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("collection.searchHeading")}
						</SectionLabel>
						<CollectionAutocomplete />
						<p className="mt-2 font-mono text-meta text-gray-400">
							Or use{" "}
							<span className="underline">{t("search.advancedToggle")}</span>{" "}
							with filters for geography, culture, material, date range, and
							more
						</p>
					</Container>
				</WireframeSection>

				{/* Browse by collection area */}
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
									href="/collection-area"
									className="flex flex-col border border-gray-300 p-5 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder
										aspect="16/9"
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

				{/* Sub-collection pathways */}
				<WireframeSection
					label="Browse by area"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<SectionLabel className="mb-4">Browse by type</SectionLabel>
						<div className="flex flex-wrap gap-2">
							{SUB_COLLECTIONS.map((sc) => (
								<Link
									key={sc.name}
									href={`/search-results?q=${encodeURIComponent(sc.name)}`}
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600 transition-colors hover:border-gray-500 hover:bg-gray-50"
								>
									{sc.name} <span className="text-gray-400">{sc.count}</span>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Browse by gallery (post-MVP) */}
				<ScopeMark label="Gallery browse">
					<WireframeSection
						label="Gallery browse"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<SectionLabel className="mb-2">
								{t("landing.galleryBrowseHeading")}
							</SectionLabel>
							<p className="mb-4 font-mono text-meta text-gray-500">
								{t("landing.galleryBrowseHint")}
							</p>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{[
									{
										name: "Court of Honor: Rodin",
										venue: "Legion of Honor",
										count: 14,
									},
									{
										name: "Gallery 10: Impressionism",
										venue: "Legion of Honor",
										count: 12,
									},
									{
										name: "Gallery 11: 19th-century French",
										venue: "Legion of Honor",
										count: 8,
									},
									{
										name: "Gallery 6: European Decorative Arts",
										venue: "Legion of Honor",
										count: 22,
									},
									{
										name: "Gallery 22: American Modernism",
										venue: "de Young",
										count: 6,
									},
									{
										name: "Gallery 15: Arts of Africa",
										venue: "de Young",
										count: 18,
									},
								].map((g) => (
									<Link
										key={g.name}
										href="/search-results"
										className="border border-gray-300 p-3 transition-colors hover:border-gray-500"
									>
										<p className="font-mono text-meta font-medium text-gray-800">
											{g.name}
										</p>
										<p className="mt-1 font-mono text-label uppercase tracking-wide text-gray-400">
											{g.venue} &middot; {g.count} on view
										</p>
									</Link>
								))}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Highlights */}
				<WireframeSection
					label="Highlights"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("collection.highlightsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{HIGHLIGHTS.map((work) => (
								<Link
									key={work.title}
									href={`/search-results?q=${encodeURIComponent(work.title)}`}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
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

				{/* What to see in an hour */}
				<ScopeMark label="What to see">
					<WireframeSection
						label="What to see"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-2">
								{t("collection.whatToSeeHeading")}
							</SectionLabel>
							<p className="mb-4 font-mono text-body text-gray-600">
								{t("collection.whatToSeeDesc")}
							</p>
							<LinkCard
								title={t("collection.whatToSeeCta")}
								description={t("visit.intro")}
								href="/visit-planner"
								arrow
							/>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Timeline */}
				<WireframeSection label="Timeline" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{t("collection.timelineHeading")}
						</SectionLabel>
						<div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
							{TIMELINE_PERIODS.map((period, i) => (
								<Link
									key={period.label}
									href={`/search-results?q=${encodeURIComponent(period.label)}`}
									className={`flex flex-1 flex-col border border-gray-300 p-4 text-left transition-colors hover:border-gray-500 hover:bg-gray-50 ${i > 0 ? "sm:-ml-px" : ""}`}
								>
									<span className="font-mono text-card font-medium">
										{period.label}
									</span>
									<span className="mt-0.5 font-mono text-meta text-gray-500">
										{period.range}
									</span>
									<span className="mt-2 font-mono text-label text-gray-400">
										{period.count} {t("collection.worksSuffix")}
									</span>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>
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
