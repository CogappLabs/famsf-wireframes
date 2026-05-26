"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
	Container,
	ImagePlaceholder,
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

interface ArtistRecord {
	id: number;
	name: string;
	nationality: string | null;
	displayDate: string | null;
	role: string;
	workCount: number;
}

function deriveArtists(docs: CollectionDocument[]): ArtistRecord[] {
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

const VIEW_VARIATIONS = [
	{ key: "grid", label: "Grid" },
	{ key: "list", label: "List" },
	{ key: "zero-results", label: "Zero results" },
	{ key: "ai-search", label: "AI search" },
	{ key: "mixed", label: "Artworks + artists" },
	{ key: "interleaved", label: "Interleaved" },
] as const;

// ── Facet configuration ─────────────────────────────────────────────

interface FacetOption {
	value: string;
	count: number;
}

interface FacetConfig {
	id: string;
	label: string;
	options: FacetOption[];
}

interface ObjectFacetDef {
	id: string;
	label: string;
	getValues: (o: CollectionDocument) => string[];
}

interface ArtistFacetDef {
	id: string;
	label: string;
	getValues: (a: ArtistRecord) => string[];
}

function termValues(entries?: { term: string }[]): string[] {
	return (entries ?? []).map((e) => e.term).filter(Boolean);
}

const OBJECT_FACETS: ObjectFacetDef[] = [
	{
		id: "classification",
		label: "What",
		getValues: (o) => (o.classification ? [o.classification] : []),
	},
	{
		id: "department",
		label: "Collection",
		getValues: (o) => (o.department ? [o.department] : []),
	},
	{
		id: "artist",
		label: "Artist",
		getValues: (o) => (o.primary_artist ? [o.primary_artist] : []),
	},
	{
		id: "medium",
		label: "Medium",
		getValues: (o) => (o.medium ? [o.medium] : []),
	},
	{
		id: "geography",
		label: "Geography",
		getValues: (o) => [
			...termValues(o.term_place_of_creation),
			...termValues(o.term_related_geography),
		],
	},
	{
		id: "period",
		label: "Period",
		getValues: (o) => termValues(o.term_period),
	},
	{
		id: "style",
		label: "Style",
		getValues: (o) => termValues(o.term_style),
	},
	{
		id: "movement",
		label: "Movement",
		getValues: (o) => termValues(o.term_movement),
	},
	{
		id: "materials",
		label: "Materials",
		getValues: (o) => termValues(o.term_materials),
	},
	{
		id: "subject",
		label: "Subject",
		getValues: (o) => termValues(o.term_subject),
	},
	{
		id: "culture",
		label: "Culture",
		getValues: (o) =>
			(o.constituents ?? [])
				.filter((c) => c.Role === "Culture")
				.map((c) => c.DisplayName)
				.filter(Boolean),
	},
	{
		id: "reign",
		label: "Reign",
		getValues: (o) => termValues(o.term_reign),
	},
	{
		id: "dynasty",
		label: "Dynasty",
		getValues: (o) => termValues(o.term_dynasty),
	},
	{
		id: "school",
		label: "School",
		getValues: (o) => termValues(o.term_school),
	},
	{
		id: "attributionQualifier",
		label: "Attribution",
		getValues: (o) => {
			const roles = new Set(
				(o.constituents ?? []).map((c) => c.Role).filter(Boolean),
			);
			return [...roles].filter((r) =>
				/^(attributed to|signed by|possibly made by|after|workshop of|circle of|follower of|manner of|school of)$/i.test(
					r,
				),
			);
		},
	},
	{
		id: "openAccess",
		label: "Open access",
		getValues: (o) => {
			const term = o.term_rights_statement?.[0]?.term ?? "";
			return /no copyright|public domain/i.test(term) ? ["Public domain"] : [];
		},
	},
	{
		id: "hasImage",
		label: "Has image",
		getValues: (o) => (o.has_iiif ? ["Yes"] : []),
	},
	{
		id: "onView",
		label: "On view",
		getValues: (o) => (o.on_view ? ["On view"] : []),
	},
	{
		id: "donor",
		label: "Donor / Credit",
		getValues: (o) => (o.credit_line ? [o.credit_line] : []),
	},
	{
		id: "dateRange",
		label: "Date",
		getValues: (o) => {
			const c = objectCentury(o);
			return c ? [c] : [];
		},
	},
];

function objectCentury(o: CollectionDocument): string | undefined {
	const year =
		o.sort_year ??
		(o.begin_iso_date ? Number(o.begin_iso_date.slice(0, 4)) : undefined) ??
		(o.end_iso_date ? Number(o.end_iso_date.slice(0, 4)) : undefined);
	if (!year || Number.isNaN(year)) return undefined;
	const c = Math.floor(year / 100) + (year > 0 ? 1 : 0);
	if (c <= 0) return `${Math.abs(c) + 1} BCE`;
	const v = c % 100;
	const ord = ["th", "st", "nd", "rd"];
	const suffix = ord[(v - 20) % 10] ?? ord[v] ?? ord[0];
	return `${c}${suffix} century`;
}

function parseArtistDates(dates: string): { birth?: number; death?: number } {
	const m = dates.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})?/);
	if (!m) return {};
	return {
		birth: m[1] ? Number(m[1]) : undefined,
		death: m[2] ? Number(m[2]) : undefined,
	};
}

function artistCentury(dates: string | null): string | undefined {
	if (!dates) return undefined;
	const { birth, death } = parseArtistDates(dates);
	if (!birth && !death) return undefined;
	const mid = birth && death ? (birth + death) / 2 : (birth ?? death ?? 0) + 20;
	const c = Math.floor(mid / 100) + 1;
	const v = c % 100;
	const ord = ["th", "st", "nd", "rd"];
	const suffix = ord[(v - 20) % 10] ?? ord[v] ?? ord[0];
	return `${c}${suffix} century`;
}

const ARTIST_FACETS: ArtistFacetDef[] = [
	{
		id: "nationality",
		label: "Nationality",
		getValues: (a) => (a.nationality ? [a.nationality] : []),
	},
	{
		id: "datesActive",
		label: "Dates active",
		getValues: (a) => {
			const c = artistCentury(a.displayDate);
			return c ? [c] : [];
		},
	},
	{
		id: "role",
		label: "Role",
		getValues: (a) => (a.role ? [a.role] : []),
	},
];

function countObjectFacet(
	items: CollectionDocument[],
	facet: ObjectFacetDef,
): FacetOption[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		for (const v of facet.getValues(item)) {
			counts.set(v, (counts.get(v) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) => b.count - a.count);
}

function countArtistFacet(
	items: ArtistRecord[],
	facet: ArtistFacetDef,
): FacetOption[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		for (const v of facet.getValues(item)) {
			counts.set(v, (counts.get(v) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) => b.count - a.count);
}

type Selections = Record<string, string | null>;

function filterObjects(
	items: CollectionDocument[],
	selections: Selections,
): CollectionDocument[] {
	return items.filter((o) =>
		OBJECT_FACETS.every((f) => {
			const sel = selections[f.id];
			if (!sel) return true;
			return f.getValues(o).includes(sel);
		}),
	);
}

function filterArtists(
	items: ArtistRecord[],
	selections: Selections,
): ArtistRecord[] {
	return items.filter((a) =>
		ARTIST_FACETS.every((f) => {
			const sel = selections[f.id];
			if (!sel) return true;
			return f.getValues(a).includes(sel);
		}),
	);
}

// ── Facet dialog ────────────────────────────────────────────────────

function FacetDialog({
	facet,
	selected,
	onSelect,
	onClose,
}: {
	facet: FacetConfig;
	selected: string | null;
	onSelect: (value: string | null) => void;
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
				{selected && (
					<button
						type="button"
						onClick={() => {
							onSelect(null);
							onClose();
						}}
						className="flex items-center justify-between border-b border-gray-200 px-2 py-1.5 font-mono text-meta text-gray-500 hover:bg-gray-50"
					>
						<span>Clear selection</span>
						<span>×</span>
					</button>
				)}
				{filtered.map((option) => {
					const isSelected = selected === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => {
								onSelect(isSelected ? null : option.value);
								onClose();
							}}
							className={`flex items-center justify-between px-2 py-1.5 font-mono text-body hover:bg-gray-50 ${
								isSelected ? "bg-gray-100 font-medium" : ""
							}`}
						>
							<span>
								{isSelected && "✓ "}
								{option.value}
							</span>
							<span className="font-mono text-meta tabular-nums text-gray-500">
								{option.count.toLocaleString()}
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

// ── Results ─────────────────────────────────────────────────────────

function isPublicDomain(o: CollectionDocument): boolean {
	return (o.copyright ?? "").toLowerCase().includes("public domain");
}

function ResultsGrid({
	items,
	getHref,
}: {
	items: CollectionDocument[];
	getHref: (id: number) => string;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

function InterleavedResults({
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

function ResultsList({
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

function ArtistHero({
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

function ArtistsRow({
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

function ZeroResults({
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
			{/* Did you mean */}
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

// ── Page ────────────────────────────────────────────────────────────

function SearchResultsContent({
	docs,
	constituents,
	constituentSlugById,
	objectSlugById,
}: {
	docs: CollectionDocument[];
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
				facetType: "medium",
				facetLabel: "Medium",
				get: (d) => (d.medium ? [d.medium] : []),
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
				facetType: "style",
				facetLabel: "Style",
				get: (d) => (d.term_style ?? []).map((t) => t.term),
			},
			{
				facetType: "movement",
				facetLabel: "Movement",
				get: (d) => (d.term_movement ?? []).map((t) => t.term),
			},
			{
				facetType: "materials",
				facetLabel: "Materials",
				get: (d) => (d.term_materials ?? []).map((t) => t.term),
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
											className="border border-gray-300 bg-white px-3 py-3 font-mono text-meta text-gray-600 hover:border-gray-500 focus:outline-none"
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
								hits={autocompleteHits}
								facets={autocompleteFacets}
							/>
						)}
						<ScopeMark label="Accession-number tip">
							<p className="mt-2 font-mono text-label text-gray-500">
								{t("search.accessionTip")}
							</p>
						</ScopeMark>
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
												setOpenFacet(openFacet === facet.id ? null : facet.id)
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
											<ScopeMark key={facet.id} label="Gallery location filter">
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
						{(activeSelections.length > 0 || onlyOnView || onlyHasImage) && (
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
											a.name.toLowerCase() === pinnedArtistName.toLowerCase(),
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
										<ResultsList items={visibleObjects} getHref={objectHref} />
									) : (
										<ResultsGrid items={visibleObjects} getHref={objectHref} />
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
			</div>
		</ScopePage>
	);
}

export default function SearchResultsClient({
	docs,
	constituents,
	constituentSlugById,
	objectSlugById,
}: {
	docs: CollectionDocument[];
	constituents: ConstituentDocument[];
	constituentSlugById: Record<number, string>;
	objectSlugById: Record<number, string>;
}) {
	return (
		<Suspense>
			<SearchResultsContent
				docs={docs}
				constituents={constituents}
				constituentSlugById={constituentSlugById}
				objectSlugById={objectSlugById}
			/>
		</Suspense>
	);
}
