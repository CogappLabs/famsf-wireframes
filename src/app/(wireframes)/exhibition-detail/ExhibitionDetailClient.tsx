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
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import type { ExhibitionSummary } from "./page";

function ExhibitionDetailContent({
	exhibitions,
	docs,
	slugById,
}: {
	exhibitions: ExhibitionSummary[];
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const searchParams = useSearchParams();
	const idParam = searchParams.get("id");

	const exh =
		(idParam ? exhibitions.find((e) => String(e.id) === idParam) : undefined) ??
		exhibitions[0];

	const docById = new Map(docs.map((d) => [d.id, d]));
	const works = (exh?.objectIds ?? [])
		.map((oid) => docById.get(oid))
		.filter((d): d is CollectionDocument => d !== undefined);

	const otherExhibitions = exhibitions
		.filter((e) => e.id !== exh?.id)
		.slice(0, 6);

	if (!exh) {
		return (
			<ScopePage id="exhibition-detail">
				<div className="min-h-screen bg-white">
					<Container className="py-12">
						<p className="font-mono text-body text-gray-500">
							No exhibition data found in sample documents.
						</p>
					</Container>
				</div>
			</ScopePage>
		);
	}

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
							{exh.venue} &middot; {exh.date}
						</p>

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<StatCard
								value={String(works.length)}
								label="Works in collection"
							/>
							<StatCard
								value={exh.date.split("–")[0].trim()}
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
							<p className="font-mono text-body leading-relaxed text-gray-400">
								[Curatorial essay for {exh.title}]
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
									href={
										slugById[w.id]
											? `/objects/sample/${slugById[w.id]}`
											: "/objects/sample"
									}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder
										label={`[${w.title ?? w.accession_number}]`}
									/>
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{w.title ?? w.accession_number}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{w.primary_artist_display ?? w.primary_artist},{" "}
											{w.display_date ?? w.display_year ?? ""}
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
								{otherExhibitions.map((e) => (
									<li key={e.id}>
										<Link
											href={`/exhibition-detail?id=${e.id}`}
											className="block border border-gray-300 px-3 py-3 hover:border-gray-500"
										>
											<p className="font-mono text-meta font-medium text-gray-800">
												{e.title}
											</p>
											<p className="mt-0.5 font-mono text-label text-gray-500">
												{e.venue} &middot; {e.date}
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

export default function ExhibitionDetailClient({
	exhibitions,
	docs,
	slugById,
}: {
	exhibitions: ExhibitionSummary[];
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	return (
		<Suspense>
			<ExhibitionDetailContent
				exhibitions={exhibitions}
				docs={docs}
				slugById={slugById}
			/>
		</Suspense>
	);
}
