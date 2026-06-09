"use client";

import Link from "next/link";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const LESSON_PLANS = [
	{
		title: "Impressionism and the Modern City",
		grades: "Grades 6–12",
		subjects: "Art History, Social Studies",
		duration: "2–3 class periods",
		objectCount: 8,
	},
	{
		title: "Stories in Sculpture: Reading Rodin",
		grades: "Grades 4–8",
		subjects: "Visual Arts, Language Arts",
		duration: "1–2 class periods",
		objectCount: 5,
	},
	{
		title: "Textiles Tell Stories",
		grades: "Grades 3–6",
		subjects: "Visual Arts, World Cultures",
		duration: "2 class periods",
		objectCount: 6,
	},
	{
		title: "Ancient Worlds: Art as Evidence",
		grades: "Grades 9–12",
		subjects: "Art History, World History",
		duration: "3–4 class periods",
		objectCount: 12,
	},
	{
		title: "California Landscapes: Place and Identity",
		grades: "Grades 5–8",
		subjects: "Visual Arts, California History",
		duration: "2 class periods",
		objectCount: 7,
	},
];

const GALLERY_LOCATIONS = [
	{ label: "Gallery 10 : Impressionism", count: 12 },
	{ label: "Gallery 11 : 19th-Century French", count: 8 },
	{ label: "Gallery 22 : American Modernism", count: 6 },
	{ label: "Court of Honor : Rodin", count: 14 },
	{ label: "Gallery 6 : European Decorative Arts", count: 22 },
	{
		label: "Gallery 15 : Arts of Africa, Oceania + the Americas",
		count: 18,
	},
];

export default function EducationalResourcesClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const featured = docs.slice(0, 6);

	return (
		<ScopePage id="educational-resources">
			<div className="min-h-screen bg-white">
				{/* Header */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("edu.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("edu.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-700">
							{t("edu.intro")}
						</p>
						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard value="24" label={t("edu.statLessonPlans")} />
							<StatCard value="2,089" label={t("edu.statOnView")} />
							<StatCard value="142" label={t("edu.statEduContent")} />
							<StatCard value="6" label={t("edu.statAudioTours")} />
						</div>
					</Container>
				</WireframeSection>

				{/* Lesson plans */}
				<WireframeSection
					label="Lesson plans"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("edu.lessonPlansHeading")}
						</SectionLabel>
						<div className="flex flex-col border border-gray-300">
							{LESSON_PLANS.map((plan, i) => (
								<button
									key={plan.title}
									type="button"
									className={`flex items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${i > 0 ? "border-t border-gray-200" : ""}`}
								>
									<div className="flex-1">
										<h3 className="font-mono text-card font-medium">
											{plan.title}
										</h3>
										<p className="mt-0.5 font-mono text-meta text-gray-500">
											{plan.subjects}
										</p>
									</div>
									<div className="shrink-0 text-right">
										<p className="font-mono text-meta text-gray-500">
											{plan.grades}
										</p>
										<p className="font-mono text-label text-gray-400">
											{plan.duration} &middot; {plan.objectCount} objects
										</p>
									</div>
								</button>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Gallery location filter */}
				<WireframeSection
					label="Gallery location filter"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("edu.galleryHeading")}
						</SectionLabel>
						<p className="mb-6 font-mono text-meta text-gray-500">
							{t("edu.galleryIntro")}
						</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{GALLERY_LOCATIONS.map((gallery) => (
								<button
									key={gallery.label}
									type="button"
									className="flex items-center justify-between border border-gray-300 px-4 py-3 font-mono text-left transition-colors hover:border-gray-500"
								>
									<span className="text-meta">{gallery.label}</span>
									<span className="text-label text-gray-400">
										{gallery.count} objects
									</span>
								</button>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Content source labelling */}
				<WireframeSection
					label="Content labelling"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("edu.contentLabelHeading")}
						</SectionLabel>
						<p className="mb-4 font-mono text-body text-gray-700">
							{t("edu.contentLabelIntro")}
						</p>
						<div className="flex flex-wrap gap-3">
							<span className="border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-label text-gray-500">
								{t("edu.sourceGalleryLabel")}
							</span>
							<span className="border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-label text-gray-500">
								{t("edu.sourceWebEssay")}
							</span>
							<span className="border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-label text-gray-500">
								{t("edu.sourcePublication")}
							</span>
						</div>
					</Container>
				</WireframeSection>

				{/* AI reading level adaptation */}
				<ScopeMark label="AI reading level">
					<WireframeSection
						label="AI reading level"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("edu.readingLevelHeading")}
							</SectionLabel>
							<p className="mb-4 font-mono text-body text-gray-700">
								{t("edu.readingLevelIntro")}
							</p>
							<div className="border border-gray-300 p-4">
								<p className="mb-2 font-mono text-label font-medium text-gray-500">
									{t("edu.readingLevelLabel")}
								</p>
								<div className="flex gap-2">
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-500"
									>
										Grades 3–5
									</button>
									<button
										type="button"
										className="border border-gray-900 bg-gray-900 px-3 py-1.5 font-mono text-meta text-white"
									>
										Grades 6–8
									</button>
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-500"
									>
										Grades 9–12
									</button>
									<button
										type="button"
										className="border border-gray-300 px-3 py-1.5 font-mono text-meta text-gray-500"
									>
										Original
									</button>
								</div>
								<div className="mt-4 border border-dashed border-gray-200 p-3">
									<span className="font-mono text-meta text-gray-400">
										{t("edu.readingLevelPlaceholder")}
									</span>
								</div>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Objects with educational content */}
				<WireframeSection label="Featured objects" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{t("edu.featuredHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{featured.map((d) => {
								const title = d.title || d.accession_number;
								const artist = d.primary_artist_display ?? d.primary_artist;
								const slug = slugById[d.id];
								return (
									<Link
										key={d.id}
										href={slug ? `/objects/sample/${slug}` : "/objects/sample"}
										className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder label={`[${title}]`} />
										<div className="p-3">
											<h3 className="font-mono text-card font-medium leading-snug">
												{title}
											</h3>
											<p className="mt-0.5 font-mono text-label text-gray-500">
												{artist}
											</p>
											<span className="mt-1.5 inline-block border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-label text-blue-700">
												{t("edu.eduBadge")}
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
