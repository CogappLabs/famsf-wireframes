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
import { formatTitle, normaliseDateRange } from "@/lib/text-format";
import { ScopePage } from "@/providers/ScopeProvider";

function ParentRecordContent({
	docs,
	slugByName,
	slugById,
}: {
	docs: CollectionDocument[];
	slugByName: Record<string, string>;
	slugById: Record<number, string>;
}) {
	const searchParams = useSearchParams();
	const idParam = searchParams.get("id");

	const parentDocs = docs.filter(
		(d) =>
			(d.child_cards?.length ?? 0) > 0 ||
			(d.physical_child_ids?.length ?? 0) > 0 ||
			(d.virtual_child_ids?.length ?? 0) > 0,
	);

	const doc =
		(idParam ? docs.find((d) => String(d.id) === idParam) : undefined) ??
		parentDocs[0] ??
		docs[0];

	const artistName = doc.primary_artist_display ?? doc.primary_artist;
	const artistSlug = slugByName[artistName.toLowerCase()] ?? null;

	const childCards = doc.child_cards ?? [];

	const recordType = doc.is_virtual
		? "Virtual"
		: doc.is_compound
			? "Compound"
			: "Ensemble";

	return (
		<ScopePage id="parent-record">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("parent.label") },
							{ label: formatTitle(doc.title) || doc.accession_number },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>
							{t("parent.label")} &middot; {recordType}
						</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{formatTitle(doc.title) || doc.accession_number}
						</h1>
						<p className="mt-1 font-mono text-body text-gray-600">
							{artistSlug ? (
								<Link
									href={`/constituents/sample/${artistSlug}`}
									className="underline decoration-gray-300 hover:decoration-gray-600"
								>
									{artistName}
								</Link>
							) : (
								<span>{artistName}</span>
							)}
							{" · "}
							{normaliseDateRange(doc.display_date ?? doc.display_year) || ""}
						</p>

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<StatCard
								value={String(childCards.length)}
								label="Components in collection"
							/>
							<StatCard value={recordType} label="Record type" />
							<StatCard value={String(doc.id)} label="Parent ID" />
						</div>
					</Container>
				</WireframeSection>

				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<ImagePlaceholder
							aspect="16/9"
							label={`[${formatTitle(doc.title) || doc.accession_number}: composite or hero image]`}
							className="border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				<ScopeMark label="Essay">
					<WireframeSection
						label="Essay"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">About</SectionLabel>
							<p className="font-mono text-body leading-relaxed text-gray-700">
								{doc.web_text ?? doc.didactic_label ?? (
									<span className="text-gray-400">
										[No description available for this record]
									</span>
								)}
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>

				<WireframeSection
					label="Components"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-4 flex items-baseline justify-between">
							<SectionLabel>{t("parent.componentsHeading")}</SectionLabel>
							<span className="font-mono text-label uppercase tracking-wide text-gray-400">
								{childCards.length} records
							</span>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{childCards.map((c) => (
								<Link
									key={c.id}
									href={
										slugById[c.id]
											? `/objects/sample/${slugById[c.id]}`
											: "/objects/sample"
									}
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder
										label={`[${c.title ?? c.accession_number}]`}
									/>
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{c.title ?? c.accession_number}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{normaliseDateRange(c.display_date) || ""}
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

export default function ParentRecordClient({
	docs,
	slugByName,
	slugById,
}: {
	docs: CollectionDocument[];
	slugByName: Record<string, string>;
	slugById: Record<number, string>;
}) {
	return (
		<Suspense>
			<ParentRecordContent
				docs={docs}
				slugByName={slugByName}
				slugById={slugById}
			/>
		</Suspense>
	);
}
