"use client";

import Link from "next/link";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	LinkCard,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

export default function ContentPage() {
	return (
		<ScopePage id="content-page">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{ label: t("content.breadcrumbHome"), href: "/" },
							{ label: t("content.title") },
						]}
					/>
				</Container>

				{/* Page header */}
				<WireframeSection
					label="Page header"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<SectionLabel>{t("content.subtitle")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("content.title")}
						</h1>
					</Container>
				</WireframeSection>

				{/* Body + Sidebar */}
				<Container className="py-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
						{/* Main body */}
						<WireframeSection label="Body">
							<section className="mb-8">
								<SectionLabel className="mb-4">
									{t("content.introHeading")}
								</SectionLabel>
								<ImagePlaceholder
									aspect="16/9"
									label="[Overview image — 16:9]"
									className="mb-4 border border-gray-300"
								/>
								<p className="font-mono text-body text-gray-600">
									{t("content.introText")}
								</p>
							</section>

							<section className="mb-8">
								<h2 className="mb-4 font-mono text-section font-medium">
									{t("content.bodyHeading")}
								</h2>
								<div className="space-y-4 font-mono text-body text-gray-600">
									<p>{t("content.bodyP1")}</p>
									<p>{t("content.bodyP2")}</p>
									<p>{t("content.bodyP3")}</p>
								</div>
							</section>

							<ImagePlaceholder
								aspect="16/9"
								label="[Supporting image — 16:9]"
								className="border border-gray-300"
							/>
						</WireframeSection>

						{/* Sidebar */}
						<WireframeSection label="Sidebar">
							<aside>
								<SectionLabel className="mb-4">
									{t("content.sidebarHeading")}
								</SectionLabel>
								<div className="flex flex-col gap-3">
									<LinkCard
										title={t("content.sidebarLink1Title")}
										description={t("content.sidebarLink1Desc")}
										href="/example"
									/>
									<LinkCard
										title={t("content.sidebarLink2Title")}
										description={t("content.sidebarLink2Desc")}
										href="/"
									/>
								</div>
							</aside>
						</WireframeSection>
					</div>
				</Container>

				{/* Back link */}
				<Container className="border-t border-gray-200 py-6">
					<Link
						href="/"
						className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
					>
						&larr; {t("content.backLink")}
					</Link>
				</Container>
			</div>
		</ScopePage>
	);
}
