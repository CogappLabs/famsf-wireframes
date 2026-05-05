"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import CollectionAutocomplete from "@/components/wireframe/CollectionAutocomplete";
import { objects } from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const VIEW_VARIATIONS = [
	{ key: "grid", label: "Grid" },
	{ key: "list", label: "List" },
	{ key: "zero-results", label: "Zero results" },
] as const;

// ── Facet configuration ─────────────────────────────────────────────

interface FacetConfig {
	id: string;
	label: string;
	options: { value: string; count: string }[];
}

const FACETS: FacetConfig[] = [
	{
		id: "classification",
		label: "What",
		options: [
			{ value: "Print", count: "96,074" },
			{ value: "Drawing", count: "10,233" },
			{ value: "Costume", count: "7,418" },
			{ value: "Photograph", count: "5,881" },
			{ value: "Textile", count: "2,644" },
			{ value: "Sculpture", count: "2,274" },
			{ value: "Painting", count: "1,737" },
			{ value: "Personal Accessory", count: "1,441" },
		],
	},
	{
		id: "department",
		label: "Collection",
		options: [
			{ value: "Achenbach Foundation for Graphic Arts", count: "115,627" },
			{ value: "Costume and Textile Arts", count: "11,983" },
			{ value: "European Decorative Arts and Sculpture", count: "6,063" },
			{ value: "Arts of Africa, Oceania, and the Americas", count: "5,467" },
			{ value: "American Decorative Arts and Sculpture", count: "2,483" },
			{ value: "Ancient Art", count: "1,301" },
			{ value: "American Paintings", count: "796" },
			{ value: "European Paintings", count: "757" },
			{ value: "Contemporary Art", count: "34" },
		],
	},
	{
		id: "artist",
		label: "Artist",
		options: [
			{ value: "Gustave Dor\u00e9", count: "2,694" },
			{ value: "Claude Lorrain", count: "978" },
			{ value: "Pablo Picasso", count: "948" },
			{ value: "Thomas Rowlandson", count: "896" },
			{ value: "Richard Diebenkorn", count: "627" },
			{ value: "Auguste Rodin", count: "142" },
			{ value: "John Singer Sargent", count: "38" },
			{ value: "Camille Pissarro", count: "14" },
			{ value: "Claude Monet", count: "12" },
		],
	},
	{
		id: "medium",
		label: "Medium",
		options: [
			{ value: "Etching", count: "18,432" },
			{ value: "Engraving", count: "14,201" },
			{ value: "Lithograph", count: "9,876" },
			{ value: "Woodcut", count: "5,643" },
			{ value: "Gelatin silver print", count: "3,102" },
			{ value: "Watercolour", count: "2,187" },
			{ value: "Silk", count: "1,876" },
			{ value: "Oil on canvas", count: "1,243" },
			{ value: "Bronze", count: "567" },
		],
	},
	{
		id: "geography",
		label: "Geography",
		options: [
			{ value: "France", count: "19,876" },
			{ value: "United States", count: "7,654" },
			{ value: "Germany", count: "5,432" },
			{ value: "Italy", count: "4,987" },
			{ value: "Japan", count: "3,210" },
			{ value: "China", count: "2,198" },
			{ value: "England", count: "1,876" },
			{ value: "Mexico", count: "1,432" },
		],
	},
	{
		id: "culture",
		label: "Culture",
		options: [
			{ value: "French", count: "21,043" },
			{ value: "American", count: "8,762" },
			{ value: "Japanese", count: "4,321" },
			{ value: "Chinese", count: "2,198" },
			{ value: "Moche", count: "432" },
			{ value: "Yoruba", count: "387" },
			{ value: "Greek", count: "312" },
		],
	},
	{
		id: "technique",
		label: "Technique",
		options: [
			{ value: "Engraving", count: "14,201" },
			{ value: "Embroidery", count: "3,876" },
			{ value: "Weaving", count: "2,543" },
			{ value: "Casting", count: "1,876" },
			{ value: "Carving", count: "1,432" },
			{ value: "Gilding", count: "987" },
			{ value: "Enamelling", count: "654" },
		],
	},
	{
		id: "creditLine",
		label: "Donor",
		options: [
			{ value: "Alma de Bretteville Spreckels", count: "312" },
			{ value: "Mildred Anna Williams Collection", count: "124" },
			{ value: "Achenbach Foundation", count: "98" },
			{ value: "Prentis Cobb Hale", count: "56" },
			{ value: "M.H. de Young", count: "842" },
			{ value: "Roscoe and Margaret Oakes", count: "187" },
		],
	},
	{
		id: "gallery",
		label: "Gallery",
		options: [
			{ value: "Gallery 10 \u2014 Impressionism", count: "12" },
			{ value: "Gallery 11 \u2014 19th-Century French", count: "8" },
			{ value: "Gallery 22 \u2014 American Modernism", count: "6" },
			{ value: "Court of Honor \u2014 Rodin", count: "14" },
			{ value: "Gallery 6 \u2014 European Decorative Arts", count: "22" },
			{ value: "Gallery 15 \u2014 AOA", count: "18" },
		],
	},
	{
		id: "exhibition",
		label: "Exhibition",
		options: [
			{ value: "Impressionism: Masterworks (2019)", count: "48" },
			{ value: "Rodin: The Shock of the Modern Body (2017)", count: "32" },
			{ value: "California Modern (2018)", count: "24" },
			{ value: "Pissarro\u2019s People (2011)", count: "18" },
		],
	},
	{
		id: "identity",
		label: "Identity",
		options: [
			{ value: "Women artists", count: "8,432" },
			{ value: "BIPOC artists", count: "6,213" },
			{ value: "LGBTQ+ artists", count: "1,876" },
			{ value: "Self-taught artists", count: "432" },
		],
	},
];

// ── Facet dialog ────────────────────────────────────────────────────

function FacetDialog({
	facet,
	onClose,
}: {
	facet: FacetConfig;
	onClose: () => void;
}) {
	const [search, setSearch] = useState("");
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog && !dialog.open) dialog.showModal();
	}, []);

	const filtered = facet.options.filter((o) =>
		o.value.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: dialog backdrop dismiss
		<dialog
			ref={dialogRef}
			onClose={onClose}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			className="m-auto w-full max-w-md border border-gray-300 bg-white p-0 backdrop:bg-black/30"
		>
			<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
				<h3 className="font-mono text-label font-bold uppercase">
					{facet.label}
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="font-mono text-meta text-gray-500 hover:text-gray-600"
				>
					Close
				</button>
			</div>
			<div className="border-b border-gray-200 px-4 py-2">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={`Filter ${facet.label.toLowerCase()}...`}
					className="w-full bg-white font-mono text-body text-gray-900 placeholder:text-gray-500 focus:outline-none"
				/>
			</div>
			<div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto p-2">
				{filtered.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={onClose}
						className="flex items-center justify-between px-2 py-1.5 font-mono text-body hover:bg-gray-50"
					>
						<span>{option.value}</span>
						<span className="font-mono text-meta tabular-nums text-gray-500">
							{option.count}
						</span>
					</button>
				))}
				{filtered.length === 0 && (
					<p className="px-2 py-3 font-mono text-meta text-gray-400">
						No matches
					</p>
				)}
			</div>
		</dialog>
	);
}

// ── Results ─────────────────────────────────────────────────────────

function ResultsGrid() {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{objects.map((work) => (
				<Link
					key={work.id}
					href={`/object-detail?id=${work.id}`}
					className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
				>
					<div className="relative">
						<ImagePlaceholder label={`[${work.title}]`} />
						{work.copyrightStatus === "public-domain" && (
							<span
								title="Open access — public domain. Direct download available."
								className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-green-400 bg-white font-mono text-label font-semibold text-green-700"
							>
								↓
							</span>
						)}
					</div>
					<div className="p-3">
						<h3 className="font-mono text-meta font-medium leading-snug">
							{work.title}
						</h3>
						<p className="mt-0.5 font-mono text-label text-gray-500">
							{work.attribution && (
								<span className="italic text-gray-400">
									{work.attribution}{" "}
								</span>
							)}
							{work.artist}
						</p>
						<p className="font-mono text-label text-gray-400">{work.date}</p>
						<div className="mt-1.5 flex flex-wrap items-center gap-1">
							{work.onView && (
								<span className="inline-block border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 font-mono text-label text-emerald-700">
									On view
								</span>
							)}
							{work.copyrightStatus === "public-domain" && (
								<span className="inline-block border border-green-300 bg-green-50 px-1.5 py-0.5 font-mono text-label text-green-700">
									Open access
								</span>
							)}
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}

function ResultsList() {
	return (
		<div className="flex flex-col border border-gray-300">
			{objects.map((work, i) => (
				<Link
					key={work.id}
					href={`/object-detail?id=${work.id}`}
					className={`flex gap-4 p-4 text-left transition-colors hover:bg-gray-50 ${i > 0 ? "border-t border-gray-200" : ""}`}
				>
					<div className="w-20 shrink-0">
						<ImagePlaceholder aspect="1/1" label="[img]" />
					</div>
					<div className="flex-1">
						<h3 className="font-mono text-body font-medium">{work.title}</h3>
						<p className="mt-0.5 font-mono text-meta text-gray-500">
							{work.attribution && (
								<span className="italic">{work.attribution} </span>
							)}
							{work.artist}, {work.date}
						</p>
						<p className="font-mono text-meta text-gray-400">{work.medium}</p>
					</div>
					<div className="shrink-0 text-right">
						<p className="font-mono text-meta text-gray-400">
							{work.department}
						</p>
						<p className="font-mono text-label text-gray-400">
							{work.accession}
						</p>
						<div className="mt-1 flex flex-col items-end gap-0.5">
							{work.onView && (
								<span className="inline-block border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 font-mono text-label text-emerald-700">
									On view
								</span>
							)}
							{work.copyrightStatus === "public-domain" && (
								<span
									title="Open access — direct download"
									className="inline-block border border-green-300 bg-green-50 px-1.5 py-0.5 font-mono text-label text-green-700"
								>
									↓ Open access
								</span>
							)}
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}

function ZeroResults() {
	const suggestions = [
		"Pissarro",
		"Rodin sculpture",
		"watercolour",
		"Japanese textile",
	];
	const featured = objects.slice(0, 4);
	return (
		<div className="flex flex-col gap-8">
			{/* Did you mean */}
			<div className="border border-amber-300 bg-amber-50 px-4 py-3">
				<p className="font-mono text-meta text-amber-900">
					No results for <strong>"glass vases form 1972"</strong>.
				</p>
				<p className="mt-1 font-mono text-meta text-gray-700">
					Did you mean{" "}
					<button
						type="button"
						className="underline decoration-amber-500 hover:decoration-amber-700"
					>
						glass vases <em>from</em> 1972
					</button>
					?
				</p>
			</div>

			{/* Search tips */}
			<div>
				<SectionLabelInline>Try</SectionLabelInline>
				<ul className="mt-2 flex flex-col gap-1 font-mono text-meta text-gray-600">
					<li>· Check spelling, or use fewer words</li>
					<li>· Remove a filter to broaden results</li>
					<li>· Try a related term — medium, period, geography</li>
					<li>
						· Switch to <strong>natural language</strong> search at the top
					</li>
				</ul>
			</div>

			{/* Suggested searches */}
			<div>
				<SectionLabelInline>Popular searches</SectionLabelInline>
				<div className="mt-2 flex flex-wrap gap-2">
					{suggestions.map((s) => (
						<Link
							key={s}
							href="/search-results"
							className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-700 hover:border-gray-500"
						>
							{s}
						</Link>
					))}
				</div>
			</div>

			{/* Featured fallback */}
			<div>
				<SectionLabelInline>From the collection</SectionLabelInline>
				<p className="mt-1 font-mono text-label text-gray-500">
					Curator highlights to keep you exploring
				</p>
				<div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
					{featured.map((work) => (
						<Link
							key={work.id}
							href={`/object-detail?id=${work.id}`}
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
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

function SectionLabelInline({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-label uppercase tracking-wide text-gray-400">
			{children}
		</span>
	);
}

// ── Page ────────────────────────────────────────────────────────────

function SearchResultsContent() {
	const variation = usePageVariations(VIEW_VARIATIONS);
	const [openFacet, setOpenFacet] = useState<string | null>(null);

	const activeFacet = FACETS.find((f) => f.id === openFacet);

	return (
		<ScopePage id="search-results">
			<div className="min-h-screen bg-white">
				{/* Search bar */}
				<WireframeSection
					label="Search bar"
					className="border-b border-gray-300 py-6"
				>
					<Container>
						<ScopeMark label="Search modes">
							<div className="mb-3 flex flex-wrap items-center gap-2">
								<button
									type="button"
									className="border-2 border-gray-900 px-3 py-1.5 font-mono text-meta font-medium"
								>
									{t("search.modeKeyword")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-600 hover:border-gray-500"
								>
									{t("search.modeSemantic")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-600 hover:border-gray-500"
								>
									{t("search.modeVisual")}
								</button>
								<span className="ml-2 font-mono text-label text-gray-400">
									AI-powered &middot; computer-vision
								</span>
							</div>
						</ScopeMark>
						<CollectionAutocomplete />
						<ScopeMark label="Accession-number tip">
							<p className="mt-2 font-mono text-label text-gray-500">
								{t("search.accessionTip")}
							</p>
						</ScopeMark>
						<ScopeMark label="Visual search affordances">
							<div className="mt-2 flex flex-wrap items-center gap-2 border border-dashed border-gray-300 px-3 py-2">
								<span className="font-mono text-label uppercase tracking-wide text-gray-400">
									Try
								</span>
								<button
									type="button"
									className="border border-gray-300 px-2 py-1 font-mono text-label text-gray-600 hover:border-gray-500"
								>
									{t("search.visualUpload")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-2 py-1 font-mono text-label text-gray-600 hover:border-gray-500"
								>
									{t("search.visualCamera")}
								</button>
								<span className="ml-2 font-mono text-label text-gray-500">
									{t("search.visualHint")}
								</span>
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Horizontal facet bar */}
				<WireframeSection
					label="Advanced filters"
					className="border-b border-gray-300 py-3"
				>
					<Container>
						<ScopeMark label="Dynamic filtering">
							<div className="flex flex-wrap items-center gap-2">
								{FACETS.map((facet) => (
									<button
										key={facet.id}
										type="button"
										onClick={() =>
											setOpenFacet(openFacet === facet.id ? null : facet.id)
										}
										className={`border px-3 py-1.5 font-mono text-meta transition-colors ${
											openFacet === facet.id
												? "border-gray-500 bg-gray-100 font-medium"
												: "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
										}`}
									>
										{facet.label} &#x25BE;
									</button>
								))}

								{/* Date range */}
								<ScopeMark label="Date range filter">
									<div className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5">
										<span className="font-mono text-meta text-gray-400">
											3000 BCE
										</span>
										<span className="font-mono text-meta text-gray-400">
											&ndash;
										</span>
										<span className="font-mono text-meta text-gray-400">
											2021
										</span>
									</div>
								</ScopeMark>

								{/* Toggles */}
								<span className="flex cursor-pointer items-center gap-1.5 font-mono text-meta text-gray-500 hover:text-gray-700">
									<span className="inline-block h-3.5 w-3.5 border border-gray-300" />
									{t("search.filterOnView")}
								</span>
								<span className="flex cursor-pointer items-center gap-1.5 font-mono text-meta text-gray-500 hover:text-gray-700">
									<span className="inline-block h-3.5 w-3.5 border border-gray-300" />
									{t("search.filterHasImage")}
								</span>
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>

				{/* Facet dialog */}
				{activeFacet && (
					<FacetDialog facet={activeFacet} onClose={() => setOpenFacet(null)} />
				)}

				{/* Results */}
				<Container className="py-8">
					<WireframeSection label="Results grid">
						{/* Results header */}
						<div className="mb-4 flex items-center justify-between">
							<span className="font-mono text-body font-medium">
								{t("search.resultsCount")}
							</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-label text-gray-500">
									{t("search.sortLabel")}:
								</span>
								<select className="border border-gray-300 px-2 py-1 font-mono text-label">
									<option>{t("search.sortRelevance")}</option>
									<option>{t("search.sortDateAsc")}</option>
									<option>{t("search.sortDateDesc")}</option>
									<option>{t("search.sortAZ")}</option>
								</select>
							</div>
						</div>

						{/* Grid / List view */}
						{variation === "zero-results" ? (
							<ZeroResults />
						) : variation === "list" ? (
							<ResultsList />
						) : (
							<ResultsGrid />
						)}

						{/* Pagination */}
						<div className="mt-6 flex items-center justify-center gap-2">
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-400">
								&larr; {t("search.prev")}
							</span>
							<span className="border border-gray-900 bg-gray-900 px-3 py-1.5 font-mono text-meta text-white">
								1
							</span>
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-500">
								2
							</span>
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-500">
								3
							</span>
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-500">
								...
							</span>
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-500">
								12,043
							</span>
							<span className="border border-gray-200 px-3 py-1.5 font-mono text-meta text-gray-500">
								{t("search.next")} &rarr;
							</span>
						</div>
					</WireframeSection>

					{/* Downloadable results */}
					<ScopeMark label="Downloadable results">
						<div className="mt-6 flex items-center gap-4 border border-dashed border-gray-300 px-4 py-3">
							<span className="font-mono text-meta text-gray-500">
								{t("search.exportResults")}
							</span>
							<button
								type="button"
								className="font-mono text-meta text-gray-500 underline"
							>
								{t("search.exportCSV")}
							</button>
							<button
								type="button"
								className="font-mono text-meta text-gray-500 underline"
							>
								{t("search.exportPDF")}
							</button>
							<button
								type="button"
								className="font-mono text-meta text-gray-500 underline"
							>
								{t("search.exportShare")}
							</button>
						</div>
					</ScopeMark>
				</Container>
			</div>
		</ScopePage>
	);
}

export default function SearchResultsPage() {
	return (
		<Suspense>
			<SearchResultsContent />
		</Suspense>
	);
}
