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
	getObject,
	getParentRecord,
	type ParentRecord,
	parentRecords,
} from "@/lib/sample-data";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

function ParentRecordContent() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id") ?? parentRecords[0].id;
	const parent: ParentRecord = getParentRecord(id) ?? parentRecords[0];
	const children = parent.childIds
		.map((cid) => getObject(cid))
		.filter((o): o is NonNullable<ReturnType<typeof getObject>> => !!o);

	return (
		<ScopePage id="parent-record">
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("parent.label") },
							{ label: parent.title },
						]}
					/>
				</Container>

				{/* Header */}
				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>
							{t("parent.label")} &middot; {parent.type}
						</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{parent.title}
						</h1>
						<p className="mt-1 font-mono text-body text-gray-600">
							<Link
								href={`/artist-page?name=${encodeURIComponent(parent.artist)}`}
								className="underline decoration-gray-300 hover:decoration-gray-600"
							>
								{parent.artist}
							</Link>
							{" · "}
							{parent.date}
						</p>

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<StatCard
								value={String(children.length)}
								label="Components in collection"
							/>
							<StatCard value={parent.type} label="Record type" />
							<StatCard value={parent.id} label="Parent ID" />
						</div>
					</Container>
				</WireframeSection>

				{/* Hero image */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<ImagePlaceholder
							aspect="16/9"
							label={`[${parent.title}: composite or hero image]`}
							className="border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* Description / Essay */}
				<ScopeMark label="Essay">
					<WireframeSection
						label="Essay"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">About</SectionLabel>
							<p className="font-mono text-body leading-relaxed text-gray-700">
								{parent.description}
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Components grid */}
				<WireframeSection
					label="Components"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-4 flex items-baseline justify-between">
							<SectionLabel>{t("parent.componentsHeading")}</SectionLabel>
							<span className="font-mono text-label uppercase tracking-wide text-gray-400">
								{children.length} records
							</span>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{children.map((c) => (
								<Link
									key={c.id}
									href={`/object-detail?id=${c.id}`}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${c.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{c.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{c.date} &middot; {c.medium}
										</p>
										<p className="mt-1 font-mono text-label uppercase tracking-wide text-gray-400">
											ID {c.id}
										</p>
									</div>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Related parent records */}
				<ScopeMark label="Related parent records">
					<WireframeSection
						label="Related parent records"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("parent.relatedHeading")}
							</SectionLabel>
							<div className="flex h-24 items-center justify-center border border-dashed border-gray-300">
								<span className="font-mono text-meta text-gray-400">
									[Other ensembles, series, or portfolios by the same artist or
									theme]
								</span>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}

export default function ParentRecordPage() {
	return (
		<Suspense>
			<ParentRecordContent />
		</Suspense>
	);
}
