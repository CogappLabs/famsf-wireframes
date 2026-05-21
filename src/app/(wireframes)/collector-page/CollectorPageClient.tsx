"use client";

import Link from "next/link";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	LinkCard,
	ScopeMark,
	SectionLabel,
	StatCard,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

const RELATED_COLLECTORS = [
	{ name: "M.H. de Young", role: "Founder", works: 842 },
	{ name: "Prentis Cobb Hale", role: "Donor", works: 56 },
	{
		name: "Mildred Anna Williams",
		role: "Benefactor (Williams Collection)",
		works: 124,
	},
];

export default function CollectorPageClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const displayObjects = docs.slice(0, 6);

	return (
		<ScopePage id="collector-page">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("collector.label") },
							{ label: "Alma de Bretteville Spreckels" },
						]}
					/>
				</Container>

				{/* Header */}
				<WireframeSection
					label="Collector header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("collector.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							Alma de Bretteville Spreckels
						</h1>
						<p className="mt-1 font-mono text-body text-gray-500">
							1881&ndash;1968 &middot; Founder, California Palace of the Legion
							of Honor
						</p>

						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
							<StatCard value="312" label={t("collector.statGifted")} />
							<StatCard value="92" label={t("collector.statRodin")} />
							<StatCard value="1924" label={t("collector.statFounded")} />
							<StatCard value="4" label={t("collector.statDepartments")} />
						</div>
					</Container>
				</WireframeSection>

				{/* Biography */}
				<WireframeSection
					label="Biography"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("collector.bioHeading")}
						</SectionLabel>
						<div className="space-y-4 font-mono text-body text-gray-600">
							<p>
								Alma de Bretteville Spreckels was the driving force behind the
								creation of the California Palace of the Legion of Honor, which
								opened in Lincoln Park in 1924. Inspired by the French Pavilion
								at the 1915 Panama-Pacific International Exposition, she
								envisioned a museum dedicated to French art and culture in San
								Francisco.
							</p>
							<p>
								A passionate collector and patron of Auguste Rodin, Spreckels
								built one of the most significant collections of Rodin sculpture
								outside of Paris. Her gifts to the museum include{" "}
								<em>The Thinker</em>, <em>The Three Shades</em>, and dozens of
								other bronzes, marbles, and plasters that form the core of the
								Legion of Honor&apos;s identity.
							</p>
							<p>
								Her legacy extends beyond sculpture: Spreckels also donated
								significant holdings of French decorative arts, paintings, and
								works on paper, connecting the museum to San Francisco&apos;s
								civic aspirations and its enduring cultural ties to France.
							</p>
						</div>
					</Container>
				</WireframeSection>

				{/* Associated objects */}
				<WireframeSection
					label="Associated objects"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-6 flex items-center justify-between">
							<SectionLabel>{t("collector.objectsHeading")}</SectionLabel>
							<Link
								href="/search-results"
								className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
							>
								{t("collector.viewAllObjects")}
							</Link>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{displayObjects.map((d) => {
								const title = d.title || d.accession_number;
								const artist = d.primary_artist_display ?? d.primary_artist;
								const slug = slugById[d.id];
								return (
									<Link
										key={d.id}
										href={slug ? `/objects/sample/${slug}` : "/objects/sample"}
										className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
									>
										<ImagePlaceholder label={`[${title}]`} />
										<div className="p-3">
											<h3 className="font-mono text-meta font-medium leading-snug">
												{title}
											</h3>
											<p className="mt-0.5 font-mono text-label text-gray-500">
												{artist}
											</p>
										</div>
									</Link>
								);
							})}
						</div>
					</Container>
				</WireframeSection>

				{/* San Francisco history connection */}
				<ScopeMark label="Civic history">
					<WireframeSection
						label="Civic history"
						className="border-b border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-4">
								{t("collector.historyHeading")}
							</SectionLabel>
							<ImagePlaceholder
								aspect="21/9"
								label="[Historical photograph : Legion of Honor opening, 1924]"
								className="mb-4 border border-gray-300"
							/>
							<p className="font-mono text-body text-gray-600">
								The California Palace of the Legion of Honor was dedicated on
								Armistice Day, 11 November 1924, as a memorial to the
								Californian soldiers who died in the First World War. Alma
								Spreckels funded its construction and donated the founding
								collection, establishing a permanent home for European art in
								San Francisco.
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Related collectors */}
				<WireframeSection label="Related collectors" className="py-12">
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("collector.relatedHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							{RELATED_COLLECTORS.map((rc) => (
								<LinkCard
									key={rc.name}
									title={rc.name}
									description={`${rc.role} · ${rc.works} objects`}
									href="/collector-page"
									arrow
								/>
							))}
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
