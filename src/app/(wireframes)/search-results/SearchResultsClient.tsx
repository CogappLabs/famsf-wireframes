"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
	Container,
	ScopeMark,
	SectionLabelInline,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import CollectionAutocomplete from "@/components/wireframe/CollectionAutocomplete";
import type { CollectionDocument } from "@/lib/collection-document";
import type { ConstituentDocument } from "@/lib/constituent-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import {
	ARTIST_FACETS,
	countArtistFacet,
	countObjectFacet,
	type FacetConfig,
	FacetDialog,
	filterArtists,
	filterObjects,
	OBJECT_FACETS,
	objectCentury,
	type Selections,
} from "./facets";
import { GridFacetsView } from "./grid-facets";
import {
	ArtistHero,
	ArtistsRow,
	InterleavedResults,
	ResultsGrid,
	ResultsList,
	ZeroResults,
} from "./results";

export interface ArtistRecord {
	id: number;
	name: string;
	nationality: string | null;
	displayDate: string | null;
	role: string;
	workCount: number;
}

export function deriveArtists(docs: CollectionDocument[]): ArtistRecord[] {
	const byId = new Map<number, ArtistRecord & { _seen: Set<number> }>();
	for (const doc of docs) {
		for (const c of doc.constituents ?? []) {
			if (!c.DisplayName) continue;
			let entry = byId.get(c.ConstituentID);
			if (!entry) {
				entry = {
					id: c.ConstituentID,
					name: c.DisplayName,
					nationality: c.Nationality,
					displayDate: c.DisplayDate,
					role: c.Role || "Artist",
					workCount: 0,
					_seen: new Set(),
				};
				byId.set(c.ConstituentID, entry);
			}
			if (!entry._seen.has(doc.id)) {
				entry._seen.add(doc.id);
				entry.workCount += 1;
			}
		}
	}
	return Array.from(byId.values())
		.map(({ _seen: _, ...rest }) => rest)
		.sort((a, b) => b.workCount - a.workCount);
}

// grid-facets-modal is the primary search view (Phase 1 target): it's first,
// so bare /search-results loads it. The other entries stay as design
// alternatives behind ?variation=.
export const VIEW_VARIATIONS = [
	{ key: "grid-facets-modal", label: "Grid + facet modals" },
	{ key: "grid-facets", label: "Grid + facets" },
	{ key: "grid", label: "Grid" },
	{ key: "list", label: "List" },
	{ key: "zero-results", label: "Zero results" },
	{ key: "ai-search", label: "AI search" },
	{ key: "mixed", label: "Artworks + artists" },
	{ key: "interleaved", label: "Interleaved" },
] as const;

// ── Page ────────────────────────────────────────────────────────────

function SearchResultsContent({
	docs,
	gridFacetsDocs,
	constituents,
	constituentSlugById,
	objectSlugById,
}: {
	docs: CollectionDocument[];
	gridFacetsDocs: CollectionDocument[];
	constituents: ConstituentDocument[];
	constituentSlugById: Record<number, string>;
	objectSlugById: Record<number, string>;
}) {
	const constituentById = useMemo(() => {
		const m = new Map<number, ConstituentDocument>();
		for (const c of constituents) m.set(c.id, c);
		return m;
	}, [constituents]);

	const artistHref = (id: number, _name: string): string =>
		`/constituents/sample/${constituentSlugById[id]}`;

	const objectHref = (id: number): string =>
		objectSlugById[id]
			? `/objects/sample/${objectSlugById[id]}`
			: "/objects/sample";
	const variation = usePageVariations(VIEW_VARIATIONS);
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const query = (searchParams.get("q") ?? "").trim();
	const urlPinnedArtist = (searchParams.get("artist") ?? "").trim();
	const urlFacet = (searchParams.get("facet") ?? "").trim();
	const [openFacet, setOpenFacet] = useState<string | null>(null);
	const [searchMode, setSearchMode] = useState<
		"keyword" | "semantic" | "visual"
	>("keyword");

	const [entityScope, setEntityScope] = useState<
		"all" | "artworks" | "artists"
	>("all");
	const showEntityScope = variation === "mixed" || variation === "interleaved";

	const [selections, setSelections] = useState<Selections>({});
	const pinnedArtistName = urlPinnedArtist || selections.artist || "";
	const [onlyOnView, setOnlyOnView] = useState(false);
	const [onlyHasImage, setOnlyHasImage] = useState(false);

	// Only surface artists that have a real ConstituentDocument behind them.
	// Avoids dead links to /artist-page for constituents not (yet) in the
	// sample-constituents set (e.g. Crown Point Press, Kathan Brown).
	const allArtists = useMemo(
		() =>
			deriveArtists(docs).filter(
				(a) => constituentSlugById[a.id] !== undefined,
			),
		[docs, constituentSlugById],
	);

	const autocompleteHits = useMemo(
		() =>
			docs.map((d) => ({
				id: String(d.id),
				title: d.title || d.accession_number,
				artist: d.primary_artist_display || d.primary_artist || "",
				date: d.display_date || d.display_year || "",
				department: d.department || "",
				slug: objectSlugById[d.id],
			})),
		[docs, objectSlugById],
	);

	const autocompleteFacets = useMemo(() => {
		const buckets: {
			facetType: string;
			facetLabel: string;
			get: (d: CollectionDocument) => string[];
		}[] = [
			{
				facetType: "classification",
				facetLabel: "What",
				get: (d) => (d.classification ? [d.classification] : []),
			},
			{
				facetType: "department",
				facetLabel: "Collection",
				get: (d) => (d.department ? [d.department] : []),
			},
			{
				facetType: "artist",
				facetLabel: "Artist",
				get: (d) => (d.primary_artist ? [d.primary_artist] : []),
			},
			{
				facetType: "geography",
				facetLabel: "Geography",
				get: (d) => [
					...(d.term_place_of_creation ?? []).map((t) => t.term),
					...(d.term_related_geography ?? []).map((t) => t.term),
				],
			},
			{
				facetType: "period",
				facetLabel: "Period",
				get: (d) => (d.term_period ?? []).map((t) => t.term),
			},
			{
				facetType: "subject",
				facetLabel: "Subject",
				get: (d) => (d.term_subject ?? []).map((t) => t.term),
			},
			{
				facetType: "dateRange",
				facetLabel: "Date",
				get: (d) => {
					const c = objectCentury(d);
					return c ? [c] : [];
				},
			},
		];
		const out: {
			facetType: string;
			facetLabel: string;
			value: string;
			count: number;
		}[] = [];
		for (const b of buckets) {
			const counts = new Map<string, number>();
			for (const d of docs) {
				for (const v of b.get(d)) {
					if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
				}
			}
			for (const [value, count] of counts) {
				out.push({
					facetType: b.facetType,
					facetLabel: b.facetLabel,
					value,
					count,
				});
			}
		}
		return out;
	}, [docs]);

	// Autocomplete data for the grid-facets variations. The omnibox only
	// suggests the facets that actually appear on that page (Artist, Place,
	// Material, Technique, Classification, Department, Gallery), counted over
	// the same ~600-doc slice the page filters — so a suggestion never offers a
	// facet the page can't honour. Hits come from the slice too.
	const gridFacetsHits = useMemo(
		() =>
			gridFacetsDocs.map((d) => ({
				id: String(d.id),
				title: d.title || d.accession_number,
				artist: d.primary_artist_display || d.primary_artist || "",
				date: d.display_date || d.display_year || "",
				department: d.department || "",
				slug: objectSlugById[d.id],
			})),
		[gridFacetsDocs, objectSlugById],
	);

	const gridFacetsAutocompleteFacets = useMemo(() => {
		const buckets: {
			facetType: string;
			facetLabel: string;
			get: (d: CollectionDocument) => string[];
		}[] = [
			{
				facetType: "primary_artist",
				facetLabel: "Artist/maker",
				get: (d) => (d.primary_artist ? [d.primary_artist] : []),
			},
			{
				facetType: "culture",
				facetLabel: "Culture group",
				get: (d) => (d.culture ? [d.culture] : []),
			},
			{
				facetType: "place",
				facetLabel: "Place",
				get: (d) =>
					(d.facet_place ?? []).flatMap((p) =>
						[p.region, p.country, p.state, p.notable].filter((v): v is string =>
							Boolean(v),
						),
					),
			},
			{
				facetType: "material",
				facetLabel: "Medium",
				get: (d) =>
					(d.facet_material ?? []).flatMap((m) =>
						[m.parent, m.specific].filter((v): v is string => Boolean(v)),
					),
			},
			{
				facetType: "technique",
				facetLabel: "Technique",
				get: (d) => d.facet_technique ?? [],
			},
			{
				facetType: "classification",
				facetLabel: "Object type",
				get: (d) => (d.classification ? [d.classification] : []),
			},
			{
				facetType: "department",
				facetLabel: "Department",
				get: (d) => (d.department ? [d.department] : []),
			},
			{
				facetType: "gallery",
				facetLabel: "Gallery",
				get: (d) => (d.location_building ? [d.location_building] : []),
			},
		];
		const out: {
			facetType: string;
			facetLabel: string;
			value: string;
			count: number;
		}[] = [];
		for (const b of buckets) {
			const counts = new Map<string, number>();
			for (const d of gridFacetsDocs) {
				for (const v of new Set(b.get(d))) {
					counts.set(v, (counts.get(v) ?? 0) + 1);
				}
			}
			for (const [value, count] of counts) {
				out.push({
					facetType: b.facetType,
					facetLabel: b.facetLabel,
					value,
					count,
				});
			}
		}
		return out;
	}, [gridFacetsDocs]);

	const isGridFacets =
		variation === "grid-facets" || variation === "grid-facets-modal";

	const { queryObjects, queryArtists } = useMemo(() => {
		if (!query) return { queryObjects: docs, queryArtists: allArtists };
		const q = query.toLowerCase();
		const queryObjects = docs.filter((o) =>
			[
				o.title,
				o.primary_artist,
				o.primary_artist_display,
				o.medium,
				o.department,
				o.classification,
				o.accession_number,
				...(o.constituents ?? []).map((c) => c.DisplayName),
			]
				.filter(Boolean)
				.some((f) => f?.toLowerCase().includes(q)),
		);
		const queryArtists = allArtists.filter((a) =>
			[a.name, a.nationality, a.displayDate, a.role]
				.filter(Boolean)
				.some((f) => f?.toLowerCase().includes(q)),
		);
		return { queryObjects, queryArtists };
	}, [query, docs, allArtists]);

	const objectMatches = useMemo(() => {
		let items = filterObjects(queryObjects, selections);
		if (onlyOnView) items = items.filter((o) => o.on_view);
		if (onlyHasImage) items = items.filter((o) => o.has_image);
		return items;
	}, [queryObjects, selections, onlyOnView, onlyHasImage]);
	const artistMatches = useMemo(() => {
		let matches = filterArtists(queryArtists, selections);
		// Artwork-side Artist facet also scopes the artist tile list: picking
		// "Artist: X" should only surface that artist in the artists section.
		const artistSel = selections.artist;
		if (artistSel) {
			matches = matches.filter(
				(a) => a.name.toLowerCase() === artistSel.toLowerCase(),
			);
		}
		if (!pinnedArtistName) return matches;
		const pinned = matches.findIndex(
			(a) => a.name.toLowerCase() === pinnedArtistName.toLowerCase(),
		);
		if (pinned <= 0) return matches;
		const reordered = [...matches];
		const [pin] = reordered.splice(pinned, 1);
		reordered.unshift(pin);
		return reordered;
	}, [queryArtists, selections, pinnedArtistName]);

	const useArtistFacets = showEntityScope && entityScope === "artists";

	const visibleFacets: FacetConfig[] = useMemo(() => {
		if (useArtistFacets) {
			return ARTIST_FACETS.map((f) => ({
				id: f.id,
				label: f.label,
				options: countArtistFacet(
					filterArtists(queryArtists, { ...selections, [f.id]: null }),
					f,
				),
			})).filter((f) => f.options.length > 0 || selections[f.id] != null);
		}
		const applyToggles = (items: CollectionDocument[]) => {
			let r = items;
			if (onlyOnView) r = r.filter((o) => o.on_view);
			if (onlyHasImage) r = r.filter((o) => o.has_image);
			return r;
		};
		return OBJECT_FACETS.map((f) => ({
			id: f.id,
			label: f.label,
			options: countObjectFacet(
				applyToggles(
					filterObjects(queryObjects, { ...selections, [f.id]: null }),
				),
				f,
			),
		})).filter((f) => f.options.length > 0 || selections[f.id] != null);
	}, [
		useArtistFacets,
		queryObjects,
		queryArtists,
		selections,
		onlyOnView,
		onlyHasImage,
	]);

	const activeFacet = visibleFacets.find((f) => f.id === openFacet);

	const visibleObjects = entityScope === "artists" ? [] : objectMatches;
	const visibleArtists = entityScope === "artworks" ? [] : artistMatches;
	const totalResults = visibleObjects.length + visibleArtists.length;
	const showZeroResults =
		variation === "zero-results" || (query !== "" && totalResults === 0);

	const activeSelections = Object.entries(selections).filter(
		([, v]) => v != null,
	) as [string, string][];

	const setSelection = (facetId: string, value: string | null) => {
		setSelections((prev) => ({ ...prev, [facetId]: value }));
	};
	const clearSelections = () => {
		setSelections({});
		setOnlyOnView(false);
		setOnlyHasImage(false);
		// Strip pinned-artist / one-shot facet seed / free-text query from URL so
		// the hero card + seeded selection don't repopulate on next render.
		const params = new URLSearchParams(searchParams.toString());
		params.delete("artist");
		params.delete("facet");
		params.delete("q");
		const qs = params.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset filters when facet set changes
	useEffect(() => {
		setSelections({});
		setOpenFacet(null);
	}, [useArtistFacets]);

	// Seed selection from ?facet=type:value.
	// `facetId` here maps to an OBJECT_FACETS entry — autocomplete only emits
	// artwork facet types (classification / department / artist / medium /
	// geography / period / style / movement / materials / subject / dateRange).
	// Artist-scope facets (nationality / datesActive / role) have no ?facet=
	// path today; if added later, this effect needs to know which facet set the
	// id belongs to before flipping entityScope.
	useEffect(() => {
		if (!urlFacet) return;
		const idx = urlFacet.indexOf(":");
		if (idx < 0) return;
		const facetId = urlFacet.slice(0, idx);
		const value = urlFacet.slice(idx + 1);
		if (!facetId || !value) return;
		setSelections((prev) =>
			prev[facetId] === value ? prev : { ...prev, [facetId]: value },
		);
	}, [urlFacet]);

	return (
		<ScopePage id="search-results">
			<div className="min-h-screen bg-white">
				{/* Search bar */}
				<WireframeSection
					label="Search bar"
					className="border-b border-gray-300 py-6"
				>
					<Container>
						{variation === "ai-search" ? (
							<ScopeMark label="Search modes">
								<CollectionAutocomplete
									hits={autocompleteHits}
									facets={autocompleteFacets}
									leadingSlot={
										<select
											aria-label="Search mode"
											className="border border-gray-300 bg-white px-3 py-3 font-mono text-meta text-gray-500 hover:border-gray-500 focus:outline-none"
											value={searchMode}
											onChange={(e) =>
												setSearchMode(
													e.target.value as "keyword" | "semantic" | "visual",
												)
											}
										>
											<option value="keyword">{t("search.modeKeyword")}</option>
											<option value="semantic">
												{t("search.modeSemantic")}
											</option>
											<option value="visual">{t("search.modeVisual")}</option>
										</select>
									}
								/>
								<p className="mt-1.5 font-mono text-label text-gray-400">
									AI-powered &middot; computer-vision
								</p>
							</ScopeMark>
						) : (
							<CollectionAutocomplete
								hits={isGridFacets ? gridFacetsHits : autocompleteHits}
								facets={
									isGridFacets
										? gridFacetsAutocompleteFacets
										: autocompleteFacets
								}
							/>
						)}
						{variation === "ai-search" && searchMode === "visual" && (
							<ScopeMark label="Visual search affordances">
								<div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3">
									<span className="font-mono text-label text-gray-500">
										{t("search.visualHint")}
									</span>
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-label text-gray-700 hover:border-gray-500"
									>
										{t("search.visualUpload")}
									</button>
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-label text-gray-700 hover:border-gray-500"
									>
										{t("search.visualCamera")}
									</button>
								</div>
							</ScopeMark>
						)}
					</Container>
				</WireframeSection>

				{/* Grid + left-column facets variations: replace the horizontal
				    facet bar and results with a real-data faceted browse.
				    `grid-facets` expands each facet inline; `grid-facets-modal`
				    renders a button per facet that opens the control in a dialog. */}
				{variation === "grid-facets" || variation === "grid-facets-modal" ? (
					<Container className="py-8">
						<WireframeSection label="Faceted browse (real data)">
							<GridFacetsView
								docs={gridFacetsDocs}
								// Wireframe stand-in: the grid-facets slice (~600 docs) has no
								// per-object sample pages, so every card routes to the one
								// fully-built sample object (Water Lilies) to demo the
								// search → object-detail flow.
								getHref={() => "/objects/sample/water-lilies-1973-3"}
								layout={variation === "grid-facets-modal" ? "modal" : "inline"}
								query={query}
								seedFacet={urlFacet}
							/>
						</WireframeSection>
					</Container>
				) : (
					<>
						{/* Horizontal facet bar */}
						<WireframeSection
							label="Advanced filters"
							className="border-b border-gray-300 py-3"
						>
							<Container>
								<ScopeMark label="Dynamic filtering">
									<div className="flex flex-wrap items-center gap-2">
										{visibleFacets.map((facet) => {
											const sel = selections[facet.id];
											const button = (
												<button
													key={facet.id}
													type="button"
													onClick={() =>
														setOpenFacet(
															openFacet === facet.id ? null : facet.id,
														)
													}
													className={`border px-3 py-1.5 font-mono text-meta transition-colors ${
														sel
															? "border-gray-900 bg-gray-900 text-white"
															: openFacet === facet.id
																? "border-gray-500 bg-gray-100 font-medium"
																: "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
													}`}
												>
													{facet.label}
													{sel ? `: ${sel}` : ""} &#x25BE;
												</button>
											);
											if (facet.id === "gallery") {
												return (
													<ScopeMark
														key={facet.id}
														label="Gallery location filter"
													>
														{button}
													</ScopeMark>
												);
											}
											return button;
										})}

										{/* Toggles — artwork-level, hidden in artist scope */}
										{!(showEntityScope && entityScope === "artists") && (
											<>
												<label className="flex cursor-pointer items-center gap-1.5 font-mono text-meta text-gray-500 hover:text-gray-700">
													<input
														type="checkbox"
														checked={onlyOnView}
														onChange={(e) => setOnlyOnView(e.target.checked)}
														className="h-3.5 w-3.5 border border-gray-300"
													/>
													{t("search.filterOnView")}
												</label>
												<label className="flex cursor-pointer items-center gap-1.5 font-mono text-meta text-gray-500 hover:text-gray-700">
													<input
														type="checkbox"
														checked={onlyHasImage}
														onChange={(e) => setOnlyHasImage(e.target.checked)}
														className="h-3.5 w-3.5 border border-gray-300"
													/>
													{t("search.filterHasImage")}
												</label>
											</>
										)}
									</div>
								</ScopeMark>
							</Container>
						</WireframeSection>

						{/* Facet dialog */}
						{activeFacet && (
							<FacetDialog
								facet={activeFacet}
								selected={selections[activeFacet.id] ?? null}
								onSelect={(v) => setSelection(activeFacet.id, v)}
								onClose={() => setOpenFacet(null)}
							/>
						)}

						{/* Results */}
						<Container className="py-8">
							<WireframeSection label="Results grid">
								{/* Results header */}
								<div className="mb-4 flex items-center justify-between">
									<span className="font-mono text-body font-medium">
										{totalResults} result{totalResults === 1 ? "" : "s"}
										{query ? ` for "${query}"` : ""}
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

								{/* Entity scope pills */}
								{showEntityScope && (
									<ScopeMark label="Entity-type scope">
										<div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
											{(
												[
													{
														key: "all",
														label: `All (${objectMatches.length + artistMatches.length})`,
													},
													{
														key: "artworks",
														label: `Artworks (${objectMatches.length})`,
													},
													{
														key: "artists",
														label: `Artists (${artistMatches.length})`,
													},
												] as const
											).map((opt) => (
												<button
													key={opt.key}
													type="button"
													onClick={() => {
														setEntityScope(opt.key);
														setOpenFacet(null);
													}}
													className={`border px-3 py-1.5 font-mono text-meta transition-colors ${
														entityScope === opt.key
															? "border-gray-900 bg-gray-900 text-white"
															: "border-gray-300 hover:border-gray-500"
													}`}
												>
													{opt.label}
												</button>
											))}
										</div>
									</ScopeMark>
								)}

								{/* Active selection chips */}
								{(activeSelections.length > 0 ||
									onlyOnView ||
									onlyHasImage) && (
									<div className="mb-4 flex flex-wrap items-center gap-2">
										<span className="font-mono text-label text-gray-500">
											Active filters:
										</span>
										{activeSelections.map(([facetId, value]) => {
											const label =
												visibleFacets.find((f) => f.id === facetId)?.label ??
												facetId;
											return (
												<button
													key={facetId}
													type="button"
													onClick={() => setSelection(facetId, null)}
													className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1 font-mono text-label text-white hover:bg-gray-700"
												>
													<span>
														{label}: {value}
													</span>
													<span>×</span>
												</button>
											);
										})}
										{onlyOnView && (
											<button
												type="button"
												onClick={() => setOnlyOnView(false)}
												className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1 font-mono text-label text-white hover:bg-gray-700"
											>
												<span>On view</span>
												<span>×</span>
											</button>
										)}
										{onlyHasImage && (
											<button
												type="button"
												onClick={() => setOnlyHasImage(false)}
												className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1 font-mono text-label text-white hover:bg-gray-700"
											>
												<span>Has image</span>
												<span>×</span>
											</button>
										)}
										<button
											type="button"
											onClick={clearSelections}
											className="font-mono text-label text-gray-500 underline hover:text-gray-700"
										>
											Clear all
										</button>
									</div>
								)}

								{/* Featured artist hero: surfaces when a single artist is the
						 focus of the result set, whether via autocomplete pick or
						 explicit Artist facet selection. */}
								{(() => {
									const heroArtist = pinnedArtistName
										? (artistMatches.find(
												(a) =>
													a.name.toLowerCase() ===
													pinnedArtistName.toLowerCase(),
											) ?? null)
										: null;
									const restArtists =
										heroArtist && visibleArtists.length > 0
											? visibleArtists.filter((a) => a.id !== heroArtist.id)
											: visibleArtists;
									return (
										<>
											{heroArtist && (
												<ArtistHero
													artist={heroArtist}
													constituent={constituentById.get(heroArtist.id)}
													href={artistHref(heroArtist.id, heroArtist.name)}
												/>
											)}
											{showZeroResults ? (
												<ZeroResults
													query={query}
													featured={docs.slice(0, 4)}
													getHref={objectHref}
												/>
											) : variation === "mixed" ? (
												<>
													{restArtists.length > 0 && (
														<ArtistsRow
															items={restArtists}
															getHref={(a) => artistHref(a.id, a.name)}
														/>
													)}
													{visibleObjects.length > 0 && (
														<>
															<div className="mb-3">
																<SectionLabelInline>
																	Artworks ({visibleObjects.length})
																</SectionLabelInline>
															</div>
															<ResultsGrid
																items={visibleObjects}
																getHref={objectHref}
															/>
														</>
													)}
												</>
											) : variation === "interleaved" ? (
												<InterleavedResults
													objectItems={visibleObjects}
													artistItems={restArtists}
													getArtistHref={(a) => artistHref(a.id, a.name)}
													getObjectHref={objectHref}
												/>
											) : variation === "list" ? (
												<ResultsList
													items={visibleObjects}
													getHref={objectHref}
												/>
											) : (
												<ResultsGrid
													items={visibleObjects}
													getHref={objectHref}
												/>
											)}
										</>
									);
								})()}

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
					</>
				)}
			</div>
		</ScopePage>
	);
}

export default function SearchResultsClient({
	docs,
	gridFacetsDocs,
	constituents,
	constituentSlugById,
	objectSlugById,
}: {
	docs: CollectionDocument[];
	gridFacetsDocs: CollectionDocument[];
	constituents: ConstituentDocument[];
	constituentSlugById: Record<number, string>;
	objectSlugById: Record<number, string>;
}) {
	return (
		<Suspense>
			<SearchResultsContent
				docs={docs}
				gridFacetsDocs={gridFacetsDocs}
				constituents={constituents}
				constituentSlugById={constituentSlugById}
				objectSlugById={objectSlugById}
			/>
		</Suspense>
	);
}
