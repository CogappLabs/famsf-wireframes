/**
 * Editorial column — articles, publications, videos cross-linked from
 * the object record. AIC right-column pattern.
 */

import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";

export function EditorialColumn() {
	return (
		<ScopeMark label="Editorial column">
			<WireframeSection
				label="Editorial"
				className="border-t border-gray-300 py-8"
			>
				<Container>
					<SectionLabel className="mb-4">
						{t("object.editorialHeading")}
					</SectionLabel>
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Articles */}
						<div>
							<span className="font-mono text-label uppercase tracking-wide text-gray-400">
								{t("object.editorialArticles")}
							</span>
							<ul className="mt-2 flex flex-col gap-3">
								<li className="border border-gray-300 p-3">
									<p className="font-mono text-meta font-medium text-gray-800">
										The road from Pontoise: Pissarro's plein-air practice
									</p>
									<p className="mt-1 font-mono text-label text-gray-500">
										Magazine &middot; 6 min read
									</p>
								</li>
								<li className="border border-gray-300 p-3">
									<p className="font-mono text-meta font-medium text-gray-800">
										How to look at an Impressionist landscape
									</p>
									<p className="mt-1 font-mono text-label text-gray-500">
										Story &middot; 4 min read
									</p>
								</li>
							</ul>
						</div>

						{/* Publications */}
						<div>
							<span className="font-mono text-label uppercase tracking-wide text-gray-400">
								{t("object.editorialPublications")}
							</span>
							<ul className="mt-2 flex flex-col gap-3">
								<li className="border border-gray-300 p-3">
									<div className="flex items-start gap-3">
										<ImagePlaceholder
											aspect="3/4"
											label="[Cover]"
											className="w-12 shrink-0"
										/>
										<div>
											<p className="font-mono text-meta font-medium text-gray-800">
												Impressionism: Masterworks from FAMSF
											</p>
											<p className="mt-1 font-mono text-label text-gray-500">
												2019 &middot; FAMSF Press
											</p>
											<span className="mt-1 inline-block border border-green-300 bg-green-50 px-1.5 py-0.5 font-mono text-label text-green-700">
												{t("object.editorialFreeDownload")}
											</span>
										</div>
									</div>
								</li>
							</ul>
						</div>

						{/* Videos */}
						<div>
							<span className="font-mono text-label uppercase tracking-wide text-gray-400">
								{t("object.editorialVideos")}
							</span>
							<ul className="mt-2 flex flex-col gap-3">
								<li className="border border-gray-300 p-3">
									<ImagePlaceholder
										aspect="16/9"
										label="[Curator interview thumbnail]"
									/>
									<p className="mt-2 font-mono text-meta font-medium text-gray-800">
										Esther Bell on Pissarro and the Impressionists
									</p>
									<p className="mt-0.5 font-mono text-label text-gray-500">
										Video &middot; 8:42
									</p>
								</li>
							</ul>
						</div>
					</div>
				</Container>
			</WireframeSection>
		</ScopeMark>
	);
}
