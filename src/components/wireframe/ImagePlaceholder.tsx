interface ImagePlaceholderProps {
	label?: string;
	aspect?: string;
	className?: string;
}

export default function ImagePlaceholder({
	label = "[Image]",
	aspect = "4/3",
	className = "",
}: ImagePlaceholderProps) {
	return (
		<div
			className={`flex items-center justify-center bg-gray-200 ${className}`}
			style={{ aspectRatio: aspect }}
		>
			<span className="font-mono text-body text-gray-500">{label}</span>
		</div>
	);
}
