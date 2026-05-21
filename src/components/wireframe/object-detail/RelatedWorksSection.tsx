/**
 * Related works section: interactive tabs (artist / medium / period / gallery)
 * filtering the rule-based recommendations grid.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import {
	Container,
	ImagePlaceholder,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";

type Mode = "artist" | "medium" | "period" | "gallery";

const TABS: ReadonlyArray<readonly [Mode, string]> = [
	["artist", "object.relatedByArtist"],
	["medium", "object.relatedByMedium"],
	["period", "object.relatedByPeriod"],
	["gallery", "object.relatedBySameGallery"],
];

export function RelatedWorksSection({
	related,
	currentDoc,
	slugById,
}: {
	related: CollectionDocument[];
	currentDoc?: CollectionDocument;
	slugById?: Record<number, string>;
}) {
	const [mode, setMode] = useState<Mode>("artist");
	if (related.length === 0) return null;
	const filtered = currentDoc
		? related.filter((r) => {
				if (mode === "artist")
					return r.primary_artist === currentDoc.primary_artist;
				if (mode === "medium") return r.medium === currentDoc.medium;
				if (mode === "period")
					return r.display_year && currentDoc.display_year
						? r.display_year === currentDoc.display_year
						: r.display_date === currentDoc.display_date;
				if (mode === "gallery") return r.department === currentDoc.department;
				return true;
			})
		: related;
	return (
		<WireframeSection
			label="Related works"
			className="border-t border-gray-300 py-12"
		>
			<Container>
				<SectionLabel className="mb-2">
					<span id="related">{t("object.relatedHeading")}</span>
				</SectionLabel>
				<div className="mb-6 flex flex-wrap gap-2">
					{TABS.map(([key, labelKey]) => (
						<button
							key={key}
							type="button"
							onClick={() => setMode(key)}
							className={
								mode === key
									? "border-2 border-gray-900 bg-gray-100 px-3 py-1 font-mono text-label font-medium uppercase tracking-wide text-gray-900"
									: "border border-gray-300 px-3 py-1 font-mono text-label uppercase tracking-wide text-gray-600 hover:border-gray-500"
							}
						>
							{t(labelKey)}
						</button>
					))}
				</div>
				{filtered.length === 0 && (
					<p className="font-mono text-meta text-gray-500">
						No related works in this view.
					</p>
				)}
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{filtered.map((r) => {
						const artistDisplay = r.primary_artist_display || r.primary_artist;
						const dateDisplay = r.display_date || r.display_year;
						return (
							<Link
								key={`${mode}-${r.id}`}
								href={
									slugById?.[r.id]
										? `/objects/sample/${slugById[r.id]}`
										: "/objects/sample"
								}
								className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
							>
								<ImagePlaceholder label={`[${r.title}]`} />
								<div className="p-3">
									<h3 className="font-mono text-meta font-medium leading-snug">
										{r.title}
									</h3>
									<p className="mt-0.5 font-mono text-label text-gray-500">
										{artistDisplay}, {dateDisplay}
									</p>
									<p className="mt-0.5 font-mono text-label uppercase tracking-wide text-gray-400">
										{mode === "artist"
											? t("object.relatedSameArtist")
											: mode === "medium"
												? r.medium
												: mode === "period"
													? dateDisplay
													: "–"}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</Container>
		</WireframeSection>
	);
}
