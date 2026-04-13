"use client";

import { Suspense } from "react";
import {
	CategoryBadge,
	Container,
	ImagePlaceholder,
	LinkCard,
	ScopeMark,
	SectionLabel,
	StatCard,
	usePageVariations,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const FEATURE_VARIATIONS = [
	{ key: "grid", label: "Grid" },
	{ key: "list", label: "List" },
] as const;

const features = [
	{
		titleKey: "example.feature1Title",
		descKey: "example.feature1Desc",
	},
	{
		titleKey: "example.feature2Title",
		descKey: "example.feature2Desc",
	},
	{
		titleKey: "example.feature3Title",
		descKey: "example.feature3Desc",
	},
];

function FeaturesGrid() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{features.map((f) => (
				<div key={f.titleKey} className="border border-gray-300 p-5">
					<h3 className="font-mono text-card font-medium">{t(f.titleKey)}</h3>
					<p className="mt-2 font-mono text-meta text-gray-500">
						{t(f.descKey)}
					</p>
				</div>
			))}
		</div>
	);
}

function FeaturesList() {
	return (
		<div className="flex flex-col border border-gray-300">
			{features.map((f, i) => (
				<div
					key={f.titleKey}
					className={`flex gap-6 px-5 py-4 ${i > 0 ? "border-t border-gray-200" : ""}`}
				>
					<h3 className="w-48 shrink-0 font-mono text-card font-medium">
						{t(f.titleKey)}
					</h3>
					<p className="font-mono text-meta text-gray-500">{t(f.descKey)}</p>
				</div>
			))}
		</div>
	);
}

function ExampleContent() {
	const variation = usePageVariations(FEATURE_VARIATIONS);

	return (
		<ScopePage id="example">
			<div className="min-h-screen bg-white">
				{/* Hero */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("example.subtitle")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("example.heroHeading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							{t("example.heroText")}
						</p>
						<ImagePlaceholder
							aspect="21/9"
							label="[Hero image — 21:9]"
							className="mt-8 border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* Key stats */}
				<WireframeSection
					label="Key stats"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-6">
							{t("example.statsHeading")}
						</SectionLabel>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard
								value={t("example.stat1Value")}
								label={t("example.stat1Label")}
							/>
							<StatCard
								value={t("example.stat2Value")}
								label={t("example.stat2Label")}
							/>
							<StatCard
								value={t("example.stat3Value")}
								label={t("example.stat3Label")}
							/>
							<StatCard
								value={t("example.stat4Value")}
								label={t("example.stat4Label")}
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Features — switches layout based on variation */}
				<WireframeSection label="Features" className="py-12">
					<Container>
						<SectionLabel className="mb-2">
							{t("example.featuresHeading")}
						</SectionLabel>
						<div className="mb-8 flex gap-2">
							<CategoryBadge>Template</CategoryBadge>
							<CategoryBadge>Starter</CategoryBadge>
							<CategoryBadge>MVP</CategoryBadge>
						</div>
						{variation === "list" ? <FeaturesList /> : <FeaturesGrid />}
					</Container>
				</WireframeSection>

				{/* Related links */}
				<WireframeSection
					label="Related links"
					className="border-t border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("example.linksHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<LinkCard
								title={t("example.link1Title")}
								description={t("example.link1Desc")}
								href="/content-page"
								arrow
							/>
							<LinkCard
								title={t("example.link2Title")}
								description={t("example.link2Desc")}
								href="/"
								arrow
							/>
						</div>
					</Container>
				</WireframeSection>

				{/* Contact form — post-MVP with ScopeMark */}
				<WireframeSection
					label="Contact form"
					className="border-t border-gray-300 py-12"
				>
					<Container size="md">
						<ScopeMark label="Contact form">
							<h2 className="mb-4 font-mono text-section font-medium">
								{t("example.contactHeading")}
							</h2>
							<p className="font-mono text-body text-gray-600">
								{t("example.contactText")}
							</p>
							<div className="mt-6 flex h-48 items-center justify-center border border-dashed border-gray-300">
								<span className="font-mono text-meta text-gray-500">
									[Form placeholder]
								</span>
							</div>
						</ScopeMark>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}

export default function ExamplePage() {
	return (
		<Suspense>
			<ExampleContent />
		</Suspense>
	);
}
