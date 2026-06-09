"use client";

/**
 * Autocomplete combobox for the collection search: suggests artwork titles
 * and facet values as you type, with keyboard navigation and ARIA support.
 *
 * Wireframe version: uses static sample data to simulate suggestions.
 * Modelled on craft-searchkit's Autocomplete component.
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { t } from "@/lib/strings";

// ── Suggestion types ────────────────────────────────────────────────

interface HitSuggestion {
	type: "hit";
	id: string;
	title: string;
	artist: string;
	date: string;
	department: string;
	/** Sample-doc slug when this id maps to a /objects/sample/[variant] route. */
	slug?: string;
}

interface FacetSuggestion {
	type: "facet";
	facetType: string;
	facetLabel: string;
	value: string;
	count: number;
}

interface SearchAllSuggestion {
	type: "searchAll";
	query: string;
}

type Suggestion = HitSuggestion | FacetSuggestion | SearchAllSuggestion;

// ── Fallback sample data ─────────────────────────────────────────────
// Used only when callers don't pass real `hits`. Empty by default so the
// listbox stays empty rather than showing legacy mock content.

const SAMPLE_HITS: Omit<HitSuggestion, "type">[] = [];

const SAMPLE_FACETS: Omit<FacetSuggestion, "type">[] = [
	// Classification / What
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Print",
		count: 96074,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Drawing",
		count: 10233,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Painting",
		count: 1737,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Photograph",
		count: 5881,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Sculpture",
		count: 2274,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Costume",
		count: 7418,
	},
	{
		facetType: "classification",
		facetLabel: "What",
		value: "Textile",
		count: 2644,
	},
	// Collection
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "Achenbach Foundation for Graphic Arts",
		count: 115627,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "Costume and Textile Arts",
		count: 11983,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "European Decorative Arts and Sculpture",
		count: 6063,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "Arts of Africa, Oceania, and the Americas",
		count: 5467,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "European Paintings",
		count: 757,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "American Paintings",
		count: 796,
	},
	{
		facetType: "department",
		facetLabel: "Collection area",
		value: "Ancient Art",
		count: 1301,
	},
	// Artist
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Gustave Doré",
		count: 2694,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Pablo Picasso",
		count: 948,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Claude Lorrain",
		count: 978,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Richard Diebenkorn",
		count: 627,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Thomas Rowlandson",
		count: 896,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Auguste Rodin",
		count: 142,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Camille Pissarro",
		count: 14,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "Claude Monet",
		count: 12,
	},
	{
		facetType: "primary_artist",
		facetLabel: "Artist",
		value: "John Singer Sargent",
		count: 38,
	},
	// Medium
	{ facetType: "medium", facetLabel: "Medium", value: "Etching", count: 18432 },
	{
		facetType: "medium",
		facetLabel: "Medium",
		value: "Engraving",
		count: 14201,
	},
	{
		facetType: "medium",
		facetLabel: "Medium",
		value: "Lithograph",
		count: 9876,
	},
	{
		facetType: "medium",
		facetLabel: "Medium",
		value: "Oil on canvas",
		count: 1243,
	},
	{
		facetType: "medium",
		facetLabel: "Medium",
		value: "Watercolour",
		count: 2187,
	},
	{
		facetType: "medium",
		facetLabel: "Medium",
		value: "Gelatin silver print",
		count: 3102,
	},
	{ facetType: "medium", facetLabel: "Medium", value: "Woodcut", count: 5643 },
	{ facetType: "medium", facetLabel: "Medium", value: "Silk", count: 1876 },
	{ facetType: "medium", facetLabel: "Medium", value: "Bronze", count: 567 },
	// Culture
	{
		facetType: "culture",
		facetLabel: "Culture",
		value: "French",
		count: 21043,
	},
	{
		facetType: "culture",
		facetLabel: "Culture",
		value: "American",
		count: 8762,
	},
	{
		facetType: "culture",
		facetLabel: "Culture",
		value: "Japanese",
		count: 4321,
	},
	{
		facetType: "culture",
		facetLabel: "Culture",
		value: "Chinese",
		count: 2198,
	},
	// Geography
	{
		facetType: "geography",
		facetLabel: "Geography",
		value: "France",
		count: 19876,
	},
	{
		facetType: "geography",
		facetLabel: "Geography",
		value: "United States",
		count: 7654,
	},
	{
		facetType: "geography",
		facetLabel: "Geography",
		value: "Germany",
		count: 5432,
	},
	{
		facetType: "geography",
		facetLabel: "Geography",
		value: "Italy",
		count: 4987,
	},
	{
		facetType: "geography",
		facetLabel: "Geography",
		value: "Japan",
		count: 3210,
	},
];

// ── Constants ───────────────────────────────────────────────────────

const MIN_QUERY_LENGTH = 2;
const MAX_HITS = 5;
const MAX_FACETS_PER_TYPE = 3;

// ── Matching logic ──────────────────────────────────────────────────

function matchQuery(
	query: string,
	hits: Omit<HitSuggestion, "type">[],
	facets: Omit<FacetSuggestion, "type">[],
): Suggestion[] {
	const q = query.toLowerCase();
	const result: Suggestion[] = [];

	// Facet matches: grouped by type, max per type
	const grouped: Record<string, FacetSuggestion[]> = {};
	for (const f of facets) {
		if (f.value.toLowerCase().includes(q)) {
			if (!grouped[f.facetType]) grouped[f.facetType] = [];
			if (grouped[f.facetType].length < MAX_FACETS_PER_TYPE) {
				grouped[f.facetType].push({ type: "facet", ...f });
			}
		}
	}
	for (const facetList of Object.values(grouped)) {
		result.push(...facetList);
	}

	// Hit matches: by title or artist
	const hitMatches = hits
		.filter(
			(h) =>
				h.title.toLowerCase().includes(q) || h.artist.toLowerCase().includes(q),
		)
		.slice(0, MAX_HITS);

	for (const h of hitMatches) {
		result.push({ type: "hit", ...h });
	}

	// "Search all" footer
	if (result.length > 0) {
		result.push({ type: "searchAll", query });
	}

	return result;
}

// ── Highlight helper ────────────────────────────────────────────────

function HighlightMatch({ text, query }: { text: string; query: string }) {
	if (!query || query.length < MIN_QUERY_LENGTH) {
		return <>{text}</>;
	}

	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx === -1) return <>{text}</>;

	return (
		<>
			{text.slice(0, idx)}
			<mark className="bg-amber-100 text-inherit">
				{text.slice(idx, idx + query.length)}
			</mark>
			{text.slice(idx + query.length)}
		</>
	);
}

// ── Component ───────────────────────────────────────────────────────

interface CollectionAutocompleteProps {
	placeholder?: string;
	className?: string;
	leadingSlot?: ReactNode;
	hits?: Omit<HitSuggestion, "type">[];
	facets?: Omit<FacetSuggestion, "type">[];
}

export default function CollectionAutocomplete({
	placeholder,
	className,
	leadingSlot,
	hits = SAMPLE_HITS,
	facets = SAMPLE_FACETS,
}: CollectionAutocompleteProps) {
	const id = useId();
	const listboxId = `${id}-listbox`;
	const inputRef = useRef<HTMLInputElement>(null);
	const listboxRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [inputValue, setInputValue] = useState(
		() => searchParams.get("q") ?? "",
	);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const submitSearch = useCallback(() => {
		const q = inputValue.trim();
		setIsOpen(false);
		const params = new URLSearchParams();
		if (q) params.set("q", q);
		if (pathname === "/search-results") {
			const variation = searchParams.get("variation");
			if (variation) params.set("variation", variation);
		}
		const qs = params.toString();
		router.push(qs ? `/search-results?${qs}` : "/search-results");
	}, [inputValue, router, pathname, searchParams]);

	const suggestions = useMemo(() => {
		if (inputValue.length < MIN_QUERY_LENGTH) return [];
		return matchQuery(inputValue, hits, facets);
	}, [inputValue, hits, facets]);

	const hasResults = suggestions.length > 0;
	const showListbox = isOpen && inputValue.length >= MIN_QUERY_LENGTH;

	// Click-outside
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Reset active index when suggestions change
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset on suggestion count change
	useEffect(() => {
		setActiveIndex(-1);
	}, [suggestions.length]);

	// Scroll active into view
	useEffect(() => {
		if (activeIndex >= 0) {
			const el = listboxRef.current?.querySelector(
				`#${CSS.escape(`${id}-opt-${activeIndex}`)}`,
			);
			el?.scrollIntoView({ block: "nearest" });
		}
	}, [activeIndex, id]);

	const select = useCallback(
		(s: Suggestion) => {
			setIsOpen(false);
			if (s.type === "hit") {
				router.push(s.slug ? `/objects/sample/${s.slug}` : "/objects/sample");
				return;
			}
			if (s.type === "facet") {
				const params = new URLSearchParams();
				// Facet click: pure filter, no free-text query.
				params.set("facet", `${s.facetType}:${s.value}`);
				const currentVariation =
					pathname === "/search-results" ? searchParams.get("variation") : null;
				// The grid-facets variations seed any facet type from ?facet=
				// directly (including artist), so don't bounce them to "mixed".
				const onGridFacets =
					currentVariation === "grid-facets" ||
					currentVariation === "grid-facets-modal" ||
					// bare /search-results defaults to grid-facets-modal
					(pathname === "/search-results" && currentVariation === null);
				if (
					(s.facetType === "artist" || s.facetType === "primary_artist") &&
					!onGridFacets
				) {
					params.set("artist", s.value);
					const showsArtists =
						currentVariation === "mixed" || currentVariation === "interleaved";
					params.set("variation", showsArtists ? currentVariation : "mixed");
				} else if (currentVariation) {
					params.set("variation", currentVariation);
				}
				setInputValue("");
				router.push(`/search-results?${params.toString()}`);
				return;
			}
			// searchAll
			submitSearch();
		},
		[router, pathname, searchParams, submitSearch],
	);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (!showListbox && e.key !== "Escape" && e.key !== "Enter") return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : 0,
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIndex((prev) =>
					prev > 0 ? prev - 1 : suggestions.length - 1,
				);
				break;
			case "Enter":
				e.preventDefault();
				if (activeIndex >= 0 && activeIndex < suggestions.length) {
					select(suggestions[activeIndex]);
				} else {
					submitSearch();
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				setActiveIndex(-1);
				break;
		}
	};

	// Render grouped suggestions
	const renderSuggestions = () => {
		const elements: ReactNode[] = [];
		let currentFacetType: string | null = null;
		let facetsRendered = false;
		let hitsRendered = false;

		for (let i = 0; i < suggestions.length; i++) {
			const s = suggestions[i];
			const isActive = i === activeIndex;
			const optionId = `${id}-opt-${i}`;

			if (s.type === "facet") {
				if (s.facetType !== currentFacetType) {
					currentFacetType = s.facetType;
					facetsRendered = true;
					elements.push(
						<div
							key={`group-${currentFacetType}`}
							className="px-3 pb-1 pt-2 font-mono text-label tracking-wide text-gray-500"
						>
							{s.facetLabel}
						</div>,
					);
				}
				elements.push(
					<button
						key={optionId}
						id={optionId}
						type="button"
						role="option"
						tabIndex={-1}
						aria-selected={isActive}
						className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left font-mono text-body ${
							isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
						}`}
						onMouseDown={(e) => {
							e.preventDefault();
							select(s);
						}}
						onMouseEnter={() => setActiveIndex(i)}
					>
						<span>
							<HighlightMatch text={s.value} query={inputValue} />
						</span>
						<span className="ml-2 font-mono text-label tabular-nums text-gray-400">
							{s.count.toLocaleString()}
						</span>
					</button>,
				);
			} else if (s.type === "hit") {
				if (!hitsRendered) {
					hitsRendered = true;
					if (facetsRendered) {
						elements.push(
							<div key="divider" className="my-1 border-t border-gray-200" />,
						);
					}
					elements.push(
						<div
							key="hits-label"
							className="px-3 pb-1 pt-2 font-mono text-label tracking-wide text-gray-500"
						>
							Objects
						</div>,
					);
				}
				elements.push(
					<button
						key={optionId}
						id={optionId}
						type="button"
						role="option"
						tabIndex={-1}
						aria-selected={isActive}
						className={`flex w-full cursor-pointer items-center gap-3 px-3 py-1.5 text-left ${
							isActive ? "bg-gray-100" : "hover:bg-gray-50"
						}`}
						onMouseDown={(e) => {
							e.preventDefault();
							select(s);
						}}
						onMouseEnter={() => setActiveIndex(i)}
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gray-200">
							<span className="font-mono text-[8px] text-gray-400">[img]</span>
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-mono text-meta font-medium">
								<HighlightMatch text={s.title} query={inputValue} />
							</p>
							<p className="truncate font-mono text-label text-gray-500">
								<HighlightMatch text={s.artist} query={inputValue} /> · {s.date}
							</p>
						</div>
					</button>,
				);
			} else if (s.type === "searchAll") {
				elements.push(
					<div
						key="footer-divider"
						className="my-1 border-t border-gray-200"
					/>,
				);
				elements.push(
					<button
						key={optionId}
						id={optionId}
						type="button"
						role="option"
						tabIndex={-1}
						aria-selected={isActive}
						className={`w-full cursor-pointer px-3 py-2 text-left font-mono text-body ${
							isActive
								? "bg-gray-100 font-medium"
								: "text-gray-500 hover:bg-gray-50"
						}`}
						onMouseDown={(e) => {
							e.preventDefault();
							select(s);
						}}
						onMouseEnter={() => setActiveIndex(i)}
					>
						Search all for &ldquo;{s.query}&rdquo;
					</button>,
				);
			}
		}

		return elements;
	};

	return (
		<div ref={rootRef} className={`relative ${className ?? ""}`}>
			<div className="flex">
				{leadingSlot}
				<input
					ref={inputRef}
					type="search"
					role="combobox"
					aria-autocomplete="list"
					aria-controls={listboxId}
					aria-expanded={showListbox && hasResults}
					aria-activedescendant={
						activeIndex >= 0 && showListbox
							? `${id}-opt-${activeIndex}`
							: undefined
					}
					aria-label="Search the collection"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						setIsOpen(true);
						setActiveIndex(-1);
					}}
					onFocus={() => {
						if (inputValue.length >= MIN_QUERY_LENGTH) {
							setIsOpen(true);
						}
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder ?? t("search.placeholder")}
					className={`flex-1 border border-gray-300 bg-white px-4 py-3 font-mono text-body text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none${leadingSlot ? " border-l-0" : ""}`}
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
				/>
				<button
					type="button"
					onClick={submitSearch}
					className="border border-l-0 border-gray-900 bg-gray-900 px-6 py-3 font-mono text-body text-white transition-colors hover:bg-gray-700"
				>
					Search
				</button>
			</div>

			{showListbox && (
				<div
					ref={listboxRef}
					id={listboxId}
					role="listbox"
					aria-label="Search suggestions"
					className="absolute left-0 top-full z-50 mt-1 max-h-96 w-full overflow-y-auto border border-gray-300 bg-white shadow-sm"
				>
					{hasResults ? (
						renderSuggestions()
					) : (
						<div className="px-3 py-3 font-mono text-body text-gray-500">
							No results for &ldquo;{inputValue}&rdquo;
						</div>
					)}
				</div>
			)}
		</div>
	);
}
