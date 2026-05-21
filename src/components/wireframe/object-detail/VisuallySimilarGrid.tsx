/**
 * Visually similar (AI): image-vector kNN match grid. CMA pattern.
 * Distinct from metadata-driven Related Works.
 */

import Link from "next/link";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { CollectionDocument } from "@/lib/collection-document";
import { t } from "@/lib/strings";

export function VisuallySimilarGrid({
	candidates,
	slugById,
}: {
	candidates: CollectionDocument[];
	slugById?: Record<number, string>;
}) {
	if (candidates.length === 0) return null;
	const items = candidates.slice(0, 6);
	return (
		<ScopeMark label="Visually similar (AI)">
			<WireframeSection
				label="Visually similar"
				className="border-t border-gray-300 py-8"
			>
				<Container>
					<SectionLabel className="mb-2">
						{t("object.visuallySimilarHeading")}
					</SectionLabel>
					<p className="mb-4 font-mono text-label text-gray-500">
						{t("object.visuallySimilarHint")}
					</p>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
						{items.map((r, i) => (
							<Link
								key={`vs-${r.id}`}
								href={
									slugById?.[r.id]
										? `/objects/sample/${slugById[r.id]}`
										: "/objects/sample"
								}
								className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
							>
								<ImagePlaceholder label={`[${r.title}]`} />
								<div className="p-2">
									<p className="font-mono text-label text-gray-700">
										{r.title}
									</p>
									<p className="font-mono text-label text-gray-400">
										Match {Math.round(95 - i * 6)}%
									</p>
								</div>
							</Link>
						))}
					</div>
				</Container>
			</WireframeSection>
		</ScopeMark>
	);
}
