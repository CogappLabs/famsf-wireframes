"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ScopeMark, SectionLabelInline } from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { type FacetOption, objectYear } from "./facets";
import { isPublicDomain, ResultsGrid } from "./results";

// ── Grid + left-column facets variation ─────────────────────────────
//
// Real-data variation backed by src/data/grid-facets-docs/ (~600 docs with
// curator-taxonomy facets baked on by scripts/export_grid_facets_docs.py).
// Left column has two expandable hierarchies + one flat facet:
//   • Place    — region → country → [US state] → notable place (REGION_REMAP
//                workbook). The state tier is US-only; non-US places are 3-tier.
//   • Material — parent → specific (FACET_DESIGN_v2 workbook)
//   • Technique — flat (FacetBlock)
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

// Material is a 2-tier facet (parent → specific), same as place. A
// selection records the tier so a parent and a specific never collide.
const MATERIAL_LEVELS = ["parent", "specific"] as const;
type MaterialLevel = (typeof MATERIAL_LEVELS)[number];

interface MaterialSelection {
	level: MaterialLevel;
	value: string;
}

/** Inclusive year range for the date histogram filter. */
interface YearRange {
	min: number;
	max: number;
}

interface GridFacetSelections {
	artist: string | null;
	place: PlaceSelection | null;
	material: MaterialSelection | null;
	technique: string | null;
	classification: string | null;
	department: string | null;
	gallery: string | null;
	date: YearRange | null;
	onView: boolean;
	hasImage: boolean;
	openAccess: boolean;
}

const EMPTY_GRID_SELECTIONS: GridFacetSelections = {
	artist: null,
	place: null,
	material: null,
	technique: null,
	classification: null,
	department: null,
	gallery: null,
	date: null,
	onView: false,
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

function docMatchesMaterial(
	doc: CollectionDocument,
	material: MaterialSelection | null,
): boolean {
	if (!material) return true;
	return (doc.facet_material ?? []).some(
		(m) => m[material.level] === material.value,
	);
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
		if (!docMatchesPlace(d, sel.place)) return false;
		if (!docMatchesMaterial(d, sel.material)) return false;
		if (sel.technique && !(d.facet_technique ?? []).includes(sel.technique))
			return false;
		if (sel.classification && d.classification !== sel.classification)
			return false;
		if (sel.department && d.department !== sel.department) return false;
		if (sel.gallery && d.location_building !== sel.gallery) return false;
		if (sel.date) {
			const y = objectYear(d);
			if (y == null || y < sel.date.min || y > sel.date.max) return false;
		}
		if (sel.onView && !d.on_view) return false;
		if (sel.hasImage && !d.has_image) return false;
		if (sel.openAccess && !isPublicDomain(d)) return false;
		return true;
	});
}

/** Count a flat string-array facet over docs, descending by count. */
function countFlat(
	docs: CollectionDocument[],
	get: (d: CollectionDocument) => string[] | undefined,
): FacetOption[] {
	const counts = new Map<string, number>();
	for (const d of docs) {
		for (const v of new Set(get(d) ?? [])) {
			counts.set(v, (counts.get(v) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
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

const byCountDesc = (a: FacetTreeNode, b: FacetTreeNode) =>
	b.count - a.count || a.value.localeCompare(b.value);

/**
 * Generic 2- or 3-tier tree builder. `tiers` maps each doc to a list of
 * tuples giving the value at each tier for one path through the doc's
 * facet (e.g. [region, country, notable] for place, [parent, specific]
 * for material). Empty tier values truncate that path (so a region with
 * no country simply has no children). Counts are distinct docs per node.
 */
function buildFacetTree(
	docs: CollectionDocument[],
	paths: (d: CollectionDocument) => string[][],
): FacetTreeNode[] {
	interface Acc {
		docs: Set<number>;
		children: Map<string, Acc>;
	}
	const root: Map<string, Acc> = new Map();

	for (const d of docs) {
		for (const path of paths(d)) {
			let level = root;
			for (const value of path) {
				if (!value) break;
				let node = level.get(value);
				if (!node) {
					node = { docs: new Set(), children: new Map() };
					level.set(value, node);
				}
				node.docs.add(d.id);
				level = node.children;
			}
		}
	}

	const toNodes = (level: Map<string, Acc>): FacetTreeNode[] =>
		Array.from(level.entries())
			.map(([value, acc]) => ({
				value,
				count: acc.docs.size,
				children: toNodes(acc.children),
			}))
			.sort(byCountDesc);

	return toNodes(root);
}

const buildPlaceTree = (docs: CollectionDocument[]): FacetTreeNode[] =>
	buildFacetTree(docs, (d) =>
		(d.facet_place ?? []).map((p) => [p.region, p.country, p.state, p.notable]),
	);

const buildMaterialTree = (docs: CollectionDocument[]): FacetTreeNode[] =>
	buildFacetTree(docs, (d) =>
		(d.facet_material ?? []).map((m) => [m.parent, m.specific]),
	);

const FACET_TOP_N = 8;

/** A single expandable facet block in the left column. */
function FacetBlock({
	label,
	options,
	selected,
	onSelect,
}: {
	label: string;
	options: FacetOption[];
	selected: string | null;
	onSelect: (value: string | null) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [search, setSearch] = useState("");
	if (options.length === 0 && !selected) return null;

	const filtered = search
		? options.filter((o) =>
				o.value.toLowerCase().includes(search.toLowerCase()),
			)
		: options;
	const shown = expanded || search ? filtered : filtered.slice(0, FACET_TOP_N);
	const hiddenCount = filtered.length - shown.length;

	return (
		<div className="border-b border-gray-200 pb-3">
			<p className="mb-1.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
				{label}
			</p>
			{selected && (
				<button
					type="button"
					aria-pressed
					onClick={() => onSelect(null)}
					className="mb-1 flex w-full items-center gap-2 border border-gray-900 bg-gray-900 px-2 py-1 font-mono text-meta text-white hover:bg-gray-700"
				>
					<span
						aria-hidden
						className="flex h-4 w-4 shrink-0 items-center justify-center border border-white text-label leading-none"
					>
						✓
					</span>
					<span className="min-w-0 flex-1 truncate text-left">{selected}</span>
					<span>×</span>
				</button>
			)}
			{options.length > FACET_TOP_N && (
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={`Filter ${label.toLowerCase()}…`}
					className="mb-1.5 w-full border border-gray-200 bg-white px-2 py-1.5 font-mono text-meta text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
				/>
			)}
			<ul className="flex flex-col">
				{shown
					.filter((o) => o.value !== selected)
					.map((o) => (
						<li key={o.value}>
							<button
								type="button"
								aria-pressed={false}
								onClick={() => onSelect(o.value)}
								className="flex w-full items-center gap-2 py-1 text-left font-mono text-meta text-gray-700 hover:bg-gray-50 hover:text-gray-950"
							>
								<span
									aria-hidden
									className="h-4 w-4 shrink-0 border border-gray-500 bg-white"
								/>
								<span className="min-w-0 flex-1 truncate">{o.value}</span>
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
			{expanded && !search && filtered.length > FACET_TOP_N && (
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

/** Date facet as a horizontal year histogram with drag-select (modal
 *  layout). Empty decades are dropped (see buildYearHistogram) so equal-width
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
const MATERIAL_LEVEL_BY_DEPTH: MaterialLevel[] = ["parent", "specific"];

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
						className={`min-w-0 flex-1 truncate ${isSelected ? "font-medium" : ""}`}
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
		<div className="border-b border-gray-200 pb-3">
			<p className="mb-1.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
				{label}
			</p>
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
						className={`flex flex-col ${topN == null ? "max-h-96 overflow-y-auto" : ""}`}
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

/** Lightweight modal wrapper for the facet dialogs (modal layout). */
function FacetModal({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const dialog = ref.current;
		if (dialog && !dialog.open) dialog.showModal();
	}, []);
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: dialog backdrop dismiss
		<dialog
			ref={ref}
			onClose={onClose}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			className="m-auto w-full max-w-md border border-gray-300 bg-white p-0 backdrop:bg-black/30"
		>
			<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
				<h3 className="font-mono text-meta font-medium">{title}</h3>
				<button
					type="button"
					onClick={onClose}
					className="font-mono text-meta text-gray-500 hover:text-gray-700"
				>
					Close
				</button>
			</div>
			<div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
		</dialog>
	);
}

/** Left-column button that opens a facet modal (modal layout). Shows the
 *  facet name + active-selection count. */
function FacetButton({
	label,
	activeCount,
	onClick,
}: {
	label: string;
	activeCount: number;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex w-full items-center justify-between gap-2 border px-3 py-2 text-left font-mono text-meta transition-colors ${
				activeCount > 0
					? "border-gray-900 bg-gray-900 text-white hover:bg-gray-700"
					: "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
			}`}
		>
			<span>
				{label}
				{activeCount > 0 ? ` (${activeCount})` : ""}
			</span>
			<span aria-hidden>▸</span>
		</button>
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
		case "technique":
			return { technique: value };
		case "classification":
			return { classification: value };
		case "department":
			return { department: value };
		case "gallery":
			return { gallery: value };
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
		case "material": {
			for (const d of docs) {
				for (const m of d.facet_material ?? []) {
					for (const level of MATERIAL_LEVELS) {
						if (m[level] === value) return { material: { level, value } };
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
	layout = "inline",
	query = "",
	seedFacet = "",
}: {
	docs: CollectionDocument[];
	getHref: (id: number) => string;
	/** "inline" renders each facet expanded in the left column; "modal"
	 *  renders a button per facet that opens the same control in a dialog. */
	layout?: "inline" | "modal";
	/** Free-text omnibox query (from ?q=); filters docs alongside the facets. */
	query?: string;
	/** Autocomplete facet pick (raw `?facet=type:value`); seeds a selection. */
	seedFacet?: string;
}) {
	const [sel, setSel] = useState<GridFacetSelections>(EMPTY_GRID_SELECTIONS);
	const [openFacet, setOpenFacet] = useState<string | null>(null);
	const [sort, setSort] = useState<SortKey>("relevance");
	const [page, setPage] = useState(0);
	const [placeExpanded, setPlaceExpanded] = useState<Set<string>>(new Set());
	const [placeSearch, setPlaceSearch] = useState("");
	const [materialExpanded, setMaterialExpanded] = useState<Set<string>>(
		new Set(),
	);
	const [materialSearch, setMaterialSearch] = useState("");

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

	const setArtist = (value: string | null) => {
		setSel((prev) => ({
			...prev,
			artist: prev.artist === value ? null : value,
		}));
	};
	const setTechnique = (value: string | null) => {
		setSel((prev) => ({
			...prev,
			technique: prev.technique === value ? null : value,
		}));
	};
	const setClassification = (value: string | null) => {
		setSel((prev) => ({
			...prev,
			classification: prev.classification === value ? null : value,
		}));
	};
	const setDepartment = (value: string | null) => {
		setSel((prev) => ({
			...prev,
			department: prev.department === value ? null : value,
		}));
	};
	const setGallery = (value: string | null) => {
		setSel((prev) => ({
			...prev,
			gallery: prev.gallery === value ? null : value,
		}));
	};
	const setDate = (range: YearRange | null) => {
		setSel((prev) => ({ ...prev, date: range }));
	};
	const toggleFlag = (key: "onView" | "hasImage" | "openAccess") => {
		setSel((prev) => ({ ...prev, [key]: !prev[key] }));
	};
	const selectPlace = (next: TierSelection) => {
		setSel((prev) => {
			const same =
				prev.place?.level === next.level && prev.place.value === next.value;
			return { ...prev, place: same ? null : (next as PlaceSelection) };
		});
	};
	const selectMaterial = (next: TierSelection) => {
		setSel((prev) => {
			const same =
				prev.material?.level === next.level &&
				prev.material.value === next.value;
			return { ...prev, material: same ? null : (next as MaterialSelection) };
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
	const toggleMaterial = makeToggle(setMaterialExpanded);

	const matches = useMemo(
		() => filterGridDocs(docs, sel, query),
		[docs, sel, query],
	);
	const sortedMatches = useMemo(
		() => sortGridDocs(matches, sort),
		[matches, sort],
	);

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

	// Each tree reflects every value consistent with the OTHER facets'
	// selections (and the active query), so the hierarchy stays browsable
	// while one is selected.
	const placeTree = useMemo(
		() => buildPlaceTree(filterGridDocs(docs, { ...sel, place: null }, query)),
		[docs, sel, query],
	);
	const materialTree = useMemo(
		() =>
			buildMaterialTree(
				filterGridDocs(docs, { ...sel, material: null }, query),
			),
		[docs, sel, query],
	);
	const artistOpts = useMemo(
		() =>
			countFlat(filterGridDocs(docs, { ...sel, artist: null }, query), (d) =>
				d.primary_artist ? [d.primary_artist] : [],
			),
		[docs, sel, query],
	);
	const techniqueOpts = useMemo(
		() =>
			countFlat(
				filterGridDocs(docs, { ...sel, technique: null }, query),
				(d) => d.facet_technique,
			),
		[docs, sel, query],
	);
	const classificationOpts = useMemo(
		() =>
			countFlat(
				filterGridDocs(docs, { ...sel, classification: null }, query),
				(d) => (d.classification ? [d.classification] : []),
			),
		[docs, sel, query],
	);
	const departmentOpts = useMemo(
		() =>
			countFlat(
				filterGridDocs(docs, { ...sel, department: null }, query),
				(d) => (d.department ? [d.department] : []),
			),
		[docs, sel, query],
	);
	const galleryOpts = useMemo(
		() =>
			countFlat(filterGridDocs(docs, { ...sel, gallery: null }, query), (d) =>
				d.location_building ? [d.location_building] : [],
			),
		[docs, sel, query],
	);
	const dateHistogram = useMemo(
		() =>
			buildYearHistogram(filterGridDocs(docs, { ...sel, date: null }, query)),
		[docs, sel, query],
	);

	const placeChipLabel = sel.place
		? `${sel.place.level === "region" ? "Region" : sel.place.level === "country" ? "Country" : sel.place.level === "state" ? "State" : "Place"}: ${sel.place.value}`
		: null;
	const materialChipLabel = sel.material
		? `${sel.material.level === "parent" ? "Material" : "Material detail"}: ${sel.material.value}`
		: null;
	const anyActive =
		Boolean(sel.artist) ||
		Boolean(sel.place) ||
		Boolean(sel.material) ||
		Boolean(sel.technique) ||
		Boolean(sel.classification) ||
		Boolean(sel.department) ||
		Boolean(sel.gallery) ||
		Boolean(sel.date) ||
		sel.onView ||
		sel.hasImage ||
		sel.openAccess;

	// One descriptor per facet: its control (shared by both layouts) and how
	// many selections are active (for the modal-layout button badge).
	const panels = [
		{
			id: "artist",
			label: "Artist",
			activeCount: sel.artist ? 1 : 0,
			control: (
				<FacetBlock
					label="Artist"
					options={artistOpts}
					selected={sel.artist}
					onSelect={setArtist}
				/>
			),
		},
		{
			id: "place",
			label: "Place",
			activeCount: sel.place ? 1 : 0,
			control: (
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
				/>
			),
		},
		{
			id: "material",
			label: "Material",
			activeCount: sel.material ? 1 : 0,
			control: (
				<TreeFacet
					label="Material"
					tree={materialTree}
					levelByDepth={MATERIAL_LEVEL_BY_DEPTH}
					selected={sel.material}
					onSelect={selectMaterial}
					expanded={materialExpanded}
					onToggle={toggleMaterial}
					search={materialSearch}
					onSearch={setMaterialSearch}
					topN={8}
				/>
			),
		},
		{
			id: "technique",
			label: "Technique",
			activeCount: sel.technique ? 1 : 0,
			control: (
				<FacetBlock
					label="Technique"
					options={techniqueOpts}
					selected={sel.technique}
					onSelect={setTechnique}
				/>
			),
		},
		{
			id: "classification",
			label: "Classification",
			activeCount: sel.classification ? 1 : 0,
			control: (
				<FacetBlock
					label="Classification"
					options={classificationOpts}
					selected={sel.classification}
					onSelect={setClassification}
				/>
			),
		},
		{
			id: "department",
			label: "Collection area",
			activeCount: sel.department ? 1 : 0,
			control: (
				<FacetBlock
					label="Collection area"
					options={departmentOpts}
					selected={sel.department}
					onSelect={setDepartment}
				/>
			),
		},
		{
			id: "gallery",
			label: "Gallery",
			activeCount: sel.gallery ? 1 : 0,
			control: (
				<FacetBlock
					label="Gallery"
					options={galleryOpts}
					selected={sel.gallery}
					onSelect={setGallery}
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
	const activePanel = panels.find((p) => p.id === openFacet);

	// On view / Has image / Open access toggles. Rendered as one segmented
	// pill group (shared border, no gaps) so the three read as a single
	// "quick filters" control rather than three loose buttons.
	const TOGGLES = [
		["onView", "On view", sel.onView],
		["hasImage", "Has image", sel.hasImage],
		["openAccess", "Open access", sel.openAccess],
	] as const;
	const toggleButtons = (
		<fieldset className="inline-flex divide-x divide-gray-300 overflow-hidden border border-gray-300 p-0">
			<legend className="sr-only">Quick filters</legend>
			{TOGGLES.map(([key, label, on]) => (
				<button
					key={key}
					type="button"
					aria-pressed={on}
					onClick={() => toggleFlag(key)}
					className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-meta transition-colors ${
						on
							? "bg-gray-900 text-white"
							: "bg-white text-gray-700 hover:bg-gray-50"
					}`}
				>
					<span aria-hidden>{on ? "✓" : "+"}</span>
					{label}
				</button>
			))}
		</fieldset>
	);

	return (
		<>
			{/* Inline layout: toggles in a full-width row under the search. */}
			{layout === "inline" && (
				<div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
					<span className="font-mono text-meta text-gray-500">Refine by:</span>
					{toggleButtons}
				</div>
			)}
			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Left facet column */}
				<ScopeMark label="Facets" className="shrink-0 lg:w-64">
					<aside>
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

						{/* Modal layout: toggles at the top of the left column. */}
						{layout === "modal" && (
							<div className="mt-3 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
								{toggleButtons}
							</div>
						)}

						{layout === "modal" ? (
							<div className="mt-3 flex flex-col gap-2">
								{panels.map((p) => (
									<FacetButton
										key={p.id}
										label={p.label}
										activeCount={p.activeCount}
										onClick={() => setOpenFacet(p.id)}
									/>
								))}
							</div>
						) : (
							<div className="mt-3 flex flex-col gap-3">
								<p className="font-mono text-meta text-gray-500">
									Tip: ▸ expands a branch · checkbox filters by it.
								</p>
								{panels.map((p) => (
									<div key={p.id}>{p.control}</div>
								))}
							</div>
						)}
					</aside>
				</ScopeMark>

				{/* Modal layout: one dialog for the open facet */}
				{layout === "modal" && activePanel && (
					<FacetModal
						title={activePanel.label}
						onClose={() => setOpenFacet(null)}
					>
						{activePanel.control}
					</FacetModal>
				)}

				{/* Results */}
				<div className="min-w-0 flex-1">
					{/* Count + sort row. min-height reserved so the grid doesn't
					    shift when the count text changes width. */}
					<ScopeMark label="Count + sort">
						<div className="mb-4 flex min-h-9 flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
							<span className="font-mono text-body font-medium">
								{matches.length.toLocaleString()} result
								{matches.length === 1 ? "" : "s"}
								{query ? ` for “${query}”` : ""}
							</span>
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
						</div>
					</ScopeMark>

					{/* Active-filter chips */}
					<ScopeMark label="Active filter chips">
						<div className="mb-4 flex min-h-9 flex-wrap items-center gap-2">
							<span className="font-mono text-label text-gray-500">
								{anyActive ? "Active filters:" : " "}
							</span>
							{sel.artist && (
								<button
									type="button"
									onClick={() => setArtist(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Artist: {sel.artist}</span>
									<span>×</span>
								</button>
							)}
							{placeChipLabel && (
								<button
									type="button"
									onClick={() => setSel((p) => ({ ...p, place: null }))}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>{placeChipLabel}</span>
									<span>×</span>
								</button>
							)}
							{materialChipLabel && (
								<button
									type="button"
									onClick={() => setSel((p) => ({ ...p, material: null }))}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>{materialChipLabel}</span>
									<span>×</span>
								</button>
							)}
							{sel.technique && (
								<button
									type="button"
									onClick={() => setTechnique(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Technique: {sel.technique}</span>
									<span>×</span>
								</button>
							)}
							{sel.classification && (
								<button
									type="button"
									onClick={() => setClassification(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Classification: {sel.classification}</span>
									<span>×</span>
								</button>
							)}
							{sel.department && (
								<button
									type="button"
									onClick={() => setDepartment(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Collection area: {sel.department}</span>
									<span>×</span>
								</button>
							)}
							{sel.gallery && (
								<button
									type="button"
									onClick={() => setGallery(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Gallery: {sel.gallery}</span>
									<span>×</span>
								</button>
							)}
							{sel.date && (
								<button
									type="button"
									onClick={() => setDate(null)}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>
										Date: {yearLabel(sel.date.min)} – {yearLabel(sel.date.max)}
									</span>
									<span>×</span>
								</button>
							)}
							{sel.onView && (
								<button
									type="button"
									onClick={() => toggleFlag("onView")}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>On view</span>
									<span>×</span>
								</button>
							)}
							{sel.hasImage && (
								<button
									type="button"
									onClick={() => toggleFlag("hasImage")}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Has image</span>
									<span>×</span>
								</button>
							)}
							{sel.openAccess && (
								<button
									type="button"
									onClick={() => toggleFlag("openAccess")}
									className="flex items-center gap-1.5 border border-gray-900 bg-gray-900 px-2 py-1.5 font-mono text-meta text-white hover:bg-gray-700"
								>
									<span>Open access</span>
									<span>×</span>
								</button>
							)}
						</div>
					</ScopeMark>

					{matches.length > 0 ? (
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
							<div className="border border-dashed border-gray-300 px-4 py-10 text-center font-mono text-meta text-gray-500">
								{query
									? `No objects match “${query}” with these filters. Clear a filter or the search to broaden.`
									: "No objects match these filters. Clear one to broaden."}
							</div>
						</ScopeMark>
					)}
				</div>
			</div>
		</>
	);
}
