import Link from "next/link";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	WireframeSection,
} from "@/components/wireframe";
import FieldSourceBadge from "@/components/wireframe/FieldSourceBadge";
import {
	type CollectionDocument,
	iiifImageUrl,
} from "@/lib/collection-document";
import { t } from "@/lib/strings";
import type { ImageCaption } from "@/lib/text-format";
import ExternalLink from "../ExternalLink";

type MediaItem = NonNullable<CollectionDocument["media"]>[number];

/** House-style object caption (rule 7): title italic for real titles, roman
 *  for descriptive names. Rendered directly beneath the image. */
function CaptionLine({ caption }: { caption: ImageCaption }) {
	return (
		<p className="font-mono text-meta text-gray-700">
			{caption.pre}
			{caption.title &&
				(caption.titleItalic ? <em>{caption.title}</em> : caption.title)}
			{caption.post}
		</p>
	);
}

/**
 * Object-detail image section: single-image layout or a CSS scroll-snap
 * carousel with a thumbnail strip, plus the hidden-image note, alt-text
 * placeholder, and the (non-functional) image-actions row. Renders nothing
 * when there are no visible images and none were hidden.
 */
export function ImageSection({
	visibleMedia,
	hiddenCount,
	hasAnyImage,
	isPublicDomain,
	caption,
}: {
	visibleMedia: MediaItem[];
	hiddenCount: number;
	hasAnyImage: boolean;
	isPublicDomain: boolean;
	caption: ImageCaption;
}) {
	if (!(hasAnyImage || hiddenCount > 0)) return null;

	return (
		<WireframeSection label="Image" className="border-b border-gray-300 py-8">
			<Container>
				<span id="image" className="sr-only">
					Image
				</span>
				<FieldSourceBadge field="media" block />

				{hasAnyImage && visibleMedia.length === 1 && (
					/* Single image: preserve existing single-image layout */
					<div className="border border-gray-300">
						<div data-splattable data-splat-id="img-0">
							<ImagePlaceholder
								aspect="4/3"
								maxHeight="70vh"
								label={`[IIIF image: image_id ${visibleMedia[0].image_id}]`}
								className="border-0"
							/>
						</div>
						<div className="border-t border-gray-200 px-3 py-2">
							<CaptionLine caption={caption} />
						</div>
						{(visibleMedia[0].media_view ||
							visibleMedia[0].public_caption ||
							visibleMedia[0].credit_line) && (
							<div className="border-t border-gray-200 px-3 py-2">
								{visibleMedia[0].media_view && (
									<p className="font-mono text-label tracking-wide text-gray-500">
										{visibleMedia[0].media_view}
										<FieldSourceBadge field="media[].media_view" />
									</p>
								)}
								{visibleMedia[0].public_caption && (
									<p className="mt-0.5 font-mono text-meta text-gray-700">
										{visibleMedia[0].public_caption}
										<FieldSourceBadge field="media[].public_caption" />
									</p>
								)}
								{visibleMedia[0].credit_line && (
									<p className="mt-0.5 font-mono text-label text-gray-400">
										{visibleMedia[0].credit_line}
										<FieldSourceBadge field="media[].credit_line" />
									</p>
								)}
							</div>
						)}
						<div className="border-t border-gray-200 px-3 py-2">
							<p className="font-mono text-label text-gray-400">
								Live IIIF URL:{" "}
								<ExternalLink
									href={iiifImageUrl(visibleMedia[0].image_id, "!600,600")}
									className="underline decoration-gray-300 hover:decoration-gray-600"
								>
									{iiifImageUrl(visibleMedia[0].image_id, "!600,600")}
								</ExternalLink>
							</p>
						</div>
					</div>
				)}

				{hasAnyImage && visibleMedia.length > 1 && (
					/* Multi-image carousel: CSS scroll-snap, no JS required */
					<div>
						{/* Object caption (rule 7) once, above the per-image detail. */}
						<div className="mb-3 border border-gray-200 px-3 py-2">
							<CaptionLine caption={caption} />
						</div>
						{/* Main scroll container. overscroll-x-contain keeps a horizontal
						    swipe inside the carousel without capturing the page scroll. */}
						<div
							className="relative overflow-x-auto overflow-y-hidden overscroll-x-contain"
							style={{ scrollSnapType: "x mandatory" }}
						>
							<div className="flex">
								{visibleMedia.map((item, i) => {
									const imgUrl = iiifImageUrl(item.image_id, "!600,600");
									return (
										<div
											key={item.image_id}
											id={`image-${i}`}
											className="min-w-full border border-gray-300"
											style={{ scrollSnapAlign: "start" }}
										>
											<div data-splattable data-splat-id={`img-${i}`}>
												<ImagePlaceholder
													aspect="4/3"
													maxHeight="70vh"
													label={`[IIIF image ${i + 1} of ${visibleMedia.length}: image_id ${item.image_id}]`}
													className="border-0"
												/>
											</div>
											<div className="border-t border-gray-200 px-3 py-2">
												<p className="font-mono text-label tracking-wide text-gray-500">
													Image {i + 1} of {visibleMedia.length}
													{item.media_view && <> &middot; {item.media_view}</>}
												</p>
												{item.public_caption && (
													<p className="mt-0.5 font-mono text-meta text-gray-700">
														{item.public_caption}
														<FieldSourceBadge field="media[].public_caption" />
													</p>
												)}
												{item.credit_line && (
													<p className="mt-0.5 font-mono text-label text-gray-400">
														{item.credit_line}
														<FieldSourceBadge field="media[].credit_line" />
													</p>
												)}
												<p className="mt-1 font-mono text-label text-gray-400">
													Live IIIF URL:{" "}
													<ExternalLink
														href={imgUrl}
														className="underline decoration-gray-300 hover:decoration-gray-600"
													>
														{imgUrl}
													</ExternalLink>
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Thumbnail strip: anchor links to each slide */}
						<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
							{visibleMedia.map((item, i) => {
								const thumbUrl = iiifImageUrl(item.image_id, "!200,200");
								return (
									<a
										key={item.image_id}
										href={`#image-${i}`}
										className="flex-shrink-0 border-2 border-gray-300 hover:border-gray-600"
										title={item.media_view ?? `Image ${i + 1}`}
									>
										<div style={{ width: "72px" }}>
											<ImagePlaceholder
												aspect="1/1"
												label={`${i + 1}`}
												className="border-0 text-[10px]"
											/>
										</div>
										<p className="px-1 pb-1 font-mono text-[10px] text-gray-500">
											{thumbUrl.replace(
												"https://famsf.emuseum.com/apis/iiif/image/v2/",
												"…/",
											)}
										</p>
									</a>
								);
							})}
						</div>
					</div>
				)}

				{/* Hidden-image note */}
				{hiddenCount > 0 && (
					<p className="mt-3 font-mono text-label text-gray-400">
						{hiddenCount} image{hiddenCount === 1 ? "" : "s"} hidden: not
						approved for web
					</p>
				)}

				{/* Image actions row [placeholder]: non-functional buttons. */}
				<WireframeSection label="Image actions">
					<div className="mt-3 flex flex-wrap items-center gap-3">
						{isPublicDomain ? (
							<button
								type="button"
								className="border border-gray-300 px-3 py-1.5 font-mono text-label tracking-wide text-gray-500 hover:border-gray-500"
							>
								Download
							</button>
						) : (
							<button
								type="button"
								disabled
								title="In copyright [placeholder]"
								className="cursor-not-allowed border border-gray-200 px-3 py-1.5 font-mono text-label tracking-wide text-gray-400"
							>
								Download (in copyright)
							</button>
						)}
						{/* Image request link: routes to the licensing / image-orders flow.
						    Sits beside the download control per the June 18 layout (a
						    pathway for in-copyright + high-res requests not covered by
						    open-access download). Shown for every work in the wireframe. */}
						<ScopeMark label="Image request">
							<Link
								href="/image-orders"
								className="border border-gray-300 px-3 py-1.5 font-mono text-label tracking-wide text-gray-500 hover:border-gray-500"
							>
								{t("object.requestImage")}
							</Link>
						</ScopeMark>
					</div>
				</WireframeSection>
			</Container>
		</WireframeSection>
	);
}
