"use client";

import Link from "next/link";
import {
	ImagePlaceholder,
	ScopeMark,
	SectionLabelInline,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import type { ConstituentDocument } from "@/lib/constituent-document";
import type { ArtistRecord } from "./SearchResultsClient";

export function isPublicDomain(o: CollectionDocument): boolean {
	// Two rights fields in play: free-text `copyright` (curated sample-docs)
	// and the structured `object_rights_type` enum carried by the grid-facets
	// slice (where `copyright` is null). Match either. Mirrors
	// grid-facets.tsx `isOpenAccess`.
	return (
		(o.copyright ?? "").toLowerCase().includes("public domain") ||
		o.object_rights_type === "Public Domain"
	);
}

export function ResultsGrid({
	items,
	getHref,
	columns = 4,
}: {
	items: CollectionDocument[];
	getHref: (id: number) => string;
	/** Max columns at lg+. Default 4; the left-column facet variations pass 3
	 *  since the main column is narrower. */
	columns?: 3 | 4;
}) {
	return (
		<div
			className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
		>
			{items.map((work) => (
				<Link
					key={work.id}
					href={getHref(work.id)}
					className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
				>
					<div className="relative">
						<ImagePlaceholder
							label={`[${work.title || work.accession_number}]`}
						/>
						{isPublicDomain(work) && (
							<span
								title="Open access: public domain. Direct download available."
								className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-green-400 bg-white font-mono text-label font-semibold text-green-700"
							>
								↓
							</span>
						)}
					</div>
					<div className="p-3">
						<h3 className="font-mono text-meta font-medium leading-snug">
							{work.title || work.accession_number}
						</h3>
						<p className="mt-0.5 font-mono text-label text-gray-500">
							{work.primary_artist_display || work.primary_artist}
						</p>
						<p className="font-mono text-label text-gray-400">
							{work.display_date || work.display_year || ""}
						</p>
						<div className="mt-1.5 flex flex-wrap items-center gap-1">
							{work.on_view && (
								<span className="inline-block border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 font-mono text-label text-emerald-700">
									On view
								</span>
							)}
							{isPublicDomain(work) && (
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

export function InterleavedResults({
	objectItems,
	artistItems,
	getArtistHref,
	getObjectHref,
}: {
	objectItems: CollectionDocument[];
	artistItems: ArtistRecord[];
	getArtistHref: (artist: ArtistRecord) => string;
	getObjectHref: (id: number) => string;
}) {
	type Item =
		| { kind: "object"; data: CollectionDocument }
		| { kind: "artist"; data: ArtistRecord };

	const items: Item[] = [];
	const objectQueue: Item[] = objectItems.map((o) => ({
		kind: "object",
		data: o,
	}));
	const artistQueue: Item[] = artistItems.map((a) => ({
		kind: "artist",
		data: a,
	}));
	let oi = 0;
	let ai = 0;
	let pos = 0;
	while (oi < objectQueue.length || ai < artistQueue.length) {
		if (pos % 4 === 2 && ai < artistQueue.length) {
			items.push(artistQueue[ai++]);
		} else if (oi < objectQueue.length) {
			items.push(objectQueue[oi++]);
		} else {
			items.push(artistQueue[ai++]);
		}
		pos++;
	}

	return (
		<ScopeMark label="Interleaved entity results">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{items.map((item) =>
					item.kind === "object" ? (
						<Link
							key={`o-${item.data.id}`}
							href={getObjectHref(item.data.id)}
							className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
						>
							<div className="relative">
								<ImagePlaceholder
									label={`[${item.data.title || item.data.accession_number}]`}
								/>
								<span className="absolute left-2 top-2 border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-label text-gray-600">
									Artwork
								</span>
							</div>
							<div className="p-3">
								<h3 className="font-mono text-meta font-medium leading-snug">
									{item.data.title || item.data.accession_number}
								</h3>
								<p className="mt-0.5 font-mono text-label text-gray-500">
									{item.data.primary_artist_display || item.data.primary_artist}
								</p>
								<p className="font-mono text-label text-gray-400">
									{item.data.display_date || item.data.display_year || ""}
								</p>
							</div>
						</Link>
					) : (
						<Link
							key={`a-${item.data.id}`}
							href={getArtistHref(item.data)}
							className="flex flex-col border-2 border-indigo-300 bg-indigo-50/30 text-left transition-colors hover:border-indigo-500"
						>
							<div className="relative">
								<ImagePlaceholder label={`[${item.data.name}]`} />
								<span className="absolute left-2 top-2 border border-indigo-400 bg-white px-1.5 py-0.5 font-mono text-label text-indigo-700">
									Artist
								</span>
							</div>
							<div className="p-3">
								<h3 className="font-mono text-meta font-medium leading-snug">
									{item.data.name}
								</h3>
								<p className="mt-0.5 font-mono text-label text-gray-500">
									{item.data.displayDate ||
										[item.data.nationality].filter(Boolean).join(", ")}
								</p>
								<p className="font-mono text-label text-gray-400">
									{item.data.workCount} work
									{item.data.workCount === 1 ? "" : "s"}
								</p>
							</div>
						</Link>
					),
				)}
			</div>
		</ScopeMark>
	);
}

export function ResultsList({
	items,
	getHref,
}: {
	items: CollectionDocument[];
	getHref: (id: number) => string;
}) {
	return (
		<div className="flex flex-col border border-gray-300">
			{items.map((work, i) => (
				<Link
					key={work.id}
					href={getHref(work.id)}
					className={`flex gap-4 p-4 text-left transition-colors hover:bg-gray-50 ${i > 0 ? "border-t border-gray-200" : ""}`}
				>
					<div className="w-20 shrink-0">
						<ImagePlaceholder aspect="1/1" label="[img]" />
					</div>
					<div className="flex-1">
						<h3 className="font-mono text-body font-medium">
							{work.title || work.accession_number}
						</h3>
						<p className="mt-0.5 font-mono text-meta text-gray-500">
							{work.primary_artist_display || work.primary_artist}
							{work.display_date ? `, ${work.display_date}` : ""}
						</p>
						<p className="font-mono text-meta text-gray-400">{work.medium}</p>
					</div>
					<div className="shrink-0 text-right">
						<p className="font-mono text-meta text-gray-400">
							{work.department}
						</p>
						<p className="font-mono text-label text-gray-400">
							{work.accession_number}
						</p>
						<div className="mt-1 flex flex-col items-end gap-0.5">
							{work.on_view && (
								<span className="inline-block border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 font-mono text-label text-emerald-700">
									On view
								</span>
							)}
							{isPublicDomain(work) && (
								<span
									title="Open access: direct download"
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

export function ArtistHero({
	artist,
	constituent,
	href,
}: {
	artist: ArtistRecord;
	constituent?: ConstituentDocument;
	href: string;
}) {
	const facets = constituent?.facets;
	const totalWorks = facets?.total_works ?? artist.workCount;
	const topClassifications = facets?.classifications?.slice(0, 3) ?? [];
	const topDepartments = facets?.departments?.slice(0, 2) ?? [];
	const topPlaces = facets?.top_places_of_creation?.slice(0, 3) ?? [];
	const dateRange = facets?.date_range;
	return (
		<ScopeMark label="Featured artist hero">
			<Link
				href={href}
				className="mb-8 flex flex-col gap-3 border-2 border-indigo-300 bg-indigo-50/30 px-5 py-4 transition-colors hover:border-indigo-500"
			>
				<div className="flex flex-col gap-1">
					<SectionLabelInline>Artist</SectionLabelInline>
					<h2 className="font-mono text-card font-medium">{artist.name}</h2>
					<p className="font-mono text-meta text-gray-600">
						{artist.displayDate ||
							[artist.nationality].filter(Boolean).join(", ")}
					</p>
				</div>

				{facets ? (
					<ScopeMark label="Constituent stats">
						<div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
							<div>
								<p className="font-mono text-card font-medium tabular-nums">
									{totalWorks.toLocaleString()}
								</p>
								<p className="font-mono text-label text-gray-500">
									works in collection
								</p>
							</div>
							{facets.on_view_count > 0 && (
								<div>
									<p className="font-mono text-card font-medium tabular-nums">
										{facets.on_view_count.toLocaleString()}
									</p>
									<p className="font-mono text-label text-gray-500">on view</p>
								</div>
							)}
							{facets.has_iiif_count > 0 && (
								<div>
									<p className="font-mono text-card font-medium tabular-nums">
										{facets.has_iiif_count.toLocaleString()}
									</p>
									<p className="font-mono text-label text-gray-500">
										with images
									</p>
								</div>
							)}
							{facets.exhibited_count > 0 && (
								<div>
									<p className="font-mono text-card font-medium tabular-nums">
										{facets.exhibited_count.toLocaleString()}
									</p>
									<p className="font-mono text-label text-gray-500">
										exhibited
									</p>
								</div>
							)}
						</div>
						<div className="mt-2 flex flex-col gap-1 font-mono text-label text-gray-600">
							{dateRange && (
								<p>
									<span className="text-gray-400">Date range: </span>
									{dateRange.earliest_year} &ndash; {dateRange.latest_year}
								</p>
							)}
							{topClassifications.length > 0 && (
								<p>
									<span className="text-gray-400">Mostly: </span>
									{topClassifications
										.map((c) => `${c.value} (${c.count})`)
										.join(", ")}
								</p>
							)}
							{topDepartments.length > 0 && (
								<p>
									<span className="text-gray-400">Held in: </span>
									{topDepartments.map((d) => d.value).join(", ")}
								</p>
							)}
							{topPlaces.length > 0 && (
								<p>
									<span className="text-gray-400">Places: </span>
									{topPlaces.map((p) => p.value).join(", ")}
								</p>
							)}
						</div>
					</ScopeMark>
				) : (
					<p className="font-mono text-meta text-gray-500">
						{totalWorks} work{totalWorks === 1 ? "" : "s"} in collection
					</p>
				)}

				<span className="font-mono text-label text-indigo-700 underline">
					View artist page &rarr;
				</span>
			</Link>
		</ScopeMark>
	);
}

export function ArtistsRow({
	items,
	getHref,
}: {
	items: ArtistRecord[];
	getHref: (artist: ArtistRecord) => string;
}) {
	const matches = items.slice(0, 5);
	if (matches.length === 0) return null;
	return (
		<ScopeMark label="Mixed entity results">
			<div className="mb-8">
				<div className="mb-3 flex items-baseline justify-between">
					<SectionLabelInline>Artists ({matches.length})</SectionLabelInline>
					<Link
						href="/artist-search"
						className="font-mono text-label text-gray-500 underline hover:text-gray-700"
					>
						See all artists &rarr;
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
					{matches.map((artist) => (
						<Link
							key={artist.id}
							href={getHref(artist)}
							className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
						>
							<ImagePlaceholder aspect="1/1" label={`[${artist.name}]`} />
							<div className="p-3">
								<h3 className="font-mono text-meta font-medium leading-snug">
									{artist.name}
								</h3>
								<p className="mt-0.5 font-mono text-label text-gray-500">
									{artist.displayDate ||
										[artist.nationality].filter(Boolean).join(", ")}
								</p>
								<p className="mt-1 font-mono text-label text-gray-400">
									{artist.workCount} work
									{artist.workCount === 1 ? "" : "s"} in collection
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</ScopeMark>
	);
}

export function ZeroResults({
	query,
	featured,
	getHref,
}: {
	query?: string;
	featured: CollectionDocument[];
	getHref: (id: number) => string;
}) {
	const suggestions = [
		"Pissarro",
		"Rodin sculpture",
		"watercolour",
		"Japanese textile",
	];
	const displayQuery = query || "glass vases form 1972";
	return (
		<div className="flex flex-col gap-8">
			{/* Did you mean — deferred from Phase 1 (CW-44: ES suggester tuning) */}
			<ScopeMark label="Did you mean">
				<div className="border border-amber-300 bg-amber-50 px-4 py-3">
					<p className="font-mono text-meta text-amber-900">
						No results for <strong>"{displayQuery}"</strong>.
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
			</ScopeMark>

			{/* Search tips */}
			<div>
				<SectionLabelInline>Try</SectionLabelInline>
				<ul className="mt-2 flex flex-col gap-1 font-mono text-meta text-gray-600">
					<li>· Check spelling, or use fewer words</li>
					<li>· Remove a filter to broaden results</li>
					<li>· Try a related term: medium, period, geography</li>
					<li>
						· Switch to <strong>natural language</strong> search at the top
					</li>
				</ul>
			</div>

			{/* Suggested searches — deferred from Phase 1 (CW-44: needs analytics) */}
			<ScopeMark label="Popular searches">
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
			</ScopeMark>

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
							href={getHref(work.id)}
							className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
						>
							<ImagePlaceholder
								label={`[${work.title || work.accession_number}]`}
							/>
							<div className="p-3">
								<h3 className="font-mono text-meta font-medium leading-snug">
									{work.title || work.accession_number}
								</h3>
								<p className="mt-0.5 font-mono text-label text-gray-500">
									{work.primary_artist_display || work.primary_artist}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
