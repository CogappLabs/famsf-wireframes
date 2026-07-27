"use client";

import { Suspense } from "react";
import {
	Breadcrumb,
	Container,
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
	// The served index has no structured exhibition data, so `exhibitions`
	// and `docs` are always empty; kept as props so the page shape can pick
	// this data back up if a future pipeline change restores it.
	void docs;
	void slugById;

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
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("exhibition.label")}
						</h1>
						<p className="mt-4 font-mono text-body text-gray-500">
							Not available in the current index.
						</p>
						<p className="mt-2 font-mono text-meta text-gray-400">
							{exhibitions.length === 0 &&
								"The served index has no structured exhibition records, only pre-formatted exhibition_history_lines prose per object."}
						</p>
					</Container>
				</WireframeSection>
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
