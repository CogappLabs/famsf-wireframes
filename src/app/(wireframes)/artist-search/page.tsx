"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Breadcrumb,
	Container,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { artists, type SampleArtist } from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

// Augmented artist record. SampleArtist has no role; we add it locally
// so the role facet has something to bite on.
interface ArtistRow extends SampleArtist {
	role: string;
}

const EXTRA_ARTISTS: ArtistRow[] = (
	[
		["Ansel Adams", "1902–1984", "American", "Photographer"],
		["Mary Cassatt", "1844–1926", "American", "Painter"],
		["Paul Cézanne", "1839–1906", "French", "Painter"],
		["Marc Chagall", "1887–1985", "French", "Painter"],
		["Willem de Kooning", "1904–1997", "American", "Painter"],
		["William Holman Hunt", "1827–1910", "British", "Painter"],
		["Frida Kahlo", "1907–1954", "Mexican", "Painter"],
		["Wassily Kandinsky", "1866–1944", "Russian", "Painter"],
		["Jacob Lawrence", "1917–2000", "American", "Painter"],
		["Roy Lichtenstein", "1923–1997", "American", "Painter"],
		["Henri Matisse", "1869–1954", "French", "Painter"],
		["Joan Miró", "1893–1983", "Spanish", "Painter"],
		["Berthe Morisot", "1841–1895", "French", "Painter"],
		["Louise Nevelson", "1899–1988", "American", "Sculptor"],
		["Georgia O'Keeffe", "1887–1986", "American", "Painter"],
		["Pablo Picasso", "1881–1973", "Spanish", "Painter"],
		["Diego Rivera", "1886–1957", "Mexican", "Painter"],
		["Mark Rothko", "1903–1970", "American", "Painter"],
		["Pierre-Auguste Renoir", "1841–1919", "French", "Painter"],
		["Alfred Sisley", "1839–1899", "French", "Painter"],
		["Vincent van Gogh", "1853–1890", "Dutch", "Painter"],
		["James McNeill Whistler", "1834–1903", "American", "Printmaker"],
		["Andrew Wyeth", "1917–2009", "American", "Painter"],
	] as const
).map(([name, dates, nationality, role]) => ({
	name,
	dates,
	nationality,
	role,
	objectIds: [],
}));

// Sample artists default to Painter unless name hints otherwise.
const ROLE_FALLBACKS: Record<string, string> = {
	"Auguste Rodin": "Sculptor",
	"Peter Carl Fabergé": "Goldsmith",
	"Edgar Degas": "Painter",
};

const SEED_ARTISTS: ArtistRow[] = artists.map((a) => ({
	...a,
	role: ROLE_FALLBACKS[a.name] ?? "Painter",
}));

const ALL_ARTISTS: ArtistRow[] = [...SEED_ARTISTS, ...EXTRA_ARTISTS];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function sortKey(name: string): string {
	const parts = name.trim().split(/\s+/);
	return (parts[parts.length - 1] ?? name).toLowerCase();
}

function firstLetter(name: string): string {
	const k = sortKey(name);
	return (k[0] ?? "").toUpperCase();
}

function initials(name: string): string {
	const parts = name.replace(/['’]/g, "").split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Parse "1830–1903" or "1840–" or "" → { birth, death }
function parseDates(dates: string): { birth?: number; death?: number } {
	const m = dates.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})?/);
	if (!m) return {};
	return {
		birth: m[1] ? Number(m[1]) : undefined,
		death: m[2] ? Number(m[2]) : undefined,
	};
}

// "Active in century N" = max(birth+20, death-50). Cheap proxy.
function activeCentury(dates: string): number | undefined {
	const { birth, death } = parseDates(dates);
	if (!birth && !death) return undefined;
	const mid = birth && death ? (birth + death) / 2 : (birth ?? death ?? 0) + 20;
	return Math.floor(mid / 100) + 1; // 1850 → 19th century
}

function ordinal(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// ── Facet config ────────────────────────────────────────────────────

interface FacetDef {
	id: "nationality" | "century" | "role";
	label: string;
	getValue: (a: ArtistRow) => string | undefined;
	formatOption?: (v: string) => string;
}

const FACETS: FacetDef[] = [
	{
		id: "nationality",
		label: "Nationality",
		getValue: (a) => a.nationality || undefined,
	},
	{
		id: "century",
		label: "Dates active",
		getValue: (a) => {
			const c = activeCentury(a.dates);
			return c ? String(c) : undefined;
		},
		formatOption: (v) => `${ordinal(Number(v))} century`,
	},
	{
		id: "role",
		label: "Role",
		getValue: (a) => a.role || undefined,
	},
];

interface FacetOptions {
	value: string;
	count: number;
}

function buildOptions(facet: FacetDef, pool: ArtistRow[]): FacetOptions[] {
	const counts = new Map<string, number>();
	for (const a of pool) {
		const v = facet.getValue(a);
		if (!v) continue;
		counts.set(v, (counts.get(v) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) =>
			facet.id === "century"
				? Number(a.value) - Number(b.value)
				: b.count - a.count,
		);
}

// ── Facet dialog ────────────────────────────────────────────────────

function FacetDialog({
	facet,
	options,
	selected,
	onToggle,
	onClose,
}: {
	facet: FacetDef;
	options: FacetOptions[];
	selected: Set<string>;
	onToggle: (value: string) => void;
	onClose: () => void;
}) {
	const [search, setSearch] = useState("");
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog && !dialog.open) dialog.showModal();
	}, []);

	const filtered = options.filter((o) => {
		const label = facet.formatOption ? facet.formatOption(o.value) : o.value;
		return label.toLowerCase().includes(search.toLowerCase());
	});

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
				{filtered.map((option) => {
					const label = facet.formatOption
						? facet.formatOption(option.value)
						: option.value;
					const isOn = selected.has(option.value);
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onToggle(option.value)}
							className={`flex items-center justify-between px-2 py-1.5 font-mono text-body hover:bg-gray-50 ${
								isOn ? "bg-gray-100" : ""
							}`}
						>
							<span className="flex items-center gap-2">
								<span
									className={`inline-block h-3.5 w-3.5 border ${
										isOn ? "border-gray-900 bg-gray-900" : "border-gray-300"
									}`}
								/>
								{label}
							</span>
							<span className="font-mono text-meta tabular-nums text-gray-500">
								{option.count}
							</span>
						</button>
					);
				})}
				{filtered.length === 0 && (
					<p className="px-2 py-3 font-mono text-meta text-gray-400">
						No matches
					</p>
				)}
			</div>
		</dialog>
	);
}

// ── Page ─────────────────────────────────────────────────────────────

export default function ArtistSearchPage() {
	const [query, setQuery] = useState("");
	const [letter, setLetter] = useState<string | null>(null);
	const [openFacet, setOpenFacet] = useState<string | null>(null);
	const [selections, setSelections] = useState<Record<string, Set<string>>>({
		nationality: new Set(),
		century: new Set(),
		role: new Set(),
	});

	const sorted = useMemo(
		() =>
			[...ALL_ARTISTS].sort((a, b) =>
				sortKey(a.name).localeCompare(sortKey(b.name)),
			),
		[],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return sorted.filter((a) => {
			if (letter && firstLetter(a.name) !== letter) return false;
			if (q && !a.name.toLowerCase().includes(q)) return false;
			for (const facet of FACETS) {
				const sel = selections[facet.id];
				if (!sel || sel.size === 0) continue;
				const v = facet.getValue(a);
				if (!v || !sel.has(v)) return false;
			}
			return true;
		});
	}, [sorted, query, letter, selections]);

	const availableLetters = useMemo(
		() => new Set(sorted.map((a) => firstLetter(a.name))),
		[sorted],
	);

	const activeFacet = FACETS.find((f) => f.id === openFacet);
	const activeOptions = activeFacet ? buildOptions(activeFacet, sorted) : [];

	const toggle = (facetId: string, value: string) => {
		setSelections((prev) => {
			const next = new Set(prev[facetId] ?? []);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return { ...prev, [facetId]: next };
		});
	};

	const clearAll = () =>
		setSelections({
			nationality: new Set(),
			century: new Set(),
			role: new Set(),
		});

	const activeCount = Object.values(selections).reduce((n, s) => n + s.size, 0);

	return (
		<ScopePage id="artist-search">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("artistSearch.label") },
						]}
					/>
				</Container>

				{/* Header + search */}
				<WireframeSection
					label="Search bar"
					className="border-b border-gray-300 py-10"
				>
					<Container>
						<SectionLabel>{t("artistSearch.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("artistSearch.heading")}
						</h1>
						<p className="mt-3 max-w-3xl font-mono text-body text-gray-600">
							{t("artistSearch.intro")}
						</p>

						<div className="mt-6 max-w-2xl">
							<label
								className="font-mono text-label uppercase tracking-[0.08em] text-gray-500"
								htmlFor="artist-search-input"
							>
								{t("artistSearch.searchLabel")}
							</label>
							<input
								id="artist-search-input"
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={t("artistSearch.searchPlaceholder")}
								className="mt-2 w-full border border-gray-400 bg-white px-3 py-2 font-mono text-body focus:border-gray-900 focus:outline-none"
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Facet bar */}
				<WireframeSection
					label="Facets"
					className="border-b border-gray-300 py-3"
				>
					<Container>
						<div className="flex flex-wrap items-center gap-2">
							{FACETS.map((facet) => {
								const sel = selections[facet.id] ?? new Set<string>();
								const hasSelections = sel.size > 0;
								return (
									<button
										key={facet.id}
										type="button"
										onClick={() =>
											setOpenFacet(openFacet === facet.id ? null : facet.id)
										}
										className={`border px-3 py-1.5 font-mono text-meta transition-colors ${
											openFacet === facet.id
												? "border-gray-500 bg-gray-100 font-medium"
												: hasSelections
													? "border-gray-900 bg-gray-900 text-white"
													: "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
										}`}
									>
										{facet.label}
										{hasSelections && ` (${sel.size})`} &#x25BE;
									</button>
								);
							})}

							{activeCount > 0 && (
								<button
									type="button"
									onClick={clearAll}
									className="font-mono text-meta text-gray-500 underline hover:text-gray-900"
								>
									Clear all
								</button>
							)}
						</div>
					</Container>
				</WireframeSection>

				{activeFacet && (
					<FacetDialog
						facet={activeFacet}
						options={activeOptions}
						selected={selections[activeFacet.id] ?? new Set()}
						onToggle={(v) => toggle(activeFacet.id, v)}
						onClose={() => setOpenFacet(null)}
					/>
				)}

				{/* Letter filter */}
				<WireframeSection
					label="Letter filter"
					className="border-b border-gray-200 py-6"
				>
					<Container>
						<SectionLabel>{t("artistSearch.letterFilterLabel")}</SectionLabel>
						<div className="mt-3 flex flex-wrap gap-1">
							<button
								type="button"
								onClick={() => setLetter(null)}
								className={`border px-3 py-1 font-mono text-label uppercase tracking-wide ${
									letter === null
										? "border-gray-900 bg-gray-900 text-white"
										: "border-gray-300 text-gray-700 hover:border-gray-500"
								}`}
							>
								{t("artistSearch.allLetters")}
							</button>
							{LETTERS.map((l) => {
								const available = availableLetters.has(l);
								const active = letter === l;
								return (
									<button
										key={l}
										type="button"
										disabled={!available}
										onClick={() => setLetter(active ? null : l)}
										className={`min-w-[2.25rem] border px-2 py-1 font-mono text-label uppercase tracking-wide ${
											active
												? "border-gray-900 bg-gray-900 text-white"
												: available
													? "border-gray-300 text-gray-700 hover:border-gray-500"
													: "border-gray-200 text-gray-300"
										}`}
									>
										{l}
									</button>
								);
							})}
						</div>
					</Container>
				</WireframeSection>

				{/* Artist list */}
				<WireframeSection label="Artist list" className="py-10">
					<Container>
						<SectionLabel>
							{filtered.length} {t("artistSearch.resultsCount")}
						</SectionLabel>

						{filtered.length === 0 ? (
							<p className="mt-6 font-mono text-body text-gray-500">
								{t("artistSearch.noResults")}
							</p>
						) : (
							<ul className="mt-6 grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
								{filtered.map((artist) => {
									const worksCount = artist.objectIds?.length ?? 0;
									return (
										<li key={artist.name} className="bg-white">
											<Link
												href={`/artist-page?name=${encodeURIComponent(artist.name)}`}
												className="flex items-start gap-4 p-4 hover:bg-gray-50"
											>
												<div
													aria-hidden="true"
													title={t("artistSearch.noImageNote")}
													className="flex h-14 w-14 flex-none items-center justify-center border border-gray-300 bg-gray-100 font-mono text-label uppercase tracking-wider text-gray-500"
												>
													{initials(artist.name)}
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate font-mono text-body font-semibold text-gray-900">
														{artist.name}
													</p>
													<p className="mt-0.5 font-mono text-label text-gray-500">
														{[artist.nationality, artist.dates]
															.filter(Boolean)
															.join(", ") || "–"}
													</p>
													<p className="mt-0.5 font-mono text-label text-gray-400">
														{artist.role}
														{worksCount > 0 &&
															` · ${worksCount} ${t("artistSearch.worksLabel")}`}
													</p>
												</div>
											</Link>
										</li>
									);
								})}
							</ul>
						)}
						<ScopeMark label="Facets">
							<p className="mt-4 font-mono text-label text-gray-400">
								[Wireframe note: facets driven by sample data: production
								includes nationality, dates active, role, birthplace, gender,
								affiliation, exhibition history.]
							</p>
						</ScopeMark>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
