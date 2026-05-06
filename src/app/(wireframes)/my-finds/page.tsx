"use client";

import Link from "next/link";
import {
	CategoryBadge,
	Container,
	ImagePlaceholder,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { objects } from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const SAVED_OBJECTS = objects.slice(0, 5);
const MORE_LIKE = objects.slice(5, 11).map((obj, i) => ({
	obj,
	reason: [
		"same artist",
		"same period",
		"same medium",
		"same department",
		"same culture",
		"frequently saved together",
	][i % 6],
}));

export default function MyFindsPage() {
	return (
		<ScopePage id="my-finds">
			<div className="min-h-screen bg-white">
				{/* Header */}
				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel>{t("finds.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("finds.heading")}
						</h1>
						<p className="mt-4 font-mono text-body text-gray-600">
							{t("finds.intro")}
						</p>
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								className="border border-gray-900 bg-gray-900 px-4 py-2 font-mono text-meta text-white transition-colors hover:bg-gray-700"
							>
								{t("finds.shareList")}
							</button>
							<button
								type="button"
								className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600 transition-colors hover:border-gray-500"
							>
								{t("finds.downloadPDF")}
							</button>
							<button
								type="button"
								className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-600 transition-colors hover:border-gray-500"
							>
								{t("finds.copyCitations")}
							</button>
						</div>
					</Container>
				</WireframeSection>

				{/* Shareable URL */}
				<WireframeSection
					label="Shareable URL"
					className="border-b border-gray-200 py-4"
				>
					<Container size="md">
						<div className="flex items-center gap-3">
							<span className="font-mono text-label text-gray-400">
								{t("finds.shareLabel")}
							</span>
							<span className="flex-1 border border-gray-200 bg-gray-50 px-3 py-1.5 font-mono text-label text-gray-500">
								collection.famsf.org/my-finds?ids=100001,169787,109902,80783,100002
							</span>
							<button
								type="button"
								className="font-mono text-label text-gray-500 underline"
							>
								{t("shared.copy")}
							</button>
						</div>
					</Container>
				</WireframeSection>

				{/* Saved objects */}
				<WireframeSection
					label="Saved objects"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<div className="mb-4 flex items-center justify-between">
							<SectionLabel>{SAVED_OBJECTS.length} saved objects</SectionLabel>
							<button
								type="button"
								className="font-mono text-label text-gray-500 underline"
							>
								{t("shared.clearAll")}
							</button>
						</div>
						<div className="flex flex-col border border-gray-300">
							{SAVED_OBJECTS.map((work, i) => (
								<div
									key={work.id}
									className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-gray-200" : ""}`}
								>
									<div className="w-16 shrink-0">
										<ImagePlaceholder aspect="1/1" label="[img]" />
									</div>
									<div className="flex-1">
										<Link
											href={`/object-detail?id=${work.id}`}
											className="font-mono text-body font-medium underline decoration-gray-300 hover:decoration-gray-600"
										>
											{work.title}
										</Link>
										<p className="mt-0.5 font-mono text-meta text-gray-500">
											{work.artist}, {work.date}
										</p>
										<p className="font-mono text-label text-gray-400">
											{work.department} &middot; {work.accession}
										</p>
									</div>
									<div className="flex shrink-0 gap-2">
										<Link
											href={`/seed-journey?seed=${work.id}`}
											className="font-mono text-label text-gray-400 underline hover:text-gray-700"
										>
											Start a journey
										</Link>
										<button
											type="button"
											className="font-mono text-label text-gray-400 hover:text-gray-600"
										>
											{t("shared.notes")}
										</button>
										<button
											type="button"
											className="font-mono text-label text-gray-400 hover:text-red-500"
										>
											{t("shared.remove")}
										</button>
									</div>
								</div>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Start a journey CTA */}
				<WireframeSection
					label="Start a journey CTA"
					className="border-b border-gray-300 bg-gray-50 py-8"
				>
					<Container size="md">
						<SectionLabel>Discover more</SectionLabel>
						<h2 className="mt-2 font-mono text-section font-semibold">
							Turn a saved object into a journey
						</h2>
						<p className="mt-2 font-mono text-meta text-gray-600">
							Pick one of your finds as a starting point. Choose a direction
							(same artist, period, medium…) and follow it through related
							works. Share the path with a colleague.
						</p>
						<Link
							href="/seed-journey"
							className="mt-4 inline-block border border-gray-900 bg-gray-900 px-4 py-2 font-mono text-meta text-white transition-colors hover:bg-gray-700"
						>
							Start a seed journey →
						</Link>
					</Container>
				</WireframeSection>

				{/* More like your finds */}
				<WireframeSection
					label="More like your finds"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<SectionLabel>{t("finds.moreLikeHeading")}</SectionLabel>
						<p className="mt-2 mb-4 font-mono text-meta text-gray-600">
							{t("finds.moreLikeIntro")}
						</p>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{MORE_LIKE.map(({ obj, reason }) => (
								<Link
									key={obj.id}
									href={`/object-detail?id=${obj.id}`}
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
											{t("finds.moreLikeReason")} {reason}
										</CategoryBadge>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Notes */}
				<WireframeSection label="Notes" className="py-8">
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("finds.notesHeading")}
						</SectionLabel>
						<div className="border border-gray-300 p-4">
							<div className="h-24 border border-dashed border-gray-200">
								<span className="block px-3 py-2 font-mono text-meta text-gray-400">
									[Optional free-text notes field — saved in URL or local
									storage]
								</span>
							</div>
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
