interface ImagePlaceholderProps {
	label?: string;
	aspect?: string;
	className?: string;
	/** Cap the rendered height, e.g. "70vh". Without it a full-width box gets
	 *  as tall as its aspect ratio demands, which pushes the rest of a page
	 *  off-screen. */
	maxHeight?: string;
}

export default function ImagePlaceholder({
	label = "[Image]",
	aspect = "4/3",
	className = "",
	maxHeight,
}: ImagePlaceholderProps) {
	return (
		<div
			className={`flex items-center justify-center bg-gray-200 ${className}`}
			style={{ aspectRatio: aspect, maxHeight }}
		>
			<span className="font-mono text-body text-gray-500">{label}</span>
		</div>
	);
}
