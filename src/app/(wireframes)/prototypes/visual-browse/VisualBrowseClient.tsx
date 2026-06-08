"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/wireframe";
import { t } from "@/lib/strings";

export interface BrowseItem {
	slug: string;
	title: string;
	artist: string | null;
	date: string | null;
	department: string | null;
	imageUrl: string;
	/** width / height; null when pixel dims missing. */
	aspect: number | null;
}

const ALL = "__all__";

export default function VisualBrowseClient({ items }: { items: BrowseItem[] }) {
	const [lens, setLens] = useState<string>(ALL);
	const [zoom, setZoom] = useState<"s" | "m" | "l">("m");

	// Lens pills derived from the departments actually present, sorted by
	// frequency so the busiest lenses lead.
	const lenses = useMemo(() => {
		const counts = new Map<string, number>();
		for (const it of items) {
			if (!it.department) continue;
			counts.set(it.department, (counts.get(it.department) ?? 0) + 1);
		}
		return Array.from(counts.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([dept, n]) => ({ dept, n }));
	}, [items]);

	const visible = useMemo(
		() => (lens === ALL ? items : items.filter((i) => i.department === lens)),
		[items, lens],
	);

	// Masonry via CSS columns. Column count tracks the zoom control.
	const columnClass =
		zoom === "s"
			? "columns-2 sm:columns-3 lg:columns-5"
			: zoom === "l"
				? "columns-1 sm:columns-2 lg:columns-3"
				: "columns-2 sm:columns-3 lg:columns-4";

	return (
		<Container className="py-10">
			<header className="mb-6">
				<h1 className="mb-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
					{t("visualBrowse.heading")}
				</h1>
				<p className="font-mono text-meta text-gray-500">
					{t("visualBrowse.subtitle")}
				</p>
			</header>

			{/* Controls: lens pills + zoom. Sticky so they survive scroll. */}
			<div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white/90 py-3 backdrop-blur">
				<button
					type="button"
					onClick={() => setLens(ALL)}
					className={pill(lens === ALL)}
				>
					{t("visualBrowse.allLens")}
					<span className="ml-1.5 text-gray-400">{items.length}</span>
				</button>
				{lenses.map(({ dept, n }) => (
					<button
						key={dept}
						type="button"
						onClick={() => setLens(dept)}
						className={pill(lens === dept)}
					>
						{dept}
						<span className="ml-1.5 text-gray-400">{n}</span>
					</button>
				))}

				<div className="ml-auto flex items-center gap-1">
					<span className="mr-1 font-mono text-label tracking-[0.08em] text-gray-400">
						{t("visualBrowse.size")}
					</span>
					{(["s", "m", "l"] as const).map((z) => (
						<button
							key={z}
							type="button"
							onClick={() => setZoom(z)}
							className={`border px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] transition-colors ${
								zoom === z
									? "border-purple-400 bg-purple-50 text-purple-700"
									: "border-gray-300 text-gray-400 hover:border-gray-400"
							}`}
						>
							{z}
						</button>
					))}
				</div>
			</div>

			{visible.length === 0 ? (
				<p className="py-20 text-center font-mono text-meta text-gray-400">
					{t("visualBrowse.empty")}
				</p>
			) : (
				<div className={`${columnClass} gap-3`}>
					{visible.map((item) => (
						<Tile key={item.slug} item={item} />
					))}
				</div>
			)}
		</Container>
	);
}

function Tile({ item }: { item: BrowseItem }) {
	return (
		<Link
			href={`/objects/sample/${item.slug}`}
			className="group relative mb-3 block break-inside-avoid overflow-hidden bg-gray-100"
		>
			{/* biome-ignore lint/performance/noImgElement: wireframe, external IIIF, no next/image loader config */}
			<img
				src={item.imageUrl}
				alt={item.title}
				loading="lazy"
				className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
				style={item.aspect ? { aspectRatio: String(item.aspect) } : undefined}
			/>
			{/* Metadata hidden until hover — image-first intent. */}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:translate-y-0 group-hover:opacity-100">
				<p className="font-mono text-meta font-medium leading-tight text-white">
					{item.title}
				</p>
				{item.artist && (
					<p className="font-mono text-label text-white/80">{item.artist}</p>
				)}
				{item.date && (
					<p className="font-mono text-label text-white/60">{item.date}</p>
				)}
			</div>
		</Link>
	);
}

function pill(active: boolean): string {
	return `border px-3 py-1 font-mono text-label tracking-[0.04em] transition-colors ${
		active
			? "border-gray-800 bg-gray-900 text-white"
			: "border-gray-300 text-gray-600 hover:border-gray-500"
	}`;
}
