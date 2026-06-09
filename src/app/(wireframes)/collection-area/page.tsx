"use client";

import Link from "next/link";
import {
	Container,
	ImagePlaceholder,
	LinkCard,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const HIGHLIGHTS = [
	{
		title: "The Thinker",
		artist: "Auguste Rodin",
		date: "modeled ca. 1880, cast 1904",
		medium: "Bronze",
	},
	{
		title: "The Three Shades",
		artist: "Auguste Rodin",
		date: "modeled ca. 1881, cast ca. 1898",
		medium: "Bronze",
	},
	{
		title: "Kovsh",
		artist: "Peter Carl Fabergé",
		date: "ca. 1900",
		medium: "Jade, gold, rubies, sapphires",
	},
	{
		title: "Pair of Candelabra",
		artist: "Pierre Gouthière",
		date: "ca. 1775",
		medium: "Gilt bronze and marble",
	},
	{
		title: "Writing Table",
		artist: "Bernard II van Risenburgh",
		date: "ca. 1750",
		medium: "Oak, lacquer, gilt bronze",
	},
	{
		title: "Virgin and Child",
		artist: "Unknown artist",
		date: "ca. 1320–1340",
		medium: "Ivory with traces of paint",
	},
];

const BROWSE_OPTIONS = [
	{ label: "Sculpture", count: "2,274" },
	{ label: "Furnishing", count: "1,979" },
	{ label: "Personal Accessory", count: "1,441" },
	{ label: "Vessels & Containers", count: "892" },
	{ label: "Architectural Element", count: "495" },
	{ label: "Numismatic", count: "339" },
];

export default function CollectionAreaPage() {
	return (
		<ScopePage id="collection-area">
			<div className="min-h-screen bg-white">
				{/* Hero */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-2">
							<Link
								href="/collection-areas"
								className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
							>
								&larr; {t("area.backToCollection")}
							</Link>
						</div>
						<SectionLabel>{t("area.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							European Decorative Arts and Sculpture
						</h1>
						<ScopeMark label="Museum location">
							<p className="mt-2 font-mono text-body text-gray-500">
								{t("area.museums")}
							</p>
						</ScopeMark>
						<ImagePlaceholder
							aspect="21/9"
							label="[Gallery installation: updated with current display]"
							className="mt-8 border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* About */}
				<WireframeSection
					label="About"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("area.aboutHeading")}
						</SectionLabel>
						<div className="space-y-4 font-mono text-body text-gray-600">
							<p>
								The European Decorative Arts and Sculpture collection
								encompasses over 6,000 works spanning from the medieval period
								to the early twentieth century. The collection is particularly
								distinguished by its world-renowned holdings of sculpture by
								Auguste Rodin, including <em>The Thinker</em>,{" "}
								<em>The Three Shades</em>, and numerous other works displayed at
								the Legion of Honor.
							</p>
							<p>
								The collection also features exceptional examples of French
								decorative arts from the eighteenth century, including
								furniture, porcelain, silver, and gilt bronze. Major holdings
								include works by Peter Carl Fabergé and significant examples of
								European ceramics and metalwork.
							</p>
						</div>
					</Container>
				</WireframeSection>

				{/* Stats */}
				<WireframeSection
					label="Stats"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("area.statsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard value="6,063" label="Objects" />
							<StatCard value="3,888" label="With images" />
							<StatCard value="664" label="On view" />
							<StatCard value="1,287" label="Artists" />
						</div>
					</Container>
				</WireframeSection>

				{/* Highlights */}
				<WireframeSection
					label="Highlights"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("area.highlightsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{HIGHLIGHTS.map((work) => (
								<button
									key={work.title}
									type="button"
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{work.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{work.artist}
										</p>
										<p className="font-mono text-label text-gray-400">
											{work.date}
										</p>
									</div>
								</button>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Browse options */}
				<WireframeSection
					label="Browse options"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("area.browseHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{BROWSE_OPTIONS.map((opt) => (
								<button
									key={opt.label}
									type="button"
									className="flex items-center justify-between border border-gray-300 px-4 py-3 text-left font-mono transition-colors hover:border-gray-500"
								>
									<span className="text-body font-medium">{opt.label}</span>
									<span className="text-meta text-gray-400">{opt.count}</span>
								</button>
							))}
						</div>
						<div className="mt-4">
							<LinkCard
								title={t("area.searchThis")}
								description={t("area.searchThisDesc")}
								href="/search-results"
								arrow
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Articles & essays */}
				<ScopeMark label="Articles & essays">
					<WireframeSection
						label="Articles & essays"
						className="border-b border-gray-300 py-12"
					>
						<Container size="md">
							<SectionLabel className="mb-6">
								{t("area.contentHeading")}
							</SectionLabel>
							<div className="flex flex-col gap-3">
								<div className="border border-gray-300 p-5">
									<h3 className="font-mono text-card font-medium">
										Rodin at the Legion of Honor: A History
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										The story of how San Francisco came to hold one of the most
										significant collections of Rodin sculpture outside Paris.
									</p>
									<p className="mt-2 font-mono text-label text-gray-400">
										Article · 8 min read
									</p>
								</div>
								<div className="border border-gray-300 p-5">
									<h3 className="font-mono text-card font-medium">
										Fabergé and the Art of the Goldsmith
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										Exploring the masterful craftsmanship behind the
										museum&apos;s Fabergé holdings.
									</p>
									<p className="mt-2 font-mono text-label text-gray-400">
										Article · 5 min read
									</p>
								</div>
								<div className="border border-dashed border-gray-300 p-5">
									<h3 className="font-mono text-meta text-gray-400">
										{t("area.moreArticlesPlaceholder")}
									</h3>
								</div>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Provenance statement */}
				<WireframeSection
					label="Provenance statement"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("area.provenanceHeading")}
						</SectionLabel>
						<p className="font-mono text-meta text-gray-500">
							{t("area.provenanceText")}
						</p>
					</Container>
				</WireframeSection>

				{/* Related programs */}
				<ScopeMark label="Related programs">
					<WireframeSection label="Related programs" className="py-12">
						<Container size="md">
							<SectionLabel className="mb-6">
								{t("area.programsHeading")}
							</SectionLabel>
							<div className="flex h-32 items-center justify-center border border-dashed border-gray-300">
								<span className="font-mono text-meta text-gray-400">
									{t("area.programsPlaceholder")}
								</span>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}
