"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ScopeMark, SectionLabelInline } from "@/components/wireframe";
import facetCounts from "@/data/facet-counts.json";
import famsfCollectionValues from "@/data/famsf-collection-values.json";
import mediumTaxonomy from "@/data/medium-taxonomy.json";
import type { CollectionDocument } from "@/lib/collection-document";
import { type FacetOption, objectYear } from "./facets";
import { isPublicDomain, ResultsGrid } from "./results";

// ── Grid + left-column facets variation ─────────────────────────────
//
// Real-data variation backed by src/data/grid-facets-docs/ (~600 docs with
// curator-taxonomy facets baked on by scripts/export_grid_facets_docs.py).
// Left column has two expandable hierarchies:
//   • Place  — region → country → [US state] → notable place (REGION_REMAP
//              workbook). The state tier is US-only; non-US places are 3-tier.
//   • Medium — Tier-1 (material group) → Tier-2 → Tier-3, from the curators'
//              12-Tier-1 material-group taxonomy. The FULL curated hierarchy is
//              shown with REAL full-collection object counts (from
//              scripts/build_medium_facet.py → src/data/medium-taxonomy.json),
//              not just the nodes the ~600-doc slice contains — so every taxonomy
//              node renders with its true count. Selecting a node still only
//              filters the slice, so a node with no slice member filters to 0.
// Each tree row carries a caret (expand/collapse children in place) and a
// checkbox (filter by that node, at any tier); a "Filter …" box prunes +
// auto-expands matching branches.

const PLACE_LEVELS = ["region", "country", "state", "notable"] as const;
type PlaceLevel = (typeof PLACE_LEVELS)[number];

/** A chosen place node: which tier, and its value. */
interface PlaceSelection {
	level: PlaceLevel;
	value: string;
}

// Medium is a 3-tier facet (section → subcategory → specific), same tree shape
// as place. A selection records the tier so nodes at different levels never
// collide.
const MEDIUM_LEVELS = ["section", "subcategory", "specific"] as const;
type MediumLevel = (typeof MEDIUM_LEVELS)[number];

interface MediumSelection {
	level: MediumLevel;
	value: string;
}

/** Inclusive year range for the date histogram filter. */
interface YearRange {
	min: number;
	max: number;
}

// Raw TMS place-term fields, surfaced as extra flat facets in the
// "More place options" accordion (place-plus variation). Each is a
// TermEntry[] on the doc; we filter/count on the `.term` string.
const PLACE_EXTRA_FIELDS = [
	{ id: "place_of_creation", label: "Place of creation" },
	{ id: "place_of_fabrication", label: "Place of fabrication" },
	{ id: "place_name_at_creation", label: "Place name at creation" },
	{ id: "related_geography", label: "Related geography" },
	{ id: "find_spot", label: "Find spot" },
] as const;

type PlaceExtraId = (typeof PLACE_EXTRA_FIELDS)[number]["id"];

const PLACE_EXTRA_ACCESSOR: Record<
	PlaceExtraId,
	(d: CollectionDocument) => string[]
> = {
	place_of_creation: (d) => (d.term_place_of_creation ?? []).map((t) => t.term),
	place_of_fabrication: (d) =>
		(d.term_place_of_fabrication ?? []).map((t) => t.term),
	place_name_at_creation: (d) =>
		(d.term_place_name_at_creation ?? []).map((t) => t.term),
	related_geography: (d) => (d.term_related_geography ?? []).map((t) => t.term),
	find_spot: (d) => (d.term_find_spot ?? []).map((t) => t.term),
};

// Geography source scope — the single dropdown inside the Place drawer. It
// narrows which place field a Place tree pick counts against, split into
// object-side (TMS place terms) and artist-side (constituents[].place_*) groups.
//
// The curated facet_place tree is source-field-agnostic (built from a Getty-TGN
// crosswalk over the object place terms), so a scope other than "all" cannot
// re-point the tree at one field. It applies a presence constraint instead: the
// object must record a value in the scoped field(s) AND match the tree node.
// Artist place fields are plain strings with no TGN path, so presence is the
// only thing they can ever contribute.
const GEO_SCOPES = [
	{ id: "all", label: "All geography", group: null },
	{ id: "object_all", label: "All object geography", group: "object" },
	{ id: "place_of_creation", label: "Place of creation", group: "object" },
	{
		id: "place_of_fabrication",
		label: "Place of fabrication",
		group: "object",
	},
	{
		id: "place_name_at_creation",
		label: "Place name at creation",
		group: "object",
	},
	{ id: "related_geography", label: "Related geography", group: "object" },
	{ id: "find_spot", label: "Find spot", group: "object" },
	{ id: "artist_all", label: "All artist geography", group: "artist" },
	{ id: "place_born", label: "Artist birthplace", group: "artist" },
	{ id: "place_died", label: "Artist place of death", group: "artist" },
	{ id: "place_active", label: "Artist place of activity", group: "artist" },
] as const;

type GeoScopeId = (typeof GEO_SCOPES)[number]["id"];

/** Values a doc records for one artist place field (constituents[].place_*). */
const artistPlaces = (
	d: CollectionDocument,
	key: "place_born" | "place_died" | "place_active",
): string[] =>
	(d.constituents ?? [])
		.map((c) => c[key])
		.filter((v): v is string => Boolean(v?.trim()));

/** Every place value a scope covers on a doc. Empty = doc out of scope. */
function geoScopeValues(d: CollectionDocument, scope: GeoScopeId): string[] {
	switch (scope) {
		case "all":
			return ["*"];
		case "object_all":
			return PLACE_EXTRA_FIELDS.flatMap(({ id }) =>
				PLACE_EXTRA_ACCESSOR[id](d),
			);
		case "artist_all":
			return [
				...artistPlaces(d, "place_born"),
				...artistPlaces(d, "place_died"),
				...artistPlaces(d, "place_active"),
			];
		case "place_born":
		case "place_died":
		case "place_active":
			return artistPlaces(d, scope);
		default:
			return PLACE_EXTRA_ACCESSOR[scope](d);
	}
}

interface GridFacetSelections {
	artist: string | null;
	culture: string | null;
	place: PlaceSelection | null;
	/** Which place field the Place tree pick is scoped to (presence constraint). */
	geoScope: GeoScopeId;
	medium: MediumSelection | null;
	classification: string | null;
	department: string | null;
	/** FAMSF Collection, the curators' subdepartment grouping (CW-254). Not yet
	 *  served, so the options are static and a pick filters the slice to 0. */
	collection: string | null;
	date: YearRange | null;
	onView: boolean;
	/** When On view is active, narrow to one museum. null = either. */
	onViewBuilding: "de Young" | "Legion" | null;
	hasImage: boolean;
	openAccess: boolean;
}

const EMPTY_GRID_SELECTIONS: GridFacetSelections = {
	artist: null,
	culture: null,
	place: null,
	geoScope: "all",
	medium: null,
	classification: null,
	department: null,
	collection: null,
	date: null,
	onView: false,
	onViewBuilding: null,
	hasImage: false,
	openAccess: false,
};

function docMatchesPlace(
	doc: CollectionDocument,
	place: PlaceSelection | null,
): boolean {
	if (!place) return true;
	return (doc.facet_place ?? []).some((p) => p[place.level] === place.value);
}

function docMatchesMedium(
	doc: CollectionDocument,
	medium: MediumSelection | null,
): boolean {
	if (!medium) return true;
	return (doc.facet_medium ?? []).some((m) => m[medium.level] === medium.value);
}

/** Free-text omnibox match over the fields a visitor is likely to type:
 *  title, artist, medium, department, classification, accession number. */
function docMatchesQuery(doc: CollectionDocument, q: string): boolean {
	if (!q) return true;
	return [
		doc.title,
		doc.primary_artist,
		doc.primary_artist_display,
		doc.medium,
		doc.department,
		doc.classification,
		doc.accession_number,
	]
		.filter(Boolean)
		.some((f) => f?.toLowerCase().includes(q));
}

function filterGridDocs(
	docs: CollectionDocument[],
	sel: GridFacetSelections,
	query = "",
): CollectionDocument[] {
	const q = query.trim().toLowerCase();
	return docs.filter((d) => {
		if (!docMatchesQuery(d, q)) return false;
		if (sel.artist && d.primary_artist !== sel.artist) return false;
		if (sel.culture && d.culture !== sel.culture) return false;
		if (!docMatchesPlace(d, sel.place)) return false;
		// Geography source scope: presence constraint layered on the tree pick.
		if (sel.geoScope !== "all" && geoScopeValues(d, sel.geoScope).length === 0)
			return false;
		if (!docMatchesMedium(d, sel.medium)) return false;
		if (sel.classification && d.classification !== sel.classification)
			return false;
		if (sel.department && d.department !== sel.department) return false;
		// FAMSF Collection is not on the documents yet, so any pick matches
		// nothing. Deliberate: the count is real, the slice cannot satisfy it.
		if (sel.collection) return false;
		if (sel.date) {
			const y = objectYear(d);
			if (y == null || y < sel.date.min || y > sel.date.max) return false;
		}
		if (sel.onView && !d.on_view) return false;
		if (
			sel.onView &&
			sel.onViewBuilding &&
			d.location_building !== sel.onViewBuilding
		)
			return false;
		if (sel.hasImage && !d.has_image) return false;
		if (sel.openAccess && !isPublicDomain(d)) return false;
		return true;
	});
}

const DATE_BIN = 10; // decade bins for the year histogram

interface YearBin {
	/** Inclusive start year of the bin. */
	start: number;
	count: number;
}

interface YearHistogram {
	/** Only the decade bins that contain objects, chronological. Empty
	 *  decades are dropped so the (equal-width) bars track data density
	 *  rather than calendar time — the sparse ancient tail collapses and the
	 *  dense modern cluster gets most of the width. */
	bins: YearBin[];
	min: number;
	max: number;
}

/** Decade-binned year histogram over the docs that carry a year, keeping
 *  only non-empty bins. */
function buildYearHistogram(docs: CollectionDocument[]): YearHistogram | null {
	const counts = new Map<number, number>();
	for (const d of docs) {
		const y = objectYear(d);
		if (y == null) continue;
		const start = Math.floor(y / DATE_BIN) * DATE_BIN;
		counts.set(start, (counts.get(start) ?? 0) + 1);
	}
	if (counts.size === 0) return null;
	const bins: YearBin[] = Array.from(counts.entries())
		.map(([start, count]) => ({ start, count }))
		.sort((a, b) => a.start - b.start);
	return {
		bins,
		min: bins[0].start,
		max: bins[bins.length - 1].start + DATE_BIN - 1,
	};
}

/** "1850" or "650 BCE" — a year label for the date range chip / axis. */
function yearLabel(y: number): string {
	return y < 0 ? `${Math.abs(y)} BCE` : `${y}`;
}

// ── Sort (CW-39) ────────────────────────────────────────────────────

const SORT_OPTIONS = [
	{ key: "relevance", label: "Relevance" },
	{ key: "title", label: "Title (A–Z)" },
	{ key: "date", label: "Date (oldest)" },
	{ key: "artist", label: "Artist (A–Z)" },
	{ key: "accession", label: "Accession number" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

/** Sort a copy of the filtered docs. "relevance" keeps the incoming order
 *  (the slice's natural order, a stand-in for ES match score). */
function sortGridDocs(
	docs: CollectionDocument[],
	sort: SortKey,
): CollectionDocument[] {
	if (sort === "relevance") return docs;
	const out = [...docs];
	const cmpStr = (a: string, b: string) =>
		a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
	switch (sort) {
		case "title":
			out.sort((a, b) => cmpStr(a.title || "", b.title || ""));
			break;
		case "date":
			out.sort((a, b) => {
				const ya = objectYear(a);
				const yb = objectYear(b);
				if (ya == null && yb == null) return 0;
				if (ya == null) return 1;
				if (yb == null) return -1;
				return ya - yb;
			});
			break;
		case "artist":
			out.sort((a, b) =>
				cmpStr(
					a.sort_artist || a.primary_artist || "",
					b.sort_artist || b.primary_artist || "",
				),
			);
			break;
		case "accession":
			out.sort((a, b) =>
				cmpStr(a.accession_number || "", b.accession_number || ""),
			);
			break;
	}
	return out;
}

const PAGE_SIZE = 24;

// ── Expandable facet trees (place + material) ───────────────────────

interface FacetTreeNode {
	value: string;
	count: number;
	children: FacetTreeNode[];
}

/** Facet options sort alphabetically across the board (client decision,
 *  2026-08-05), the one exception being Place Tier 1 (PLACE_TIER1_ORDER). */
const byLabelAsc = (a: string, b: string) =>
	a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

// Place Tier 1 keeps a curated order: loosely alphabetical, but grouping the
// Americas and the Asian regions together. Values not listed here sort
// alphabetically after the listed ones — the pipeline still reads an 18-row
// placeholder crosswalk, so several live Tier-1 labels ("Asia", "North and
// Central America", "Eastern Europe") are not yet curated into this list, and
// four listed regions (Central America, Central Asia, South Asia, Cuba) have no
// data yet.
const PLACE_TIER1_ORDER = [
	"Africa",
	"Central America",
	"North America",
	"South America",
	"Central Asia",
	"East Asia",
	"South Asia",
	"Southeast Asia",
	"Cuba",
	"Europe",
	"Middle East",
	"Oceania",
];

const placeTier1Rank = (value: string) => {
	const i = PLACE_TIER1_ORDER.indexOf(value);
	return i === -1 ? PLACE_TIER1_ORDER.length : i;
};

const byPlaceTier1 = (a: FacetTreeNode, b: FacetTreeNode) =>
	placeTier1Rank(a.value) - placeTier1Rank(b.value) ||
	byLabelAsc(a.value, b.value);

const byLabelAscNode = (a: FacetTreeNode, b: FacetTreeNode) =>
	byLabelAsc(a.value, b.value);

/** The full served value list for each flat facet, straight from the pipeline
 *  aggregate (build_facet_counts.py) rather than the ~600-doc slice — the same
 *  display-only approach the Place and Medium trees take, so reviewers see the
 *  real scale (13.5K artists, not the 181 the slice happens to carry). Counts are
 *  collection-wide; selecting a value the slice has no member for filters to 0. */
/** TMS data-entry artefacts that reach the culture field: a stray glyph, a bare
 *  "?", and cataloguer date stamps ("00/00/00", "3rd quarter 19th century--
 *  Harold Rehmen 4/2003"). 25 objects across 4 values, dropped from the facet
 *  rather than shown as cultures. Curator-side cleanup, not a render fix. */
const isJunkFacetValue = (value: string): boolean => {
	const v = value.trim();
	return v === "" || !/[A-Za-z]/.test(v) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v);
};

const FULL_FACET_OPTIONS: Record<string, FacetOption[]> = Object.fromEntries(
	(["artist", "culture", "classification", "department"] as const).map(
		(key) => [
			key,
			(facetCounts[key] as { value: string; count: number }[])
				.filter((o) => !isJunkFacetValue(o.value))
				.map((o) => ({ value: o.value, count: o.count }))
				.sort((a, b) => byLabelAsc(a.value, b.value)),
		],
	),
);

/**
 * The Place facet renders the served hierarchy with real full-collection counts
 * (scripts/build_facet_counts.py, reading the pipeline's own place.lvl0-lvl3),
 * so reviewers see the shape and scale the API actually returns. Same
 * display-only approach as the Medium tree below: selecting a node still
 * filters the ~600-doc slice, so a node with no slice member filters to 0.
 *
 * Values arrive as cumulative "A > B > C" paths, one flat list per level, so
 * nest them by hanging each path off its parent. Some region labels are still
 * raw TGN ("Roman Empire") or endonyms ("Deutschland"): the pipeline reads an
 * 18-row placeholder crosswalk rather than the 532-row curator REGION_REMAP
 * sheet, so the counts are real but the labels are not yet curated.
 */
const PLACE_TREE: FacetTreeNode[] = (() => {
	const byPath = new Map<string, FacetTreeNode>();
	const roots: FacetTreeNode[] = [];

	for (const lvl of ["lvl0", "lvl1", "lvl2", "lvl3"] as const) {
		for (const row of facetCounts.place[lvl]) {
			if (byPath.has(row.path)) continue;
			const node: FacetTreeNode = {
				value: row.value,
				count: row.count,
				children: [],
			};
			byPath.set(row.path, node);
			const parentPath = row.path.split(" > ").slice(0, -1).join(" > ");
			const parent = parentPath ? byPath.get(parentPath) : undefined;
			if (parent) parent.children.push(node);
			else if (!parentPath) roots.push(node);
		}
	}

	// Tier 1 takes the curated region order; every tier below it is alphabetical.
	const sortDeep = (nodes: FacetTreeNode[], depth: number) => {
		nodes.sort(depth === 0 ? byPlaceTier1 : byLabelAscNode);
		for (const n of nodes) sortDeep(n.children, depth + 1);
	};
	sortDeep(roots, 0);
	return roots;
})();

// The Medium facet renders the FULL curated 12-Tier-1 taxonomy with real
// full-collection counts, baked once by build_medium_facet.py. It is a
// static tree (not derived from the slice), so every taxonomy node shows with
// its true count even when no slice doc reaches it. The JSON ships count-desc
// and matches FacetTreeNode; re-sorted alphabetically here (every tier) per the
// client sort decision, with "Other" kept last as a catch-all bucket.
const MEDIUM_TREE: FacetTreeNode[] = (() => {
	const sortDeep = (nodes: FacetTreeNode[]): FacetTreeNode[] =>
		nodes
			.map((n) => ({ ...n, children: sortDeep(n.children) }))
			.sort(
				(a, b) =>
					Number(a.value === "Other") - Number(b.value === "Other") ||
					byLabelAsc(a.value, b.value),
			);
	return sortDeep(mediumTaxonomy as FacetTreeNode[]);
})();

/** Rows a flat facet shows before "Show more", which then reveals every option.
 *  Alphabetical, so this is the first ten A-Z, not the ten biggest. */
const FACET_TOP_N = 10;

/** A single expandable facet block in the left column. */
function FacetBlock({
	label,
	options,
	selected,
	onSelect,
	note,
	heading = true,
	topN = FACET_TOP_N,
}: {
	label: string;
	options: FacetOption[];
	selected: string | null;
	onSelect: (value: string | null) => void;
	/** Caveat shown under the label, for facets whose counts do not come from
	 *  the on-page slice. */
	note?: string;
	/** Off when an enclosing FacetAccordion already renders the label. */
	heading?: boolean;
	/** Rows before "Show more" (FACET_TOP_N by default). null lists every
	 *  option with no toggle. */
	topN?: number | null;
}) {
	const [expanded, setExpanded] = useState(false);
	const [search, setSearch] = useState("");
	if (options.length === 0 && !selected) return null;

	// Options arrive alphabetical from FULL_FACET_OPTIONS.
	const filtered = search
		? options.filter((o) =>
				o.value.toLowerCase().includes(search.toLowerCase()),
			)
		: options;
	const showAll = expanded || Boolean(search) || topN == null;
	const shown = showAll ? filtered : filtered.slice(0, topN);
	const hiddenCount = filtered.length - shown.length;

	return (
		<div className={heading ? "border-b border-gray-200 pb-3" : undefined}>
			{heading && (
				<p className="mb-1.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
					{label}
				</p>
			)}
			{note && (
				<p className="mb-1.5 font-mono text-label leading-snug text-gray-400">
					{note}
				</p>
			)}
			{selected && (
				<button
					type="button"
					aria-pressed
					onClick={() => onSelect(null)}
					className="mb-1 flex w-full items-start gap-2 border border-gray-900 bg-gray-900 px-2 py-1 font-mono text-meta text-white hover:bg-gray-700"
				>
					<span
						aria-hidden
						className="flex h-4 w-4 shrink-0 items-center justify-center border border-white text-label leading-none"
					>
						✓
					</span>
					<span className="min-w-0 flex-1 text-left break-words">
						{selected}
					</span>
					<span>×</span>
				</button>
			)}
			{topN != null && (
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={`Filter ${label.toLowerCase()}…`}
					className="mb-1.5 w-full border border-gray-200 bg-white px-2 py-1.5 font-mono text-meta text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
				/>
			)}
			{/* Expanded or search-filtered lists scroll in place (same cap as the
			    trees) so a long facet doesn't push the rest of the column away. */}
			<ul
				className={`flex flex-col ${
					topN != null && showAll && filtered.length > topN
						? "max-h-96 overflow-y-auto"
						: ""
				}`}
			>
				{shown
					.filter((o) => o.value !== selected)
					.map((o) => (
						<li key={o.value}>
							<button
								type="button"
								aria-pressed={false}
								onClick={() => onSelect(o.value)}
								className="flex w-full items-start gap-2 py-1 text-left font-mono text-meta text-gray-700 hover:bg-gray-50 hover:text-gray-950"
							>
								<span
									aria-hidden
									className="h-4 w-4 shrink-0 border border-gray-500 bg-white"
								/>
								<span className="min-w-0 flex-1 break-words">{o.value}</span>
								<span className="shrink-0 tabular-nums text-gray-500">
									{o.count.toLocaleString()}
								</span>
							</button>
						</li>
					))}
			</ul>
			{hiddenCount > 0 && (
				<button
					type="button"
					onClick={() => setExpanded(true)}
					className="mt-1 font-mono text-meta text-gray-500 underline hover:text-gray-700"
				>
					Show {hiddenCount} more
				</button>
			)}
			{topN != null && expanded && !search && filtered.length > topN && (
				<button
					type="button"
					onClick={() => setExpanded(false)}
					className="ml-3 mt-1 font-mono text-meta text-gray-500 underline hover:text-gray-700"
				>
					Show fewer
				</button>
			)}
		</div>
	);
}

/** Geography-source dropdown, rendered in the Place panel above the tree.
 *  Scopes a Place pick to one field (or field group); options with no data in
 *  the current slice are disabled rather than hidden, so reviewers see the full
 *  intended shape without any option that would always return zero. */
function GeoScopeSelect({
	value,
	counts,
	onChange,
}: {
	value: GeoScopeId;
	/** Docs carrying a value per scope, for the option counts + disabling. */
	counts: Record<GeoScopeId, number>;
	onChange: (v: GeoScopeId) => void;
}) {
	const optionsFor = (group: "object" | "artist") =>
		GEO_SCOPES.filter((s) => s.group === group).map((s) => {
			const n = counts[s.id] ?? 0;
			return (
				<option key={s.id} value={s.id} disabled={n === 0 && s.id !== value}>
					{s.label}
					{n > 0 ? ` (${n.toLocaleString()})` : " — no data"}
				</option>
			);
		});

	return (
		<div className="mb-3 border-b border-gray-200 pb-3">
			<label
				htmlFor="geo-scope"
				className="mb-1.5 block font-mono text-label uppercase tracking-[0.08em] text-gray-500"
			>
				Geography source
			</label>
			<select
				id="geo-scope"
				value={value}
				onChange={(e) => onChange(e.target.value as GeoScopeId)}
				className="w-full border border-gray-300 bg-white px-2 py-1.5 font-mono text-meta text-gray-900 focus:border-gray-500 focus:outline-none"
			>
				<option value="all">All geography</option>
				<optgroup label="Object geography">{optionsFor("object")}</optgroup>
				<optgroup label="Artist geography">{optionsFor("artist")}</optgroup>
			</select>
			{value !== "all" && (
				<p className="mt-1.5 font-mono text-meta text-gray-500">
					Narrowed to objects recording a value in this field. The place itself
					is still chosen in the tree below.
				</p>
			)}
		</div>
	);
}

/** Date facet as a horizontal year histogram with drag-select.
 *  Empty decades are dropped (see buildYearHistogram) so equal-width
 *  bars track density. Drag across the bars — or type into the From / To
 *  year inputs (keyboard / screen-reader path) — to set the {min,max} filter. */
function DateHistogram({
	histogram,
	value,
	onChange,
}: {
	histogram: YearHistogram | null;
	value: YearRange | null;
	onChange: (range: YearRange | null) => void;
}) {
	const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);

	if (!histogram || histogram.bins.length === 0) {
		return <p className="py-1 font-mono text-meta text-gray-500">No dates</p>;
	}
	const { bins, min, max } = histogram;
	const maxCount = bins.reduce((m, b) => Math.max(m, b.count), 0) || 1;

	// Which (dropped-empty) bins fall inside the active / in-progress range?
	const sel =
		drag != null
			? { lo: Math.min(drag.a, drag.b), hi: Math.max(drag.a, drag.b) }
			: value
				? {
						lo: bins.findIndex((b) => b.start + DATE_BIN - 1 >= value.min),
						hi: (() => {
							let h = -1;
							bins.forEach((b, i) => {
								if (b.start <= value.max) h = i;
							});
							return h;
						})(),
					}
				: null;

	const commit = (a: number, b: number) => {
		const lo = Math.min(a, b);
		const hi = Math.max(a, b);
		onChange({ min: bins[lo].start, max: bins[hi].start + DATE_BIN - 1 });
	};

	// Year inputs (a11y): clamp + order, then snap to the filter range.
	const setBound = (which: "min" | "max", raw: string) => {
		const n = Number.parseInt(raw, 10);
		if (Number.isNaN(n)) return;
		const cur = value ?? { min, max };
		const next =
			which === "min"
				? { min: n, max: Math.max(n, cur.max) }
				: { min: Math.min(n, cur.min), max: n };
		onChange({
			min: Math.max(min, Math.min(next.min, max)),
			max: Math.min(max, Math.max(next.max, min)),
		});
	};

	return (
		<div className="flex flex-col gap-2">
			<p className="font-mono text-meta text-gray-500">
				Drag across the bars, or type a year range below.
			</p>
			{/* Pointer drag is an enhancement; bars are real <button>s and
				    the From/To inputs give the keyboard / screen-reader path. */}
			<div
				className="flex h-32 items-end gap-px"
				onPointerLeave={() => {
					if (drag) {
						commit(drag.a, drag.b);
						setDrag(null);
					}
				}}
				onPointerUp={() => {
					if (drag) {
						commit(drag.a, drag.b);
						setDrag(null);
					}
				}}
			>
				{bins.map((b, i) => {
					const inSel = sel != null && i >= sel.lo && i <= sel.hi;
					return (
						<button
							key={b.start}
							type="button"
							title={`${yearLabel(b.start)}–${yearLabel(b.start + DATE_BIN - 1)}: ${b.count}`}
							aria-label={`${yearLabel(b.start)} to ${yearLabel(b.start + DATE_BIN - 1)}, ${b.count} objects`}
							onPointerDown={() => setDrag({ a: i, b: i })}
							onPointerEnter={() =>
								setDrag((prev) => (prev ? { ...prev, b: i } : prev))
							}
							onClick={() => {
								if (!drag) commit(i, i);
							}}
							className="flex h-full flex-1 items-end"
						>
							<span
								className={`w-full ${inSel ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"}`}
								style={{
									height: `${Math.max(2, (b.count / maxCount) * 100)}%`,
								}}
							/>
						</button>
					);
				})}
			</div>
			<div className="flex items-center justify-between font-mono text-label text-gray-500">
				<span>{yearLabel(min)}</span>
				<span>{yearLabel(max)}</span>
			</div>

			{/* Year inputs — the accessible, keyboard-driven path. */}
			<div className="flex items-end gap-2">
				<label className="flex flex-1 flex-col gap-0.5 font-mono text-label text-gray-500">
					From
					<input
						type="number"
						inputMode="numeric"
						value={value ? value.min : ""}
						min={min}
						max={max}
						placeholder={String(min)}
						onChange={(e) => setBound("min", e.target.value)}
						className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-meta text-gray-900 focus:border-gray-500 focus:outline-none"
					/>
				</label>
				<label className="flex flex-1 flex-col gap-0.5 font-mono text-label text-gray-500">
					To
					<input
						type="number"
						inputMode="numeric"
						value={value ? value.max : ""}
						min={min}
						max={max}
						placeholder={String(max)}
						onChange={(e) => setBound("max", e.target.value)}
						className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-meta text-gray-900 focus:border-gray-500 focus:outline-none"
					/>
				</label>
				{value && (
					<button
						type="button"
						onClick={() => onChange(null)}
						className="shrink-0 py-1 font-mono text-meta text-gray-500 underline hover:text-gray-700"
					>
						Clear
					</button>
				)}
			</div>
		</div>
	);
}

const PLACE_LEVEL_BY_DEPTH: PlaceLevel[] = [
	"region",
	"country",
	"state",
	"notable",
];
const MEDIUM_LEVEL_BY_DEPTH: MediumLevel[] = [
	"section",
	"subcategory",
	"specific",
];

/** A generic tier selection — level name + chosen value. */
interface TierSelection {
	level: string;
	value: string;
}

/**
 * One row in an expandable facet tree. The caret (left) toggles expand;
 * the checkbox + label (right) toggles the filter. Two distinct hit
 * targets, each with its own hover state, so a node reads as both
 * expandable and selectable.
 */
function FacetTreeRow({
	node,
	depth,
	levelByDepth,
	expanded,
	onToggle,
	selected,
	onSelect,
}: {
	node: FacetTreeNode;
	depth: number;
	levelByDepth: string[];
	expanded: Set<string>;
	onToggle: (key: string) => void;
	selected: TierSelection | null;
	onSelect: (sel: TierSelection) => void;
}) {
	const level = levelByDepth[depth];
	const key = `${level}:${node.value}`;
	const hasChildren = node.children.length > 0;
	const isOpen = expanded.has(key);
	const isSelected = selected?.level === level && selected.value === node.value;

	return (
		<li>
			<div
				className="flex items-stretch"
				style={{ paddingLeft: `${depth * 14}px` }}
			>
				{/* Caret = expand/collapse. Own hover box; placeholder keeps
				    leaf rows aligned. */}
				{hasChildren ? (
					<button
						type="button"
						aria-label={isOpen ? "Collapse" : "Expand"}
						aria-expanded={isOpen}
						onClick={() => onToggle(key)}
						className="flex w-7 shrink-0 items-center justify-center font-mono text-meta text-gray-500 hover:bg-gray-100 hover:text-gray-800"
					>
						{isOpen ? "▾" : "▸"}
					</button>
				) : (
					<span className="w-7 shrink-0" />
				)}
				{/* Checkbox + label + count = the filter toggle. */}
				<button
					type="button"
					aria-pressed={isSelected}
					onClick={() => onSelect({ level, value: node.value })}
					className={`flex min-w-0 flex-1 items-center gap-2 py-1 pl-1 text-left font-mono text-meta hover:bg-gray-50 ${
						isSelected ? "text-gray-950" : "text-gray-700 hover:text-gray-950"
					}`}
				>
					<span
						aria-hidden
						className={`flex h-4 w-4 shrink-0 items-center justify-center border text-label leading-none ${
							isSelected
								? "border-gray-900 bg-gray-900 text-white"
								: "border-gray-500 bg-white"
						}`}
					>
						{isSelected ? "✓" : ""}
					</span>
					<span
						className={`min-w-0 flex-1 break-words ${isSelected ? "font-medium" : ""}`}
					>
						{node.value}
					</span>
					<span className="shrink-0 tabular-nums text-gray-500">
						{node.count.toLocaleString()}
					</span>
				</button>
			</div>
			{hasChildren && isOpen && (
				<ul className="flex flex-col">
					{node.children.map((child) => (
						<FacetTreeRow
							key={child.value}
							node={child}
							depth={depth + 1}
							levelByDepth={levelByDepth}
							expanded={expanded}
							onToggle={onToggle}
							selected={selected}
							onSelect={onSelect}
						/>
					))}
				</ul>
			)}
		</li>
	);
}

/** Shared expandable-tree facet block (search-within + empty state).
 *  `topN` caps the visible top-level rows with a "Show N more" toggle; pass
 *  null to always show every top-level row (used for Place / geography). */
function TreeFacet({
	label,
	tree,
	levelByDepth,
	selected,
	onSelect,
	expanded,
	onToggle,
	search,
	onSearch,
	topN = null,
	heading = true,
}: {
	label: string;
	tree: FacetTreeNode[];
	levelByDepth: string[];
	selected: TierSelection | null;
	onSelect: (sel: TierSelection) => void;
	expanded: Set<string>;
	onToggle: (key: string) => void;
	search: string;
	onSearch: (v: string) => void;
	topN?: number | null;
	/** Off when an enclosing FacetAccordion already renders the label. */
	heading?: boolean;
}) {
	const [showAll, setShowAll] = useState(false);

	// Prune to matches and auto-expand matched branches on free-text search.
	const { visible, forceOpen } = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return { visible: tree, forceOpen: null as Set<string> | null };
		const open = new Set<string>();
		const prune = (nodes: FacetTreeNode[], depth: number): FacetTreeNode[] => {
			const out: FacetTreeNode[] = [];
			for (const n of nodes) {
				const selfMatch = n.value.toLowerCase().includes(q);
				const kids = prune(n.children, depth + 1);
				if (selfMatch || kids.length > 0) {
					if (kids.length > 0) open.add(`${levelByDepth[depth]}:${n.value}`);
					out.push({ ...n, children: selfMatch ? n.children : kids });
				}
			}
			return out;
		};
		return { visible: prune(tree, 0), forceOpen: open };
	}, [tree, search, levelByDepth]);

	// Top-N cap only applies to the unsearched, unselected list.
	const capActive = topN != null && !search && !showAll;
	const rows = capActive ? visible.slice(0, topN) : visible;
	const hiddenCount = visible.length - rows.length;

	return (
		<div className={heading ? "border-b border-gray-200 pb-3" : undefined}>
			{heading && (
				<p className="mb-1.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
					{label}
				</p>
			)}
			<input
				type="text"
				value={search}
				onChange={(e) => onSearch(e.target.value)}
				placeholder={`Filter ${label.toLowerCase()}…`}
				className="mb-1.5 w-full border border-gray-200 bg-white px-2 py-1.5 font-mono text-meta text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
			/>
			{visible.length > 0 ? (
				<>
					<ul
						className={`flex flex-col ${
							topN == null ? "max-h-96 overflow-y-auto" : ""
						}`}
					>
						{rows.map((node) => (
							<FacetTreeRow
								key={node.value}
								node={node}
								depth={0}
								levelByDepth={levelByDepth}
								expanded={forceOpen ?? expanded}
								onToggle={onToggle}
								selected={selected}
								onSelect={onSelect}
							/>
						))}
					</ul>
					{hiddenCount > 0 && (
						<button
							type="button"
							onClick={() => setShowAll(true)}
							className="mt-1 font-mono text-meta text-gray-500 underline hover:text-gray-700"
						>
							Show {hiddenCount} more
						</button>
					)}
					{topN != null && showAll && !search && visible.length > topN && (
						<button
							type="button"
							onClick={() => setShowAll(false)}
							className="mt-1 font-mono text-meta text-gray-500 underline hover:text-gray-700"
						>
							Show fewer
						</button>
					)}
				</>
			) : (
				<p className="py-1 font-mono text-meta text-gray-500">
					No matching {label.toLowerCase()}
				</p>
			)}
		</div>
	);
}

/** One collapsible facet panel in the left column, Searchkit-style: the heading
 *  is the toggle (name + active count + chevron), with the control below it when
 *  open. The panel owns the heading, so the controls inside render headless
 *  (`heading={false}`). */
function FacetAccordion({
	label,
	activeCount,
	open,
	onToggle,
	children,
}: {
	label: string;
	activeCount: number;
	open: boolean;
	onToggle: () => void;
	children: ReactNode;
}) {
	return (
		<div className="border-b border-gray-200">
			<h3>
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={open}
					className="flex w-full items-center justify-between gap-2 py-3 text-left font-mono text-label uppercase tracking-[0.08em] text-gray-700 hover:text-gray-950"
				>
					<span>
						{label}
						{activeCount > 0 ? ` (${activeCount})` : ""}
					</span>
					<span
						aria-hidden
						className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
					>
						⌄
					</span>
				</button>
			</h3>
			{open && <div className="pb-3">{children}</div>}
		</div>
	);
}

/** Window of page numbers around the current page, with ellipses + first/last
 *  always shown. Returns entries that are either a page index or an ellipsis. */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
	if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
	const out: (number | "…")[] = [0];
	const lo = Math.max(1, page - 1);
	const hi = Math.min(pageCount - 2, page + 1);
	if (lo > 1) out.push("…");
	for (let i = lo; i <= hi; i++) out.push(i);
	if (hi < pageCount - 2) out.push("…");
	out.push(pageCount - 1);
	return out;
}

/** Numbered client-side pager. Pages are 0-indexed internally, shown 1-indexed. */
function Pager({
	page,
	pageCount,
	onPage,
	total,
	pageSize,
}: {
	page: number;
	pageCount: number;
	onPage: (p: number) => void;
	total: number;
	pageSize: number;
}) {
	if (pageCount <= 1) return null;
	const from = page * pageSize + 1;
	const to = Math.min(total, page * pageSize + pageSize);
	const cell =
		"min-w-9 border px-3 py-1.5 font-mono text-meta transition-colors";
	return (
		<nav
			aria-label="Pagination"
			className="mt-8 flex flex-col items-center gap-2"
		>
			<div className="flex flex-wrap items-center justify-center gap-1">
				<button
					type="button"
					onClick={() => onPage(page - 1)}
					disabled={page === 0}
					className={`${cell} ${page === 0 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"}`}
				>
					← Prev
				</button>
				{pageWindow(page, pageCount).map((p, i) =>
					p === "…" ? (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: static ellipsis position
							key={`ellipsis-${i}`}
							className="px-2 font-mono text-meta text-gray-400"
						>
							…
						</span>
					) : (
						<button
							key={p}
							type="button"
							aria-current={p === page ? "page" : undefined}
							onClick={() => onPage(p)}
							className={`${cell} ${
								p === page
									? "border-gray-900 bg-gray-900 text-white"
									: "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
							}`}
						>
							{p + 1}
						</button>
					),
				)}
				<button
					type="button"
					onClick={() => onPage(page + 1)}
					disabled={page >= pageCount - 1}
					className={`${cell} ${page >= pageCount - 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"}`}
				>
					Next →
				</button>
			</div>
			<p className="font-mono text-label text-gray-500">
				{from.toLocaleString()}–{to.toLocaleString()} of{" "}
				{total.toLocaleString()}
			</p>
		</nav>
	);
}

/** Seed a single facet selection from an autocomplete pick (`?facet=type:value`).
 *  Flat facets map straight across; place/material are tiered, so we locate the
 *  tier the value sits at by scanning the docs. Returns a partial selection. */
function seedSelectionFromFacet(
	docs: CollectionDocument[],
	facetType: string,
	value: string,
): Partial<GridFacetSelections> | null {
	switch (facetType) {
		case "primary_artist":
		case "artist":
			return { artist: value };
		case "culture":
			return { culture: value };
		case "classification":
			return { classification: value };
		case "department":
			return { department: value };
		// `1959` pins a single year; `1959:1962` (from a ranged display date) pins
		// both ends. Negative years are BCE, so only split on an inner colon.
		case "date": {
			const parts = value.split(":");
			const min = Number(parts[0]);
			const max = parts.length > 1 ? Number(parts[1]) : min;
			if (!(Number.isFinite(min) && Number.isFinite(max))) return null;
			return { date: { min: Math.min(min, max), max: Math.max(min, max) } };
		}
		case "place": {
			for (const d of docs) {
				for (const p of d.facet_place ?? []) {
					for (const level of PLACE_LEVELS) {
						if (p[level] === value) return { place: { level, value } };
					}
				}
			}
			return null;
		}
		case "medium": {
			for (const d of docs) {
				for (const m of d.facet_medium ?? []) {
					for (const level of MEDIUM_LEVELS) {
						if (m[level] === value) return { medium: { level, value } };
					}
				}
			}
			return null;
		}
		default:
			return null;
	}
}

export function GridFacetsView({
	docs,
	getHref,
	query = "",
	seedFacet = "",
	geoScope = false,
	forceZero = false,
	zeroSlot,
}: {
	docs: CollectionDocument[];
	getHref: (id: number) => string;
	/** Free-text omnibox query (from ?q=); filters docs alongside the facets. */
	query?: string;
	/** Autocomplete facet pick (raw `?facet=type:value`); seeds a selection. */
	seedFacet?: string;
	/** Show the "Geography source" dropdown above the Place tree: scopes a
	 *  Place pick to one object- or artist-side place field (default view). */
	geoScope?: boolean;
	/** Force the empty state regardless of how many docs match (zero-results
	 *  variation), so the recovery UI is reviewable with the same facet column. */
	forceZero?: boolean;
	/** Replaces the built-in one-line empty state (used to show the full
	 *  did-you-mean / tips / popular-searches recovery panel). */
	zeroSlot?: React.ReactNode;
}) {
	const [sel, setSel] = useState<GridFacetSelections>(EMPTY_GRID_SELECTIONS);
	// Which accordion panels are open. Artist/maker leads open (Searchkit-style:
	// the first facet shows its options without a click); the rest start closed.
	const [openPanels, setOpenPanels] = useState<Set<string>>(
		() => new Set(["artist"]),
	);
	const togglePanel = (id: string) => {
		setOpenPanels((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	// Mobile keeps the facet column behind a collapsed <details>; from lg up it is
	// always expanded. `open` cannot be driven by CSS, so track the breakpoint.
	const [isDesktop, setIsDesktop] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const sync = () => setIsDesktop(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, []);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [sort, setSort] = useState<SortKey>("relevance");
	const [page, setPage] = useState(0);
	const [placeExpanded, setPlaceExpanded] = useState<Set<string>>(new Set());
	const [placeSearch, setPlaceSearch] = useState("");
	const [mediumExpanded, setMediumExpanded] = useState<Set<string>>(new Set());
	const [mediumSearch, setMediumSearch] = useState("");

	// Seed a selection from an autocomplete facet pick (?facet=type:value).
	// Runs when the seed string changes (a new pick), not on every render.
	// biome-ignore lint/correctness/useExhaustiveDependencies: seed only on ?facet= change
	useEffect(() => {
		if (!seedFacet) return;
		const idx = seedFacet.indexOf(":");
		if (idx < 0) return;
		const facetType = seedFacet.slice(0, idx);
		const value = seedFacet.slice(idx + 1);
		if (!facetType || !value) return;
		const seed = seedSelectionFromFacet(docs, facetType, value);
		if (seed) setSel((prev) => ({ ...prev, ...seed }));
	}, [seedFacet]);

	// The flat facets all toggle a single string key: picking the active value
	// again clears it.
	const setFlat =
		(
			key:
				| "artist"
				| "culture"
				| "classification"
				| "department"
				| "collection",
		) =>
		(value: string | null) => {
			setSel((prev) => ({
				...prev,
				[key]: prev[key] === value ? null : value,
			}));
		};
	const setArtist = setFlat("artist");
	const setCulture = setFlat("culture");
	const setClassification = setFlat("classification");
	const setDepartment = setFlat("department");
	const setCollection = setFlat("collection");
	const setDate = (range: YearRange | null) => {
		setSel((prev) => ({ ...prev, date: range }));
	};
	const setGeoScope = (value: GeoScopeId) => {
		setSel((prev) => ({ ...prev, geoScope: value }));
	};
	const toggleFlag = (key: "hasImage" | "openAccess") => {
		setSel((prev) => ({ ...prev, [key]: !prev[key] }));
	};
	const setOnView = (on: boolean, building: "de Young" | "Legion" | null) => {
		setSel((prev) => ({
			...prev,
			onView: on,
			onViewBuilding: on ? building : null,
		}));
	};
	const setOnViewBuilding = (building: "de Young" | "Legion") => {
		setSel((prev) => ({
			...prev,
			onView: true,
			// Toggle the museum off (back to "either") if it's already selected.
			onViewBuilding:
				prev.onView && prev.onViewBuilding === building ? null : building,
		}));
	};
	const selectPlace = (next: TierSelection) => {
		setSel((prev) => {
			const same =
				prev.place?.level === next.level && prev.place.value === next.value;
			return { ...prev, place: same ? null : (next as PlaceSelection) };
		});
	};
	const selectMedium = (next: TierSelection) => {
		setSel((prev) => {
			const same =
				prev.medium?.level === next.level && prev.medium.value === next.value;
			return { ...prev, medium: same ? null : (next as MediumSelection) };
		});
	};
	const makeToggle =
		(setExpanded: typeof setPlaceExpanded) => (key: string) => {
			setExpanded((prev) => {
				const next = new Set(prev);
				if (next.has(key)) next.delete(key);
				else next.add(key);
				return next;
			});
		};
	const togglePlace = makeToggle(setPlaceExpanded);
	const toggleMedium = makeToggle(setMediumExpanded);

	const matches = useMemo(
		() => filterGridDocs(docs, sel, query),
		[docs, sel, query],
	);
	const sortedMatches = useMemo(
		() => sortGridDocs(matches, sort),
		[matches, sort],
	);
	// The zero-results variation forces the empty state, so the header count
	// follows it rather than reporting the docs that still match.
	const shownCount = forceZero ? 0 : matches.length;

	const pageCount = Math.max(1, Math.ceil(sortedMatches.length / PAGE_SIZE));
	// Reset to the first page whenever the result set or sort changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: page resets on result/sort change
	useEffect(() => {
		setPage(0);
	}, [sel, query, sort]);
	const safePage = Math.min(page, pageCount - 1);
	const pageItems = sortedMatches.slice(
		safePage * PAGE_SIZE,
		safePage * PAGE_SIZE + PAGE_SIZE,
	);

	// Both trees are the full served hierarchy with real full-collection counts,
	// baked from the pipeline rather than derived from the slice, so reviewers
	// see the final shape and scale. Display-only: selecting a node filters the
	// slice, which may hold no member for it.
	const placeTree = PLACE_TREE;
	const mediumTree = MEDIUM_TREE;
	// Flat facets list the full served value set, not the slice's subset.
	const artistOpts = FULL_FACET_OPTIONS.artist;
	// Docs per geography-source scope, ignoring the current scope pick so the
	// dropdown's own counts don't collapse to the scope already chosen.
	const geoScopeCounts = useMemo(() => {
		const base = filterGridDocs(docs, { ...sel, geoScope: "all" }, query);
		const out = {} as Record<GeoScopeId, number>;
		for (const { id } of GEO_SCOPES) {
			out[id] =
				id === "all"
					? base.length
					: base.filter((d) => geoScopeValues(d, id).length > 0).length;
		}
		return out;
	}, [docs, sel, query]);
	const cultureOpts = FULL_FACET_OPTIONS.culture;
	const classificationOpts = FULL_FACET_OPTIONS.classification;
	const departmentOpts = FULL_FACET_OPTIONS.department;
	// Static: the pipeline does not serve FAMSF Collection yet, so these are
	// real full-collection counts probed from TMS, not slice counts.
	const collectionOpts: FacetOption[] = useMemo(
		() =>
			famsfCollectionValues.values
				.map((v) => ({ value: v.term, count: v.count }))
				.sort((a, b) => byLabelAsc(a.value, b.value)),
		[],
	);
	const dateHistogram = useMemo(
		() =>
			buildYearHistogram(filterGridDocs(docs, { ...sel, date: null }, query)),
		[docs, sel, query],
	);
	// Options for each raw place-term facet, counted with that facet's own
	// selection cleared (so its list stays browsable) but the others applied.
	const placeChipLabel = sel.place
		? `${sel.place.level === "region" ? "Region" : sel.place.level === "country" ? "Country" : sel.place.level === "state" ? "State" : "Place"}: ${sel.place.value}`
		: null;
	const mediumChipLabel = sel.medium
		? `${sel.medium.level === "section" ? "Medium" : sel.medium.level === "subcategory" ? "Medium type" : "Medium detail"}: ${sel.medium.value}`
		: null;
	// One entry per active selection, in the order the chips read. Also answers
	// "is anything active?", so the two cannot drift apart.
	const activeChips: { key: string; label: string; clear: () => void }[] = [
		...(sel.artist
			? [
					{
						key: "artist",
						label: `Artist/maker: ${sel.artist}`,
						clear: () => setArtist(null),
					},
				]
			: []),
		...(sel.culture
			? [
					{
						key: "culture",
						label: `Culture group: ${sel.culture}`,
						clear: () => setCulture(null),
					},
				]
			: []),
		...(placeChipLabel
			? [
					{
						key: "place",
						label: placeChipLabel,
						clear: () => setSel((p) => ({ ...p, place: null })),
					},
				]
			: []),
		...(geoScope && sel.geoScope !== "all"
			? [
					{
						key: "geoScope",
						label: `Geography source: ${GEO_SCOPES.find((s) => s.id === sel.geoScope)?.label}`,
						clear: () => setGeoScope("all"),
					},
				]
			: []),
		...(mediumChipLabel
			? [
					{
						key: "medium",
						label: mediumChipLabel,
						clear: () => setSel((p) => ({ ...p, medium: null })),
					},
				]
			: []),
		...(sel.classification
			? [
					{
						key: "classification",
						label: `Object type: ${sel.classification}`,
						clear: () => setClassification(null),
					},
				]
			: []),
		...(sel.department
			? [
					{
						key: "department",
						label: `Department: ${sel.department}`,
						clear: () => setDepartment(null),
					},
				]
			: []),
		...(sel.collection
			? [
					{
						key: "collection",
						label: `Collection: ${sel.collection}`,
						clear: () => setCollection(null),
					},
				]
			: []),
		...(sel.date
			? [
					{
						key: "date",
						label: `Date: ${yearLabel(sel.date.min)}–${yearLabel(sel.date.max)}`,
						clear: () => setDate(null),
					},
				]
			: []),
		...(sel.onView
			? [
					{
						key: "onView",
						label: `On view${sel.onViewBuilding ? `: ${sel.onViewBuilding}` : ""}`,
						clear: () => setOnView(false, null),
					},
				]
			: []),
		...(sel.hasImage
			? [
					{
						key: "hasImage",
						label: "Has image",
						clear: () => toggleFlag("hasImage"),
					},
				]
			: []),
		...(sel.openAccess
			? [
					{
						key: "openAccess",
						label: "Open access",
						clear: () => toggleFlag("openAccess"),
					},
				]
			: []),
	];
	const anyActive = activeChips.length > 0;

	// One descriptor per facet: its control, and how many selections are active
	// (shown beside the label on the accordion header).
	const panelsByDef = [
		{
			id: "collection",
			label: "Collection",
			activeCount: sel.collection ? 1 : 0,
			control: (
				<FacetBlock
					label="Collection"
					options={collectionOpts}
					selected={sel.collection}
					onSelect={setCollection}
					heading={false}
					topN={null}
				/>
			),
		},
		{
			id: "artist",
			label: "Artist/maker",
			activeCount: sel.artist ? 1 : 0,
			control: (
				<FacetBlock
					label="Artist/maker"
					options={artistOpts}
					selected={sel.artist}
					onSelect={setArtist}
					heading={false}
				/>
			),
		},
		{
			id: "onview",
			label: "On view",
			activeCount: sel.onView ? 1 : 0,
			control: (
				<div>
					<ul className="flex flex-col">
						{(
							[
								// "Either museum" leads as the parent option; the two
								// museums below it read alphabetically, like every other facet.
								["On view (either museum)", null, facetCounts.toggles.onView],
								...(
									[
										["de Young", "de Young", facetCounts.toggles.onViewDeYoung],
										[
											"Legion of Honor",
											"Legion",
											facetCounts.toggles.onViewLegion,
										],
									] as const
								)
									.slice()
									.sort((a, b) => byLabelAsc(a[0], b[0])),
							] as const
						).map(([label, building, count]) => {
							const on = sel.onView && sel.onViewBuilding === building;
							return (
								<li key={label}>
									<button
										type="button"
										aria-pressed={on}
										onClick={() =>
											building === null
												? setOnView(true, null)
												: setOnViewBuilding(building)
										}
										className={`flex w-full items-center gap-2 py-1 text-left font-mono text-meta ${
											on
												? "text-gray-950"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
										}`}
									>
										<span
											aria-hidden
											className={`h-4 w-4 shrink-0 border ${
												on
													? "border-gray-900 bg-gray-900"
													: "border-gray-500 bg-white"
											}`}
										/>
										<span className="min-w-0 flex-1 break-words">{label}</span>
										<span className="shrink-0 text-label text-gray-400">
											{count.toLocaleString()}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
					{sel.onView && (
						<button
							type="button"
							onClick={() => setOnView(false, null)}
							className="mt-2 font-mono text-label text-gray-500 underline hover:text-gray-700"
						>
							Clear
						</button>
					)}
				</div>
			),
		},
		{
			id: "culture",
			label: "Culture group",
			activeCount: sel.culture ? 1 : 0,
			control: (
				<FacetBlock
					label="Culture group"
					options={cultureOpts}
					selected={sel.culture}
					onSelect={setCulture}
					heading={false}
				/>
			),
		},
		{
			id: "place",
			label: "Place",
			activeCount:
				(sel.place ? 1 : 0) + (geoScope && sel.geoScope !== "all" ? 1 : 0),
			control: (
				<div>
					{/* Geography-source scope sits above the tree: pick the field, then
					    the place value. */}
					{geoScope && (
						<GeoScopeSelect
							value={sel.geoScope}
							counts={geoScopeCounts}
							onChange={setGeoScope}
						/>
					)}
					<TreeFacet
						label="Place"
						tree={placeTree}
						levelByDepth={PLACE_LEVEL_BY_DEPTH}
						selected={sel.place}
						onSelect={selectPlace}
						expanded={placeExpanded}
						onToggle={togglePlace}
						search={placeSearch}
						onSearch={setPlaceSearch}
						heading={false}
					/>
				</div>
			),
		},
		{
			id: "medium",
			label: "Medium",
			activeCount: sel.medium ? 1 : 0,
			control: (
				<TreeFacet
					label="Medium"
					tree={mediumTree}
					levelByDepth={MEDIUM_LEVEL_BY_DEPTH}
					selected={sel.medium}
					onSelect={selectMedium}
					expanded={mediumExpanded}
					onToggle={toggleMedium}
					search={mediumSearch}
					onSearch={setMediumSearch}
					topN={null}
					heading={false}
				/>
			),
		},
		{
			id: "classification",
			label: "Object type",
			activeCount: sel.classification ? 1 : 0,
			control: (
				<FacetBlock
					label="Object type"
					options={classificationOpts}
					selected={sel.classification}
					onSelect={setClassification}
					heading={false}
					topN={null}
				/>
			),
		},
		{
			id: "department",
			label: "Department",
			activeCount: sel.department ? 1 : 0,
			control: (
				<FacetBlock
					label="Department"
					options={departmentOpts}
					selected={sel.department}
					onSelect={setDepartment}
					heading={false}
				/>
			),
		},
		{
			id: "date",
			label: "Date",
			activeCount: sel.date ? 1 : 0,
			control: (
				<div className="border-b border-gray-200 pb-3">
					<p className="mb-1.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
						Date
					</p>
					<DateHistogram
						histogram={dateHistogram}
						value={sel.date}
						onChange={setDate}
					/>
				</div>
			),
		},
	];
	// Display order (researcher-led): artist + date lead, then geography +
	// culture, then material / type, then refinements. Collection placeholder
	// last (non-functional until the FAMSF Collecting Area TMS field exists).
	const PANEL_ORDER = [
		"artist",
		"onview",
		"date",
		"place",
		"culture",
		"medium",
		"classification",
		"department",
		"collection",
	];
	const panels = PANEL_ORDER.map((id) =>
		panelsByDef.find((p) => p.id === id),
	).filter((p): p is (typeof panelsByDef)[number] => p != null);

	// Has image / Open access filters. Plain checkboxes, matching the facet
	// option rows rather than reading as actions. On view is a facet panel
	// (below Artist/maker) so it can carry the de Young / Legion museum
	// narrowing.
	const TOGGLES = [
		["hasImage", "Has image", sel.hasImage],
		["openAccess", "Open access", sel.openAccess],
	] as const;
	const toggleButtons = (
		<fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 p-0">
			<legend className="sr-only">Quick filters</legend>
			{TOGGLES.map(([key, label, on]) => (
				<label
					key={key}
					className="flex cursor-pointer items-center gap-2 font-mono text-meta text-gray-700 hover:text-gray-950"
				>
					<input
						type="checkbox"
						checked={on}
						onChange={() => toggleFlag(key)}
						className="h-4 w-4 shrink-0 accent-gray-900"
					/>
					{label}
				</label>
			))}
		</fieldset>
	);

	return (
		<div className="flex flex-col gap-6 lg:flex-row">
			{/* Left facet column. On mobile it is a <details> closed by default, so
			    the filters sit behind one "Filters" summary above the results
			    instead of pushing them down the page; from lg up the panels show
			    inline and the summary is hidden. */}
			<ScopeMark label="Facets" className="shrink-0 lg:w-80">
				<details
					className="group border-b border-gray-300 lg:border-b-0"
					open={isDesktop || filtersOpen}
					onToggle={(e) => setFiltersOpen(e.currentTarget.open)}
				>
					{/* Label states the action, as on comparable collection sites
					    (Hammer's "Hide filter options"), so it reads as a control
					    rather than a heading. */}
					<summary className="flex cursor-pointer list-none items-center gap-2 border border-gray-300 px-3 py-2 font-mono text-meta text-gray-700 hover:border-gray-500 hover:bg-gray-50 lg:hidden">
						<span
							aria-hidden
							className="transition-transform group-open:rotate-90"
						>
							▸
						</span>
						{filtersOpen ? "Hide filters" : "Show filters"}
						{activeChips.length > 0 ? ` (${activeChips.length})` : ""}
					</summary>
					<aside className="pb-3 lg:pb-0">
						<div className="flex items-baseline justify-between border-b border-gray-300 pb-2">
							<SectionLabelInline>Refine</SectionLabelInline>
							{/* Always rendered so the header doesn't reflow when filters
						    become active; just hidden + inert when there's nothing
						    to clear. */}
							<button
								type="button"
								onClick={() => setSel(EMPTY_GRID_SELECTIONS)}
								aria-hidden={!anyActive}
								tabIndex={anyActive ? 0 : -1}
								className={`font-mono text-meta text-gray-500 underline hover:text-gray-700 ${
									anyActive ? "" : "invisible"
								}`}
							>
								Clear all
							</button>
						</div>

						{/* Toggles at the top of the left column, stacked so they fit
						    the narrow column. */}
						<div className="mt-3 flex flex-col gap-2 border-b border-gray-200 pb-3 [&_fieldset]:flex-col [&_fieldset]:items-start">
							{toggleButtons}
						</div>

						<div className="mt-1 flex flex-col">
							{panels.map((p) => (
								<FacetAccordion
									key={p.id}
									label={p.label}
									activeCount={p.activeCount}
									open={openPanels.has(p.id)}
									onToggle={() => togglePanel(p.id)}
								>
									{p.control}
								</FacetAccordion>
							))}
						</div>
					</aside>
				</details>
			</ScopeMark>

			{/* Results */}
			<div className="min-w-0 flex-1">
				{/* Count + sort row. min-height reserved so the grid doesn't
					    shift when the count text changes width. */}
				<ScopeMark label="Count + sort">
					<div className="mb-4 flex min-h-9 flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
						<span className="font-mono text-body font-medium">
							{shownCount.toLocaleString()} result
							{shownCount === 1 ? "" : "s"}
							{query ? ` for “${query}”` : ""}
						</span>
						{/* Nothing to sort on the empty state. */}
						{shownCount > 0 && (
							<label className="flex items-center gap-2 font-mono text-label text-gray-500">
								Sort
								<select
									value={sort}
									onChange={(e) => setSort(e.target.value as SortKey)}
									className="border border-gray-300 bg-white px-2 py-1 font-mono text-meta text-gray-900 focus:border-gray-500 focus:outline-none"
								>
									{SORT_OPTIONS.map((o) => (
										<option key={o.key} value={o.key}>
											{o.label}
										</option>
									))}
								</select>
							</label>
						)}
					</div>
				</ScopeMark>

				{/* Active-filter chips */}
				<ScopeMark label="Active filter chips">
					<div className="mb-4 flex min-h-9 flex-wrap items-center gap-2">
						<span className="font-mono text-label text-gray-500">
							{anyActive ? "Active filters:" : " "}
						</span>
						{activeChips.map((chip) => (
							<button
								key={chip.key}
								type="button"
								onClick={chip.clear}
								className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
							>
								<span>{chip.label}</span>
								<span>×</span>
							</button>
						))}
					</div>
				</ScopeMark>

				{matches.length > 0 && !forceZero ? (
					<>
						<ScopeMark label="Results grid">
							<ResultsGrid items={pageItems} getHref={getHref} columns={3} />
						</ScopeMark>
						<ScopeMark label="Pagination">
							<Pager
								page={safePage}
								pageCount={pageCount}
								onPage={setPage}
								total={sortedMatches.length}
								pageSize={PAGE_SIZE}
							/>
						</ScopeMark>
					</>
				) : (
					<ScopeMark label="Zero results">
						{zeroSlot ?? (
							<div className="border border-dashed border-gray-300 px-4 py-10 text-center font-mono text-meta text-gray-500">
								{query
									? `No objects match “${query}” with these filters. Clear a filter or the search to broaden.`
									: "No objects match these filters. Clear one to broaden."}
							</div>
						)}
					</ScopeMark>
				)}
			</div>
		</div>
	);
}
