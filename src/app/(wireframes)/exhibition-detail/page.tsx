"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import {
	type ExhibitionRecord,
	exhibitionRecords,
	getExhibitionRecord,
	getObject,
} from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

function ExhibitionDetailContent() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id") ?? exhibitionRecords[0].id;
	const exh: ExhibitionRecord = getExhibitionRecord(id) ?? exhibitionRecords[0];
	const works = exh.objectIds
		.map((oid) => getObject(oid))
		.filter((o): o is NonNullable<ReturnType<typeof getObject>> => !!o);

	return (
		<ScopePage id="exhibition-detail">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("exhibition.label") },
							{ label: exh.title },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("exhibition.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{exh.title}
						</h1>
						<p className="mt-2 font-mono text-body text-gray-600">
							{exh.venue} &middot; {exh.dates}
						</p>
						{exh.curator && (
							<p className="mt-1 font-mono text-meta text-gray-500">
								{t("exhibition.curator")}: {exh.curator}
							</p>
						)}

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<StatCard
								value={String(works.length)}
								label="Works in collection"
							/>
							<StatCard
								value={exh.dates.split("–")[0].trim()}
								label={t("exhibition.dates")}
							/>
							<StatCard value={exh.venue} label={t("exhibition.venue")} />
						</div>
					</Container>
				</WireframeSection>

				<ScopeMark label="Curatorial essay">
					<WireframeSection
						label="Curatorial essay"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("exhibition.essay")}
							</SectionLabel>
							<p className="font-mono text-body leading-relaxed text-gray-700">
								{exh.description}
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>

				<ScopeMark label="Installation views">
					<WireframeSection
						label="Installation views"
						className="border-b border-gray-300 py-8"
					>
						<Container>
							<SectionLabel className="mb-4">
								{t("exhibition.installViews")}
							</SectionLabel>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<ImagePlaceholder
									aspect="3/2"
									label="[Install view 1: gallery overview]"
								/>
								<ImagePlaceholder
									aspect="3/2"
									label="[Install view 2: detail wall]"
								/>
								<ImagePlaceholder
									aspect="3/2"
									label="[Install view 3: entrance]"
								/>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				<WireframeSection
					label="Works in exhibition"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-4">
							{t("exhibition.objectsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{works.map((w) => (
								<Link
									key={w.id}
									href={`/object-detail?id=${w.id}`}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${w.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{w.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{w.artist}, {w.date}
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				<ScopeMark label="Related exhibitions">
					<WireframeSection
						label="Related exhibitions"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("exhibition.relatedHeading")}
							</SectionLabel>
							<ul className="flex flex-col gap-2">
								{exhibitionRecords
									.filter((e) => e.id !== exh.id)
									.map((e) => (
										<li key={e.id}>
											<Link
												href={`/exhibition-detail?id=${e.id}`}
												className="border border-gray-300 px-3 py-3 block hover:border-gray-500"
											>
												<p className="font-mono text-meta font-medium text-gray-800">
													{e.title}
												</p>
												<p className="mt-0.5 font-mono text-label text-gray-500">
													{e.venue} &middot; {e.dates}
												</p>
											</Link>
										</li>
									))}
							</ul>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}

export default function ExhibitionDetailPage() {
	return (
		<Suspense>
			<ExhibitionDetailContent />
		</Suspense>
	);
}
