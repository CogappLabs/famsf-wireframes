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
import type { SampleObject } from "@/lib/sample-data";
import { t } from "@/lib/strings";

type Mode = "artist" | "medium" | "period" | "gallery";

const TABS: ReadonlyArray<readonly [Mode, string]> = [
	["artist", "object.relatedByArtist"],
	["medium", "object.relatedByMedium"],
	["period", "object.relatedByPeriod"],
	["gallery", "object.relatedBySameGallery"],
];

export function RelatedWorksSection({ related }: { related: SampleObject[] }) {
	const [mode, setMode] = useState<Mode>("artist");
	if (related.length === 0) return null;
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
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{related.map((r) => (
						<Link
							key={`${mode}-${r.id}`}
							href={`/object-detail?id=${r.id}`}
							className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
						>
							<ImagePlaceholder label={`[${r.title}]`} />
							<div className="p-3">
								<h3 className="font-mono text-meta font-medium leading-snug">
									{r.title}
								</h3>
								<p className="mt-0.5 font-mono text-label text-gray-500">
									{r.artist}, {r.date}
								</p>
								<p className="mt-0.5 font-mono text-label uppercase tracking-wide text-gray-400">
									{mode === "artist"
										? t("object.relatedSameArtist")
										: mode === "medium"
											? r.medium
											: mode === "period"
												? r.date
												: (r.gallery ?? "–")}
								</p>
							</div>
						</Link>
					))}
				</div>
			</Container>
		</WireframeSection>
	);
}
