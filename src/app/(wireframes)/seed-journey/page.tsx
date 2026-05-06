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
	WireframeSection,
} from "@/components/wireframe";
import { objects, type SampleObject } from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const SAVED_OBJECTS = objects.slice(0, 5);

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
	{ key: "department", label: "Same department" },
	{ key: "classification", label: "Same classification" },
];

function directionValue(obj: SampleObject, key: DirectionKey): string {
	switch (key) {
		case "artist":
			return obj.artist;
		case "period":
			return obj.period ?? obj.date;
		case "medium":
			return obj.medium;
		case "culture":
			return obj.culture ?? "Unknown";
		case "department":
			return obj.department;
		case "classification":
			return obj.classification;
	}
}

function SeedJourneyContent() {
	const params = useSearchParams();
	const seedId = params.get("seed");
	const direction = (params.get("direction") as DirectionKey | null) ?? null;
	const pathRaw = params.get("path") ?? "";
	const pathIds = pathRaw ? pathRaw.split(",").filter(Boolean) : [];

	if (!seedId) return <SeedPicker />;

	const seed = objects.find((o) => o.id === seedId) ?? SAVED_OBJECTS[0];
	const journey: SampleObject[] = [
		seed,
		...pathIds
			.map((id) => objects.find((o) => o.id === id))
			.filter((o): o is SampleObject => Boolean(o)),
	];

	const current = journey[journey.length - 1];

	const directionSeed =
		(DIRECTIONS.findIndex((d) => d.key === direction) + 1) * 3;
	const suggestionPool = objects.filter((o) => o.id !== current.id);
	const suggestions = direction
		? Array.from(
				{ length: 6 },
				(_, i) => suggestionPool[(directionSeed + i) % suggestionPool.length],
			)
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
							← Back to My Finds
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
							href={buildHref({ seed: seed.id, direction: null, path: [] })}
							className="font-mono text-label text-gray-500 underline hover:text-gray-700"
						>
							{t("finds.seedReset")}
						</Link>
					</div>
					<ol className="mt-3 flex flex-wrap items-center gap-2">
						{journey.map((obj, i) => {
							const isLast = i === journey.length - 1;
							const stepPath = pathIds.slice(0, i);
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: same object can appear twice in path
								<li key={`${obj.id}-${i}`} className="flex items-center gap-2">
									{i > 0 && (
										<span className="font-mono text-label text-gray-400">
											→
										</span>
									)}
									<Link
										href={buildHref({
											seed: seed.id,
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
											{obj.title}
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
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
						<ScopeMark label="Current object">
							<SectionLabel>{t("finds.seedCurrent")}</SectionLabel>
							<div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
								<div>
									<ImagePlaceholder aspect="1/1" label="[img]" />
								</div>
								<div className="flex flex-col gap-3">
									<Link
										href={`/object-detail?id=${current.id}`}
										className="font-mono text-section font-semibold underline decoration-gray-300 hover:decoration-gray-600"
									>
										{current.title}
									</Link>
									<p className="font-mono text-body text-gray-700">
										{current.artist}, {current.date}
									</p>
									<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-meta text-gray-600">
										<dt className="text-gray-400">Medium</dt>
										<dd>{current.medium}</dd>
										<dt className="text-gray-400">Department</dt>
										<dd>{current.department}</dd>
										<dt className="text-gray-400">Classification</dt>
										<dd>{current.classification}</dd>
										{current.culture && (
											<>
												<dt className="text-gray-400">Culture</dt>
												<dd>{current.culture}</dd>
											</>
										)}
										{current.period && (
											<>
												<dt className="text-gray-400">Period</dt>
												<dd>{current.period}</dd>
											</>
										)}
									</dl>
								</div>
							</div>
						</ScopeMark>

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
					</div>
				</Container>
			</WireframeSection>

			{direction && (
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
							{suggestions.map((obj) => (
								<Link
									key={`${obj.id}-${pathIds.length}`}
									href={buildHref({
										direction: null,
										path: [...pathIds, obj.id],
									})}
									className="group flex flex-col gap-2"
								>
									<ImagePlaceholder aspect="1/1" label="[img]" />
									<div className="flex flex-col gap-1">
										<span className="font-mono text-label text-gray-900 underline decoration-gray-300 group-hover:decoration-gray-600 line-clamp-2">
											{obj.title}
										</span>
										<span className="font-mono text-label text-gray-500 line-clamp-1">
											{obj.artist}
										</span>
										<CategoryBadge>
											{DIRECTIONS.find((d) => d.key === direction)?.label}
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

function SeedPicker() {
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
							← Back to My Finds
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
							{SAVED_OBJECTS.length} saved objects to choose from
						</SectionLabel>
					</div>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
						{SAVED_OBJECTS.map((work) => (
							<Link
								key={work.id}
								href={`/seed-journey?seed=${work.id}`}
								className="group flex flex-col gap-2 border border-gray-300 p-3 transition-colors hover:border-gray-900"
							>
								<ImagePlaceholder aspect="1/1" label="[img]" />
								<div className="flex flex-col gap-1">
									<span className="font-mono text-meta font-medium text-gray-900 line-clamp-2 group-hover:underline">
										{work.title}
									</span>
									<span className="font-mono text-label text-gray-500 line-clamp-1">
										{work.artist}
									</span>
									<span className="font-mono text-label text-gray-400">
										{work.department}
									</span>
								</div>
								<span className="mt-2 inline-block border border-gray-900 bg-gray-900 px-2 py-1 text-center font-mono text-label text-white group-hover:bg-gray-700">
									Start journey from here →
								</span>
							</Link>
						))}
					</div>
				</Container>
			</WireframeSection>
		</div>
	);
}

export default function SeedJourneyPage() {
	return (
		<ScopePage id="seed-journey">
			<Suspense>
				<SeedJourneyContent />
			</Suspense>
		</ScopePage>
	);
}
