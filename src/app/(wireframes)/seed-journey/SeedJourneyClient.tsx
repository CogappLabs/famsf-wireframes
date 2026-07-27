"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
	CategoryBadge,
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const MODE_VARIATIONS = [
	{ key: "directions", label: "Pick a direction" },
	{ key: "dice", label: "Roll the dice" },
] as const;

type DirectionKey =
	| "artist"
	| "period"
	| "medium"
	| "culture"
	| "department"
	| "classification";

const DIRECTIONS: { key: DirectionKey; label: string }[] = [
	{ key: "artist", label: "Same artist" },
	{ key: "period", label: "Same period" },
	{ key: "medium", label: "Same medium" },
	{ key: "culture", label: "Same culture" },
	{ key: "department", label: "Same collection area" },
	{ key: "classification", label: "Same classification" },
];

function docTitle(d: CollectionDocument): string {
	return d.title || d.accession_number;
}

function docArtist(d: CollectionDocument): string {
	return d.primary_artist_display ?? d.primary_artist;
}

function docDate(d: CollectionDocument): string {
	return d.date_display ?? d.display_year ?? "";
}

function directionValue(d: CollectionDocument, key: DirectionKey): string {
	switch (key) {
		case "artist":
			return docArtist(d);
		case "period":
			return d.term_movement?.[0]?.term ?? docDate(d);
		case "medium":
			return d.medium ?? "";
		case "culture":
			return d.term_place_of_creation?.[0]?.term ?? "Unknown";
		case "department":
			return d.department ?? "";
		case "classification":
			return d.classification ?? "";
	}
}

function SeedJourneyContent({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const mode = usePageVariations(MODE_VARIATIONS);
	const params = useSearchParams();
	const seedId = params.get("seed");
	const direction = (params.get("direction") as DirectionKey | null) ?? null;
	const pathRaw = params.get("path") ?? "";
	const pathIds = pathRaw ? pathRaw.split(",").filter(Boolean) : [];
	const isDice = mode === "dice";

	const sequence = docs.slice(0, 8);

	if (!seedId) return <SeedPicker docs={sequence} />;

	const seed = docs.find((d) => String(d.id) === seedId) ?? sequence[0];
	const journey: CollectionDocument[] = [
		seed,
		...pathIds
			.map((id) => docs.find((d) => String(d.id) === id))
			.filter((d): d is CollectionDocument => Boolean(d)),
	];

	const current = journey[journey.length - 1];

	const directionSeed =
		(DIRECTIONS.findIndex((d) => d.key === direction) + 1) * 3;
	const suggestionPool = docs.filter(
		(d) =>
			String(d.id) !== String(current.id) && !pathIds.includes(String(d.id)),
	);
	const suggestions = direction
		? Array.from(
				{ length: 6 },
				(_, i) => suggestionPool[(directionSeed + i) % suggestionPool.length],
			)
		: [];

	const idStr = String(current.id);
	const diceSeed =
		idStr
			.split("")
			.reduce((acc, c) => acc + c.charCodeAt(0), pathIds.length * 7) %
		Math.max(suggestionPool.length, 1);
	const dicePoolStart = direction
		? directionSeed % Math.max(suggestionPool.length, 1)
		: diceSeed;
	const dicePair = isDice
		? [
				suggestionPool[dicePoolStart % suggestionPool.length],
				suggestionPool[(dicePoolStart + 1) % suggestionPool.length],
			].filter(Boolean)
		: [];

	const buildHref = (p: {
		seed?: string;
		direction?: DirectionKey | null;
		path?: string[];
	}) => {
		const sp = new URLSearchParams();
		sp.set("seed", p.seed ?? seedId);
		if (p.direction) sp.set("direction", p.direction);
		if (p.path && p.path.length > 0) sp.set("path", p.path.join(","));
		if (isDice) sp.set("variation", "dice");
		return `/seed-journey?${sp.toString()}`;
	};

	const shareUrl = `collection.famsf.org${buildHref({
		direction,
		path: pathIds,
	})}`;

	return (
		<div className="min-h-screen bg-white">
			<WireframeSection
				label="Header"
				className="border-b border-gray-300 py-10"
			>
				<Container size="md">
					<SectionLabel>{t("finds.label")}</SectionLabel>
					<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
						{t("finds.seedHeading")}
					</h1>
					<p className="mt-4 font-mono text-body text-gray-600">
						{t("finds.seedIntro")}
					</p>
					<p className="mt-3 font-mono text-meta text-gray-500">
						<Link href="/my-finds" className="underline hover:text-gray-700">
							&#8592; Back to My finds
						</Link>
					</p>
				</Container>
			</WireframeSection>

			<WireframeSection
				label="Journey"
				className="border-b border-gray-200 bg-gray-50 py-6"
			>
				<Container>
					<div className="flex items-center justify-between gap-4">
						<SectionLabel>{t("finds.seedJourney")}</SectionLabel>
						<Link
							href={buildHref({
								seed: String(seed.id),
								direction: null,
								path: [],
							})}
							className="font-mono text-label text-gray-500 underline hover:text-gray-700"
						>
							{t("finds.seedReset")}
						</Link>
					</div>
					<ol className="mt-3 flex flex-wrap items-center gap-2">
						{journey.map((d, i) => {
							const isLast = i === journey.length - 1;
							const stepPath = pathIds.slice(0, i);
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: same object can appear twice in path
								<li key={`${d.id}-${i}`} className="flex items-center gap-2">
									{i > 0 && (
										<span className="font-mono text-label text-gray-400">
											&#8594;
										</span>
									)}
									<Link
										href={buildHref({
											seed: String(seed.id),
											direction: null,
											path: stepPath,
										})}
										className={`flex items-center gap-2 border px-2 py-1 font-mono text-label ${
											isLast
												? "border-gray-900 bg-white text-gray-900"
												: "border-gray-300 bg-white text-gray-600 hover:border-gray-500"
										}`}
									>
										<span className="block h-6 w-6 shrink-0 bg-gray-200" />
										<span className="line-clamp-1 max-w-[14rem]">
											{docTitle(d)}
										</span>
									</Link>
								</li>
							);
						})}
					</ol>
				</Container>
			</WireframeSection>

			<WireframeSection
				label="Current object + direction"
				className="border-b border-gray-300 py-8"
			>
				<Container>
					<div
						className={
							isDice
								? "grid grid-cols-1 gap-8"
								: "grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
						}
					>
						<ScopeMark label="Current object">
							<div>
								<SectionLabel>{t("finds.seedCurrent")}</SectionLabel>
								<div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
									<div>
										<ImagePlaceholder aspect="1/1" label="[img]" />
									</div>
									<div className="flex flex-col gap-3">
										<Link
											href={
												slugById[current.id]
													? `/objects/sample/${slugById[current.id]}`
													: "/objects/sample"
											}
											className="font-mono text-section font-semibold underline decoration-gray-300 hover:decoration-gray-600"
										>
											{docTitle(current)}
										</Link>
										<p className="font-mono text-body text-gray-700">
											{docArtist(current)}, {docDate(current)}
										</p>
										<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-meta text-gray-600">
											{current.medium && (
												<>
													<dt className="text-gray-400">Medium</dt>
													<dd>{current.medium}</dd>
												</>
											)}
											{current.department && (
												<>
													<dt className="text-gray-400">Collection area</dt>
													<dd>{current.department}</dd>
												</>
											)}
											{current.classification && (
												<>
													<dt className="text-gray-400">Classification</dt>
													<dd>{current.classification}</dd>
												</>
											)}
											{current.term_place_of_creation?.[0]?.term && (
												<>
													<dt className="text-gray-400">Culture</dt>
													<dd>{current.term_place_of_creation[0].term}</dd>
												</>
											)}
											{current.term_movement?.[0]?.term && (
												<>
													<dt className="text-gray-400">Movement</dt>
													<dd>{current.term_movement[0].term}</dd>
												</>
											)}
										</dl>
									</div>
								</div>
							</div>
						</ScopeMark>

						{!isDice && (
							<ScopeMark label="Pick direction">
								<div className="lg:sticky lg:top-4">
									<SectionLabel>{t("finds.seedPickDirection")}</SectionLabel>
									<p className="mt-2 mb-4 font-mono text-meta text-gray-500">
										Each direction reveals a different cluster.
									</p>
									<div className="flex flex-col gap-2">
										{DIRECTIONS.map((d) => {
											const isActive = direction === d.key;
											return (
												<Link
													key={d.key}
													href={buildHref({ direction: d.key, path: pathIds })}
													className={`flex items-center justify-between gap-3 border px-3 py-2 font-mono text-meta transition-colors ${
														isActive
															? "border-gray-900 bg-gray-900 text-white"
															: "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
													}`}
												>
													<span>{d.label}</span>
													<span
														className={`truncate text-label ${isActive ? "text-gray-300" : "text-gray-400"}`}
													>
														{directionValue(current, d.key)}
													</span>
												</Link>
											);
										})}
									</div>
								</div>
							</ScopeMark>
						)}
					</div>
				</Container>
			</WireframeSection>

			{isDice && dicePair.length > 0 && (
				<WireframeSection
					label="Roll the dice: pair"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<ScopeMark label="Curated pair">
							<div>
								<SectionLabel>{t("finds.seedDiceHeading")}</SectionLabel>
								<p className="mt-2 mb-6 font-mono text-meta text-gray-500">
									{t("finds.seedDiceIntro")}
								</p>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{dicePair.map((d) => (
										<Link
											key={`${d.id}-${pathIds.length}`}
											href={buildHref({
												direction: null,
												path: [...pathIds, String(d.id)],
											})}
											className="group flex flex-col gap-3 border border-gray-300 p-4 transition-colors hover:border-gray-900"
										>
											<ImagePlaceholder aspect="4/3" label="[img]" />
											<div className="flex flex-col gap-1">
												<span className="font-mono text-section font-semibold text-gray-900 group-hover:underline line-clamp-2">
													{docTitle(d)}
												</span>
												<span className="font-mono text-meta text-gray-600 line-clamp-1">
													{docArtist(d)}, {docDate(d)}
												</span>
											</div>
											<span className="mt-2 inline-block w-fit border border-gray-900 bg-gray-900 px-3 py-1 font-mono text-label text-white group-hover:bg-gray-700">
												Choose this &#8594;
											</span>
										</Link>
									))}
								</div>
							</div>
						</ScopeMark>

						<div className="mt-8">
							<ScopeMark label="Optional nudge">
								<div className="border-t border-dashed border-gray-300 pt-6">
									<SectionLabel>{t("finds.seedDiceRefine")}</SectionLabel>
									<p className="mt-2 mb-3 font-mono text-meta text-gray-500">
										{t("finds.seedDiceRefineHint")}
									</p>
									<div className="flex flex-wrap gap-2">
										{DIRECTIONS.map((d) => (
											<Link
												key={d.key}
												href={buildHref({ direction: d.key, path: pathIds })}
												className="border border-gray-300 bg-white px-3 py-1 font-mono text-label text-gray-700 hover:border-gray-500"
											>
												{directionValue(current, d.key)}
											</Link>
										))}
									</div>
								</div>
							</ScopeMark>
						</div>
					</Container>
				</WireframeSection>
			)}

			{!isDice && direction && (
				<WireframeSection
					label="Where next"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<SectionLabel>{t("finds.seedNext")}</SectionLabel>
						<p className="mt-2 mb-4 font-mono text-meta text-gray-500">
							Click any object to follow the thread. The journey grows.
						</p>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{suggestions.map((d) => (
								<Link
									key={`${d.id}-${pathIds.length}`}
									href={buildHref({
										direction: null,
										path: [...pathIds, String(d.id)],
									})}
									className="group flex flex-col gap-2"
								>
									<ImagePlaceholder aspect="1/1" label="[img]" />
									<div className="flex flex-col gap-1">
										<span className="font-mono text-label text-gray-900 underline decoration-gray-300 group-hover:decoration-gray-600 line-clamp-2">
											{docTitle(d)}
										</span>
										<span className="font-mono text-label text-gray-500 line-clamp-1">
											{docArtist(d)}
										</span>
										<CategoryBadge>
											{DIRECTIONS.find((dir) => dir.key === direction)?.label}
										</CategoryBadge>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>
			)}

			<WireframeSection label="Share journey" className="py-8">
				<Container size="md">
					<SectionLabel>{t("finds.seedShare")}</SectionLabel>
					<p className="mt-2 mb-4 font-mono text-meta text-gray-600">
						Send this URL to a colleague. They land on the same object, the same
						direction, and the full path so far.
					</p>
					<div className="flex items-center gap-3">
						<span className="flex-1 truncate border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-label text-gray-600">
							{shareUrl}
						</span>
						<button
							type="button"
							className="border border-gray-900 bg-gray-900 px-3 py-2 font-mono text-label text-white hover:bg-gray-700"
						>
							{t("finds.seedCopyLink")}
						</button>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							className="border border-gray-300 px-3 py-2 font-mono text-label text-gray-700 hover:border-gray-500"
						>
							{t("finds.seedSaveToFinds")} ({journey.length})
						</button>
						<button
							type="button"
							className="border border-gray-300 px-3 py-2 font-mono text-label text-gray-700 hover:border-gray-500"
						>
							{t("finds.downloadPDF")}
						</button>
					</div>
				</Container>
			</WireframeSection>
		</div>
	);
}

function SeedPicker({ docs }: { docs: CollectionDocument[] }) {
	return (
		<div className="min-h-screen bg-white">
			<WireframeSection
				label="Header"
				className="border-b border-gray-300 py-10"
			>
				<Container size="md">
					<SectionLabel>{t("finds.label")}</SectionLabel>
					<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
						{t("finds.seedPickHeading")}
					</h1>
					<p className="mt-4 font-mono text-body text-gray-600">
						{t("finds.seedPickIntro")}
					</p>
					<p className="mt-3 font-mono text-meta text-gray-500">
						<Link href="/my-finds" className="underline hover:text-gray-700">
							&#8592; Back to My finds
						</Link>
					</p>
				</Container>
			</WireframeSection>

			<WireframeSection
				label="Pick from your finds"
				className="border-b border-gray-300 py-8"
			>
				<Container>
					<div className="mb-4 flex items-center justify-between">
						<SectionLabel>
							{docs.length} saved objects to choose from
						</SectionLabel>
					</div>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
						{docs.map((d) => (
							<Link
								key={d.id}
								href={`/seed-journey?seed=${d.id}`}
								className="group flex flex-col gap-2 border border-gray-300 p-3 transition-colors hover:border-gray-900"
							>
								<ImagePlaceholder aspect="1/1" label="[img]" />
								<div className="flex flex-col gap-1">
									<span className="font-mono text-meta font-medium text-gray-900 line-clamp-2 group-hover:underline">
										{docTitle(d)}
									</span>
									<span className="font-mono text-label text-gray-500 line-clamp-1">
										{docArtist(d)}
									</span>
									<span className="font-mono text-label text-gray-400">
										{d.department ?? ""}
									</span>
								</div>
								<span className="mt-2 inline-block border border-gray-900 bg-gray-900 px-2 py-1 text-center font-mono text-label text-white group-hover:bg-gray-700">
									Start journey from here &#8594;
								</span>
							</Link>
						))}
					</div>
				</Container>
			</WireframeSection>
		</div>
	);
}

export default function SeedJourneyClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	return (
		<ScopePage id="seed-journey">
			<Suspense>
				<SeedJourneyContent docs={docs} slugById={slugById} />
			</Suspense>
		</ScopePage>
	);
}
