"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
	Breadcrumb,
	Container,
	ExhibitionRow,
	ImagePlaceholder,
	LinkCard,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import {
	artists,
	getArtist,
	getArtistObjects,
	getExhibitions,
	type SampleArtist,
} from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const RELATED_ARTISTS = [
	{ name: "Claude Monet", dates: "1840\u20131926", works: 12 },
	{ name: "Pierre-Auguste Renoir", dates: "1841\u20131919", works: 8 },
	{ name: "Paul C\u00e9zanne", dates: "1839\u20131906", works: 6 },
	{ name: "Alfred Sisley", dates: "1839\u20131899", works: 3 },
];

function ArtistPageContent() {
	const searchParams = useSearchParams();
	const name = searchParams.get("name");

	const artist: SampleArtist = getArtist(name ?? "") ?? artists[0];
	const artistObjects = getArtistObjects(artist.name);

	// Gather exhibitions from all objects
	const allExhibitions = artistObjects.flatMap((obj) =>
		getExhibitions(obj.id).map((exh) => ({ ...exh, objectTitle: obj.title })),
	);
	// Deduplicate by title
	const uniqueExhibitions = allExhibitions.filter(
		(exh, i, arr) => arr.findIndex((e) => e.title === exh.title) === i,
	);

	return (
		<ScopePage id="artist-page">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("artist.label") },
							{ label: artist.name },
						]}
					/>
				</Container>

				{/* Artist header */}
				<WireframeSection
					label="Artist header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("artist.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{artist.name}
						</h1>
						{artist.nationality && (
							<p className="mt-1 font-mono text-body text-gray-500">
								{artist.nationality}, {artist.dates}
							</p>
						)}

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard
								value={String(artistObjects.length)}
								label={t("artist.statWorks")}
							/>
							<StatCard
								value={String(artistObjects.filter((o) => o.onView).length)}
								label={t("artist.statOnView")}
							/>
							<StatCard
								value={String(uniqueExhibitions.length)}
								label={t("artist.statExhibitions")}
							/>
							<StatCard
								value={String(
									new Set(artistObjects.map((o) => o.department)).size,
								)}
								label={t("artist.statDepartments")}
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Biography */}
				{artist.bio && (
					<WireframeSection
						label="Biography"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("artist.bioHeading")}
							</SectionLabel>
							<ScopeMark label="Biography">
								<p className="font-mono text-body text-gray-600">
									{artist.bio}
								</p>
							</ScopeMark>
						</Container>
					</WireframeSection>
				)}

				{/* Works grid */}
				<WireframeSection
					label="Works grid"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-6 flex items-center justify-between">
							<SectionLabel>{t("artist.worksHeading")}</SectionLabel>
							<span className="font-mono text-meta text-gray-400">
								{artistObjects.length} {t("artist.worksCount")}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{artistObjects.map((work) => (
								<Link
									key={work.id}
									href={`/object-detail?id=${work.id}`}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{work.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{work.date}
										</p>
										<p className="font-mono text-label text-gray-400">
											{work.medium}
										</p>
										{work.onView && (
											<span className="mt-1.5 inline-block border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 font-mono text-label text-emerald-700">
												On view
											</span>
										)}
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Exhibition history */}
				{uniqueExhibitions.length > 0 && (
					<WireframeSection
						label="Exhibition history"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<ScopeMark label="Exhibition history">
								<SectionLabel className="mb-4">
									{t("artist.exhibitionsHeading")}
								</SectionLabel>
								<div className="flex flex-col gap-3">
									{uniqueExhibitions.map((exh) => (
										<ExhibitionRow
											key={exh.title}
											title={exh.title}
											date={exh.date}
											venue={exh.venue}
										/>
									))}
								</div>
							</ScopeMark>
						</Container>
					</WireframeSection>
				)}

				{/* Related artists */}
				<WireframeSection label="Related artists" className="py-12">
					<Container size="md">
						<ScopeMark label="Related artists">
							<SectionLabel className="mb-6">
								{t("artist.relatedHeading")}
							</SectionLabel>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{RELATED_ARTISTS.map((ra) => (
									<LinkCard
										key={ra.name}
										title={ra.name}
										description={`${ra.dates} \u00b7 ${ra.works} works in collection`}
										href={`/artist-page?name=${encodeURIComponent(ra.name)}`}
										arrow
									/>
								))}
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}

export default function ArtistPage() {
	return (
		<Suspense>
			<ArtistPageContent />
		</Suspense>
	);
}
