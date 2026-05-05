"use client";

import Link from "next/link";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const PORTFOLIO_CHILDREN = [
	{ id: "plate-1", title: "Plate 1: The Creation", page: "1 of 24" },
	{ id: "plate-2", title: "Plate 2: The Garden of Eden", page: "2 of 24" },
	{ id: "plate-3", title: "Plate 3: The Expulsion", page: "3 of 24" },
	{ id: "plate-4", title: "Plate 4: Cain and Abel", page: "4 of 24" },
	{ id: "plate-5", title: "Plate 5: The Flood", page: "5 of 24" },
	{ id: "plate-6", title: "Plate 6: Noah\u2019s Ark", page: "6 of 24" },
	{
		id: "plate-7",
		title: "Plate 7: The Tower of Babel",
		page: "7 of 24",
	},
	{
		id: "plate-8",
		title: "Plate 8: Abraham and the Angels",
		page: "8 of 24",
	},
];

export default function PortfolioDetailPage() {
	return (
		<ScopePage id="portfolio-detail">
			<div className="min-h-screen bg-white">
				{/* Breadcrumb */}
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{ label: "Collection", href: "/collection-landing" },
							{
								label: "Achenbach Foundation for Graphic Arts",
								href: "/collection-area",
							},
							{ label: "La Sainte Bible (portfolio)" },
						]}
					/>
				</Container>

				{/* Parent record header */}
				<WireframeSection
					label="Parent record"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
							<div>
								<ImagePlaceholder
									aspect="4/3"
									label="[Portfolio cover / representative image]"
									className="border border-gray-300"
								/>
							</div>
							<div>
								<SectionLabel className="mb-2">
									{t("portfolio.plateCount")}
								</SectionLabel>
								<h1 className="font-mono text-page font-semibold leading-[1.15] tracking-tight">
									La Sainte Bible
								</h1>
								<Link
									href="/artist-page?name=Gustave+Dor%C3%A9"
									className="mt-1 block font-mono text-body text-gray-600 underline decoration-gray-300 hover:decoration-gray-600"
								>
									Gustave Dor\u00e9
								</Link>
								<p className="font-mono text-meta text-gray-500">
									French, 1832\u20131883
								</p>

								<div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6">
									<div>
										<span className="font-mono text-label uppercase tracking-wide text-gray-400">
											{t("object.fieldDate")}
										</span>
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											1866
										</p>
									</div>
									<div>
										<span className="font-mono text-label uppercase tracking-wide text-gray-400">
											{t("object.fieldMedium")}
										</span>
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											Wood engravings on paper
										</p>
									</div>
									<div>
										<span className="font-mono text-label uppercase tracking-wide text-gray-400">
											{t("object.fieldAccession")}
										</span>
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											1963.30.1a-x
										</p>
									</div>
									<div>
										<span className="font-mono text-label uppercase tracking-wide text-gray-400">
											{t("object.fieldDepartment")}
										</span>
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											Achenbach Foundation for Graphic Arts
										</p>
									</div>
									<div>
										<span className="font-mono text-label uppercase tracking-wide text-gray-400">
											{t("object.fieldCreditLine")}
										</span>
										<p className="mt-0.5 font-mono text-meta text-gray-700">
											Museum purchase
										</p>
									</div>
								</div>
							</div>
						</div>
					</Container>
				</WireframeSection>

				{/* Child records — sequential pages */}
				<WireframeSection
					label="Child records"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-6 flex items-center justify-between">
							<SectionLabel>{t("portfolio.childrenHeading")}</SectionLabel>
							<span className="font-mono text-meta text-gray-400">
								24 plates &middot; showing 1\u20138
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{PORTFOLIO_CHILDREN.map((child) => (
								<button
									key={child.id}
									type="button"
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${child.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-meta font-medium leading-snug">
											{child.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-400">
											{child.page}
										</p>
									</div>
								</button>
							))}
						</div>
						<div className="mt-6 text-center">
							<button
								type="button"
								className="border border-gray-300 px-6 py-2 font-mono text-body text-gray-600 transition-colors hover:border-gray-500"
							>
								{t("portfolio.viewAllPlates")}
							</button>
						</div>
					</Container>
				</WireframeSection>

				{/* Sequential browser */}
				<WireframeSection
					label="Sequential browser"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("portfolio.sequentialHeading")}
						</SectionLabel>
						<div className="flex items-center gap-4">
							<button
								type="button"
								className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-500"
							>
								&larr; {t("portfolio.prevPlate")}
							</button>
							<div className="flex-1">
								<ImagePlaceholder
									aspect="3/4"
									label="[Plate 1: The Creation \u2014 high-res zoomable]"
									className="border border-gray-300"
								/>
							</div>
							<button
								type="button"
								className="border border-gray-300 px-4 py-2 font-mono text-meta text-gray-500"
							>
								{t("portfolio.nextPlate")} &rarr;
							</button>
						</div>
						<p className="mt-3 text-center font-mono text-meta text-gray-500">
							Plate 1 of 24: The Creation
						</p>
					</Container>
				</WireframeSection>

				{/* Related portfolios */}
				<WireframeSection label="Related works" className="py-12">
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("portfolio.relatedHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<button
								type="button"
								className="flex gap-4 border border-gray-300 p-4 text-left transition-colors hover:border-gray-500"
							>
								<div className="w-16 shrink-0">
									<ImagePlaceholder aspect="1/1" label="[img]" />
								</div>
								<div>
									<h3 className="font-mono text-body font-medium">
										L&apos;Enfer de Dante
									</h3>
									<p className="mt-0.5 font-mono text-meta text-gray-500">
										Gustave Dor\u00e9, 1861
									</p>
									<p className="font-mono text-label text-gray-400">
										Portfolio &middot; 75 plates
									</p>
								</div>
							</button>
							<button
								type="button"
								className="flex gap-4 border border-gray-300 p-4 text-left transition-colors hover:border-gray-500"
							>
								<div className="w-16 shrink-0">
									<ImagePlaceholder aspect="1/1" label="[img]" />
								</div>
								<div>
									<h3 className="font-mono text-body font-medium">
										London: A Pilgrimage
									</h3>
									<p className="mt-0.5 font-mono text-meta text-gray-500">
										Gustave Dor\u00e9, 1872
									</p>
									<p className="font-mono text-label text-gray-400">
										Portfolio &middot; 180 plates
									</p>
								</div>
							</button>
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
