"use client";

import Link from "next/link";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const VISITOR_TYPES = [
	{ label: "First-time visitor", desc: "I've never been before" },
	{ label: "Returning visitor", desc: "I know the museums" },
	{
		label: "Educator / school group",
		desc: "Planning a visit with students",
	},
	{
		label: "Researcher",
		desc: "I'm looking for specific works or collections",
	},
	{ label: "Family with children", desc: "Visiting with kids" },
];

const CURATED_PATHS = [
	{
		title: "Highlights in an hour",
		desc: "A quick tour of must-see works across both museums",
		duration: "60 min",
		stops: 12,
		museum: "de Young + Legion of Honor",
	},
	{
		title: "Impressionism at the Legion",
		desc: "Monet, Pissarro, Degas, and the French Impressionists",
		duration: "45 min",
		stops: 8,
		museum: "Legion of Honor",
	},
	{
		title: "Rodin sculpture walk",
		desc: "The Court of Honor and interior Rodin galleries",
		duration: "30 min",
		stops: 6,
		museum: "Legion of Honor",
	},
	{
		title: "Art of Africa, Oceania + the Americas",
		desc: "A journey through three continents of artistic traditions",
		duration: "45 min",
		stops: 10,
		museum: "de Young",
	},
	{
		title: "American art through the centuries",
		desc: "Colonial painting to California modernism",
		duration: "40 min",
		stops: 9,
		museum: "de Young",
	},
	{
		title: "Costume + Textile highlights",
		desc: "Highlights from the rotating textile galleries",
		duration: "30 min",
		stops: 6,
		museum: "de Young",
	},
];

function objectHref(
	doc: CollectionDocument,
	slugById: Record<number, string>,
): string {
	return slugById[doc.id]
		? `/objects/sample/${slugById[doc.id]}`
		: "/objects/sample";
}

export default function VisitPlannerClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const onViewDocs = docs.filter((d) => d.on_view);
	const displayDocs = (onViewDocs.length > 0 ? onViewDocs : docs).slice(0, 4);

	return (
		<ScopePage id="visit-planner">
			<div className="min-h-screen bg-white">
				{/* Header */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel>{t("visit.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("visit.heading")}
						</h1>
						<p className="mt-4 font-mono text-body text-gray-600">
							{t("visit.intro")}
						</p>
					</Container>
				</WireframeSection>

				{/* Gallery filter callout (post-MVP) */}
				<ScopeMark label="Gallery filter callout">
					<WireframeSection
						label="Gallery filter callout"
						className="border-b border-gray-300 py-6"
					>
						<Container size="md">
							<div className="flex items-start gap-3 border border-blue-200 bg-blue-50 px-4 py-3">
								<span className="font-mono text-meta font-bold text-blue-900">
									&rarr;
								</span>
								<div className="flex-1">
									<p className="font-mono text-meta text-blue-900">
										{t("visit.galleryFilterCallout")}
									</p>
									<a
										href="/search-results"
										className="mt-1 inline-block font-mono text-label tracking-wide text-blue-700 underline"
									>
										Browse galleries &rarr;
									</a>
								</div>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Concierge input */}
				<ScopeMark label="Concierge input">
					<WireframeSection
						label="Concierge"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("visit.tellUsHeading")}
							</SectionLabel>

							{/* Visitor type */}
							<p className="mb-3 font-mono text-meta font-medium text-gray-700">
								{t("visit.iAmA")}
							</p>
							<div className="mb-6 flex flex-wrap gap-2">
								{VISITOR_TYPES.map((type) => (
									<button
										key={type.label}
										type="button"
										className="border border-gray-300 px-3 py-2 font-mono text-meta text-gray-600 transition-colors hover:border-gray-500 hover:bg-gray-50"
									>
										{type.label}
									</button>
								))}
							</div>

							{/* Interests */}
							<p className="mb-3 font-mono text-meta font-medium text-gray-700">
								{t("visit.interestedIn")}
							</p>
							<div className="mb-6 border border-gray-300 px-4 py-3">
								<span className="font-mono text-body text-gray-400">
									{t("visit.interestsPlaceholder")}
								</span>
							</div>

							{/* Time available */}
							<p className="mb-3 font-mono text-meta font-medium text-gray-700">
								{t("visit.iHave")}
							</p>
							<div className="mb-6 flex gap-2">
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.time30m")}
								</button>
								<button
									type="button"
									className="border border-gray-900 bg-gray-900 px-4 py-2 font-mono text-meta text-white"
								>
									{t("visit.time1h")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.time2h")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.timeHalfDay")}
								</button>
							</div>

							{/* Museum */}
							<p className="mb-3 font-mono text-meta font-medium text-gray-700">
								{t("visit.visiting")}
							</p>
							<div className="mb-6 flex gap-2">
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.museumDeYoung")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.museumLegion")}
								</button>
								<button
									type="button"
									className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600"
								>
									{t("visit.museumBoth")}
								</button>
							</div>

							<button
								type="button"
								className="border border-gray-900 bg-gray-900 px-6 py-3 font-mono text-body text-white transition-colors hover:bg-gray-700"
							>
								{t("visit.buildPlan")}
							</button>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Generated plan preview */}
				<ScopeMark label="Generated plan">
					<WireframeSection
						label="Generated plan"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("visit.suggestedPath")}
							</SectionLabel>
							<div className="flex h-48 items-center justify-center border border-dashed border-gray-300">
								<span className="font-mono text-meta text-gray-400">
									{t("visit.generatedPlaceholder")}
								</span>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Pre-made curated paths */}
				<WireframeSection
					label="Curated paths"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("visit.curatedHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{CURATED_PATHS.map((path) => (
								<button
									key={path.title}
									type="button"
									className="flex flex-col border border-gray-300 p-5 text-left transition-colors hover:border-gray-500"
								>
									<h3 className="font-mono text-card font-medium">
										{path.title}
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										{path.desc}
									</p>
									<div className="mt-3 flex gap-3">
										<span className="font-mono text-label text-gray-400">
											{path.duration}
										</span>
										<span className="font-mono text-label text-gray-400">
											{path.stops} stops
										</span>
										<span className="font-mono text-label text-gray-400">
											{path.museum}
										</span>
									</div>
								</button>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Currently on view */}
				<WireframeSection label="On view" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{t("visit.onViewHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							{displayDocs.map((doc) => (
								<Link
									key={doc.id}
									href={objectHref(doc, slugById)}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder
										label={`[${doc.title || doc.accession_number}]`}
									/>
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{doc.title || doc.accession_number}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{doc.location_string ??
												doc.location_room ??
												doc.department ??
												""}
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
