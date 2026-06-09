"use client";

import { useEffect, useRef, useState } from "react";
import type { CollectionDocument } from "@/lib/collection-document";
import type { ArtistRecord } from "./SearchResultsClient";

export interface FacetOption {
	value: string;
	count: number;
}

export interface FacetConfig {
	id: string;
	label: string;
	options: FacetOption[];
}

export interface ObjectFacetDef {
	id: string;
	label: string;
	getValues: (o: CollectionDocument) => string[];
}

export interface ArtistFacetDef {
	id: string;
	label: string;
	getValues: (a: ArtistRecord) => string[];
}

export function termValues(entries?: { term: string }[]): string[] {
	return (entries ?? []).map((e) => e.term).filter(Boolean);
}

export const OBJECT_FACETS: ObjectFacetDef[] = [
	{
		id: "classification",
		label: "What",
		getValues: (o) => (o.classification ? [o.classification] : []),
	},
	{
		id: "department",
		label: "Collection area",
		getValues: (o) => (o.department ? [o.department] : []),
	},
	{
		id: "artist",
		label: "Artist",
		getValues: (o) => (o.primary_artist ? [o.primary_artist] : []),
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
		id: "dateRange",
		label: "Date",
		getValues: (o) => {
			const c = objectCentury(o);
			return c ? [c] : [];
		},
	},
];

/** Ordinal suffix for a positive integer: 1→st, 2→nd, 3→rd, 11/12/13→th. */
function ordinalSuffix(n: number): string {
	const tens = n % 100;
	if (tens >= 11 && tens <= 13) return "th";
	switch (n % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

/** Object's creation year (negative = BCE). Reads sort_year, falling back
 *  to the ISO date bounds. Year 0 is dropped (ISO 8601 has none; the data
 *  also uses 0 as an "unknown" sentinel). */
export function objectYear(o: CollectionDocument): number | undefined {
	const isoYear = (iso?: string | null): number | undefined => {
		if (!iso) return undefined;
		const m = iso.match(/^(-?\d+)/);
		return m ? Number(m[1]) : undefined;
	};
	const year =
		o.sort_year ?? isoYear(o.begin_iso_date) ?? isoYear(o.end_iso_date);
	if (year == null || Number.isNaN(year) || year === 0) return undefined;
	return year;
}

/** Bucket an object into its century of creation, e.g. "19th century" or
 *  "7th century BCE". */
export function objectCentury(o: CollectionDocument): string | undefined {
	const year = objectYear(o);
	if (year == null) return undefined;
	if (year < 0) {
		// e.g. -650 → 7th century BCE (ceil of 650/100).
		const c = Math.ceil(Math.abs(year) / 100);
		return `${c}${ordinalSuffix(c)} century BCE`;
	}
	const c = Math.floor((year - 1) / 100) + 1;
	return `${c}${ordinalSuffix(c)} century`;
}

function parseArtistDates(dates: string): { birth?: number; death?: number } {
	const m = dates.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})?/);
	if (!m) return {};
	return {
		birth: m[1] ? Number(m[1]) : undefined,
		death: m[2] ? Number(m[2]) : undefined,
	};
}

export function artistCentury(dates: string | null): string | undefined {
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

export const ARTIST_FACETS: ArtistFacetDef[] = [
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

export function countObjectFacet(
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

export function countArtistFacet(
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

export type Selections = Record<string, string | null>;

export function filterObjects(
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

export function filterArtists(
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

export function FacetDialog({
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
				<h3 className="font-mono text-label font-bold ">{facet.label}</h3>
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
