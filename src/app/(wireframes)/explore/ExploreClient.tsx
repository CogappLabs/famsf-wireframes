"use client";

import Link from "next/link";
import { useState } from "react";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const SHUFFLE_PERIODS = [
	"19th century",
	"Renaissance",
	"20th century",
	"Ancient",
	"Contemporary",
];
const SHUFFLE_MEDIA = [
	"Bronze",
	"Oil on canvas",
	"Watercolour",
	"Silk",
	"Ceramic",
];
const SHUFFLE_THEMES = [
	"Landscapes",
	"Portraits",
	"Still life",
	"Mythology",
	"Daily life",
];

const MOVEMENTS = [
	{ name: "Impressionism", count: 87, dates: "1860–1890" },
	{ name: "Post-Impressionism", count: 42, dates: "1886–1905" },
	{ name: "Modernism", count: 156, dates: "1890–1945" },
	{ name: "Bay Area Figurative", count: 24, dates: "1950–1970" },
	{ name: "Arts and Crafts", count: 68, dates: "1880–1920" },
	{ name: "Art Nouveau", count: 52, dates: "1890–1910" },
];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

const THEMES = [
	{
		title: "Impressionism in San Francisco",
		desc: "Monet, Pissarro, Degas, and the FAMSF Impressionist holdings",
		count: 48,
	},
	{
		title: "The Rodin Collection",
		desc: "One of the finest collections of Rodin sculpture outside Paris",
		count: 92,
	},
	{
		title: "Works on Paper",
		desc: "The Achenbach Foundation’s world-class prints, drawings, and photographs",
		count: 115627,
	},
	{
		title: "Textiles of the World",
		desc: "20,000 objects spanning 120+ countries and 5,000 years",
		count: 11983,
	},
	{
		title: "Art of the Ancient World",
		desc: "Greek, Roman, and Near Eastern antiquities",
		count: 1301,
	},
	{
		title: "California and the West",
		desc: "American art from the Gold Rush to the Bay Area figurative movement",
		count: 342,
	},
];

const PERIODS = [
	{ label: "Ancient", range: "3000 BCE–1 CE" },
	{ label: "Medieval", range: "1–1400" },
	{ label: "Renaissance", range: "1400–1600" },
	{ label: "Baroque", range: "1600–1750" },
	{ label: "Modern", range: "1750–1900" },
	{ label: "20th Century", range: "1900–2000" },
	{ label: "Contemporary", range: "2000–present" },
];

const DISCOVERY_PROMPTS = [
	"Show me something I’ve never seen",
	"French art from the 1880s",
	"Objects made of silk",
	"Portraits of women",
	"What’s on view at the Legion of Honor?",
	"African sculpture",
];

export default function ExploreClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const [shuffle, setShuffle] = useState({
		period: SHUFFLE_PERIODS[0],
		medium: SHUFFLE_MEDIA[0],
		theme: SHUFFLE_THEMES[0],
	});
	const reshuffle = () =>
		setShuffle({
			period: pick(SHUFFLE_PERIODS),
			medium: pick(SHUFFLE_MEDIA),
			theme: pick(SHUFFLE_THEMES),
		});

	const onViewDocs = docs.filter((d) => d.on_view).slice(0, 6);
	const mostViewedDocs = docs.slice(0, 5);

	return (
		<ScopePage id="explore">
			<div className="min-h-screen bg-white">
				{/* Hero */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("explore.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("explore.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-700">
							{t("explore.intro")}
						</p>
					</Container>
				</WireframeSection>

				{/* Curated themes */}
				<WireframeSection
					label="Curated themes"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("explore.themesHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{THEMES.map((theme) => (
								<Link
									key={theme.title}
									href={`/search-results?q=${encodeURIComponent(theme.title)}`}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder aspect="16/9" label={`[${theme.title}]`} />
									<div className="p-4">
										<h3 className="font-mono text-card font-medium">
											{theme.title}
										</h3>
										<p className="mt-1 font-mono text-meta text-gray-500">
											{theme.desc}
										</p>
										<p className="mt-2 font-mono text-label text-gray-400">
											{theme.count.toLocaleString()} works
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Browse by period */}
				<WireframeSection
					label="Timeline browse"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("explore.timelineHeading")}
						</SectionLabel>
						<div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
							{PERIODS.map((period, i) => (
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
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Recently on view / highlights */}
				<WireframeSection
					label="Highlights"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-6 flex items-center justify-between">
							<SectionLabel>{t("explore.onViewHeading")}</SectionLabel>
							<span className="font-mono text-meta text-gray-400">
								{t("explore.onViewCount")}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{onViewDocs.map((work) => (
								<Link
									key={work.id}
									href={
										slugById[work.id]
											? `/objects/sample/${slugById[work.id]}`
											: "/objects/sample"
									}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-card font-medium leading-snug">
											{work.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{work.primary_artist_display ?? work.primary_artist}
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Playful discovery */}
				<ScopeMark label="Playful discovery">
					<WireframeSection
						label="Playful discovery"
						className="border-b border-gray-300 py-12"
					>
						<Container size="md">
							<SectionLabel className="mb-6">
								{t("explore.discoveryHeading")}
							</SectionLabel>
							<p className="mb-4 font-mono text-body text-gray-700">
								{t("explore.discoveryIntro")}
							</p>
							<div className="flex flex-wrap gap-2">
								{DISCOVERY_PROMPTS.map((prompt) => (
									<Link
										key={prompt}
										href={`/search-results?q=${encodeURIComponent(prompt)}`}
										className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-500 transition-colors hover:border-gray-500 hover:bg-gray-50"
									>
										{prompt}
									</Link>
								))}
							</div>
							<ScopeMark label="Shuffle (active)">
								<div className="mt-6 border border-gray-300 p-4">
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
										{(
											[
												[t("explore.shuffleTraitPeriod"), shuffle.period],
												[t("explore.shuffleTraitMedium"), shuffle.medium],
												[t("explore.shuffleTraitTheme"), shuffle.theme],
											] as const
										).map(([label, value]) => (
											<div
												key={label}
												className="flex flex-col items-center border border-gray-200 bg-gray-50 px-3 py-4"
											>
												<span className="font-mono text-label tracking-wide text-gray-400">
													{label}
												</span>
												<span className="mt-1 font-mono text-body font-medium text-gray-700">
													{value}
												</span>
											</div>
										))}
									</div>
									<div className="mt-4 flex flex-wrap items-center gap-2">
										<button
											type="button"
											onClick={reshuffle}
											className="border-2 border-gray-900 bg-gray-900 px-3 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
										>
											&#x21BB; {t("explore.shuffleAction")}
										</button>
										<Link
											href="/search-results"
											className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-500 hover:border-gray-500"
										>
											{t("explore.shuffleApply")} &rarr;
										</Link>
									</div>
								</div>
							</ScopeMark>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Movement axis */}
				<ScopeMark label="Movement axis">
					<WireframeSection
						label="Movement axis"
						className="border-b border-gray-300 py-12"
					>
						<Container>
							<SectionLabel className="mb-2">
								{t("explore.movementHeading")}
							</SectionLabel>
							<p className="mb-6 font-mono text-meta text-gray-500">
								{t("explore.movementHint")}
							</p>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{MOVEMENTS.map((m) => (
									<Link
										key={m.name}
										href="/search-results"
										className="border border-gray-300 p-4 transition-colors hover:border-gray-500"
									>
										<p className="font-mono text-meta font-medium text-gray-700">
											{m.name}
										</p>
										<p className="mt-1 font-mono text-label tracking-wide text-gray-400">
											{m.dates} &middot; {m.count} works
										</p>
									</Link>
								))}
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Most viewed */}
				<ScopeMark label="Most viewed">
					<WireframeSection label="Most viewed" className="py-12">
						<Container size="md">
							<SectionLabel className="mb-6">
								{t("explore.mostViewedHeading")}
							</SectionLabel>
							<div className="flex flex-col border border-gray-300">
								{mostViewedDocs.map((work, i) => (
									<Link
										key={work.id}
										href={
											slugById[work.id]
												? `/objects/sample/${slugById[work.id]}`
												: "/objects/sample"
										}
										className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 ${i > 0 ? "border-t border-gray-200" : ""}`}
									>
										<span className="w-6 font-mono text-card font-medium text-gray-300">
											{i + 1}
										</span>
										<div className="w-12 shrink-0">
											<ImagePlaceholder aspect="1/1" label="[img]" />
										</div>
										<div>
											<p className="font-mono text-body font-medium">
												{work.title}
											</p>
											<p className="font-mono text-meta text-gray-500">
												{work.primary_artist_display ?? work.primary_artist},{" "}
												{work.display_date ?? work.display_year ?? ""}
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
