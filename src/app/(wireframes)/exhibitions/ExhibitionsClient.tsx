"use client";

import { Suspense } from "react";
import {
	Breadcrumb,
	Container,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import type { ExhibitionListEntry } from "./page";

function ExhibitionsContent({
	exhibitions,
}: {
	exhibitions: ExhibitionListEntry[];
}) {
	return (
		<ScopePage id="exhibitions">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("exhibitions.label") },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("exhibitions.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("exhibitions.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							{t("exhibitions.intro")}
						</p>
					</Container>
				</WireframeSection>

				<WireframeSection label="Results" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{exhibitions.length}{" "}
							{exhibitions.length === 1 ? "result" : "results"}
						</SectionLabel>
						<p className="font-mono text-meta text-gray-400">
							Not available in the current index.
						</p>
					</Container>
				</WireframeSection>

				<ScopeMark label="Pipeline gap">
					<WireframeSection
						label="Pipeline gap"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-2">Pipeline gap</SectionLabel>
							<p className="font-mono text-meta text-gray-500">
								The served index has no structured exhibition records, only
								pre-formatted{" "}
								<code className="rounded bg-gray-100 px-1 py-0.5">
									exhibition_history_lines
								</code>{" "}
								prose per object. Production needs a dedicated{" "}
								<code className="rounded bg-gray-100 px-1 py-0.5">
									exhibition_documents
								</code>{" "}
								index with curatorial copy, install views, dates parsed to ISO,
								and venue normalised to a controlled vocab.
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}

export default function ExhibitionsClient({
	exhibitions,
}: {
	exhibitions: ExhibitionListEntry[];
}) {
	return (
		<Suspense>
			<ExhibitionsContent exhibitions={exhibitions} />
		</Suspense>
	);
}
