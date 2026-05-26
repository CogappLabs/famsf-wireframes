"use client";

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
import { ScopePage } from "@/providers/ScopeProvider";

function objectHref(
	doc: CollectionDocument,
	slugById: Record<number, string>,
): string {
	return slugById[doc.id]
		? `/objects/sample/${slugById[doc.id]}`
		: "/objects/sample";
}

function isInCopyright(doc: CollectionDocument): boolean {
	return !(doc.copyright ?? "").toLowerCase().includes("public domain");
}

export default function ImageOrdersClient({
	docs,
	slugById,
}: {
	docs: CollectionDocument[];
	slugById: Record<number, string>;
}) {
	const cartDocs = docs.filter((d) => isInCopyright(d)).slice(0, 3);

	return (
		<ScopePage id="image-orders">
			<div className="min-h-screen bg-white">
				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel>{t("image-orders.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("image-orders.heading")}
						</h1>
						<p className="mt-3 font-mono text-body text-gray-600">
							{t("image-orders.intro")}
						</p>
					</Container>
				</WireframeSection>

				{/* Cart */}
				<WireframeSection
					label="Cart"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("image-orders.cartHeading")}
						</SectionLabel>
						{cartDocs.length === 0 ? (
							<div className="border border-dashed border-gray-300 px-4 py-6 text-center font-mono text-meta text-gray-500">
								No works in this request. Add works from object detail pages via
								"Request Image".
							</div>
						) : (
							<ul className="flex flex-col gap-3">
								{cartDocs.map((doc) => (
									<li
										key={doc.id}
										className="flex gap-4 border border-gray-300 p-3"
									>
										<div className="w-20 shrink-0">
											<ImagePlaceholder
												aspect="1/1"
												label={`[${doc.title || doc.accession_number}]`}
											/>
										</div>
										<div className="flex-1">
											<Link
												href={objectHref(doc, slugById)}
												className="font-mono text-meta font-medium text-gray-800 underline decoration-gray-300 hover:decoration-gray-600"
											>
												{doc.title || doc.accession_number}
											</Link>
											<p className="mt-0.5 font-mono text-label text-gray-500">
												{doc.primary_artist_display ?? doc.primary_artist}
												{(doc.display_date ?? doc.display_year) && (
													<>, {doc.display_date ?? doc.display_year}</>
												)}
											</p>
											<p className="font-mono text-label text-gray-400">
												{doc.accession_number} &middot;{" "}
												{doc.copyright ?? "Copyright unknown"}
											</p>
										</div>
										<button
											type="button"
											className="font-mono text-label tracking-wide text-gray-500 hover:text-gray-900"
										>
											Remove
										</button>
									</li>
								))}
							</ul>
						)}
					</Container>
				</WireframeSection>

				{/* Request form */}
				<WireframeSection
					label="Request form"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("image-orders.formHeading")}
						</SectionLabel>
						<form className="flex flex-col gap-4">
							<label className="flex flex-col gap-1">
								<span className="font-mono text-label tracking-wide text-gray-500">
									{t("image-orders.fieldUseCase")}
								</span>
								<select className="border border-gray-300 px-2 py-1.5 font-mono text-meta">
									<option>Educational / scholarly use</option>
									<option>Editorial: print or online</option>
									<option>Commercial / advertising</option>
									<option>Personal study (no publication)</option>
								</select>
							</label>
							<label className="flex flex-col gap-1">
								<span className="font-mono text-label tracking-wide text-gray-500">
									{t("image-orders.fieldFormat")}
								</span>
								<select className="border border-gray-300 px-2 py-1.5 font-mono text-meta">
									<option>Web-resolution (1500px)</option>
									<option>Print-resolution (4000px+)</option>
									<option>Print-quality TIFF</option>
								</select>
							</label>
							<label className="flex flex-col gap-1">
								<span className="font-mono text-label tracking-wide text-gray-500">
									{t("image-orders.fieldDeadline")}
								</span>
								<input
									type="date"
									className="border border-gray-300 px-2 py-1.5 font-mono text-meta"
								/>
							</label>
							<label className="flex flex-col gap-1">
								<span className="font-mono text-label tracking-wide text-gray-500">
									{t("image-orders.fieldContact")}
								</span>
								<input
									type="email"
									placeholder="researcher@example.org"
									className="border border-gray-300 px-2 py-1.5 font-mono text-meta"
								/>
							</label>
							<ScopeMark label="Fee waiver hint">
								<p className="border-l-2 border-blue-300 bg-blue-50 px-3 py-2 font-mono text-label text-blue-900">
									{t("image-orders.feeNote")}
								</p>
							</ScopeMark>
							<button
								type="button"
								className="self-start border border-gray-900 bg-gray-900 px-4 py-2 font-mono text-meta text-white hover:bg-gray-700"
							>
								{t("image-orders.submit")}
							</button>
						</form>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
