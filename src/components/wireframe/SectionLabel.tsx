interface SectionLabelProps {
	children: React.ReactNode;
	className?: string;
}

export default function SectionLabel({
	children,
	className = "",
}: SectionLabelProps) {
	// Section title. Rendered as a real heading (h2) so each section has a
	// clear, scannable title and a proper document outline (jump-nav targets
	// land on it). Keeps the mono wireframe aesthetic but larger + darker than
	// the old kicker. Use SectionLabelInline for small eyebrow / kicker labels.
	return (
		<h2
			className={`font-mono text-section font-medium tracking-tight text-gray-900 ${className}`}
		>
			{children}
		</h2>
	);
}

export function SectionLabelInline({
	children,
	className = "",
}: SectionLabelProps) {
	return (
		<span
			className={`font-mono text-label tracking-[0.04em] text-gray-500 ${className}`}
		>
			{children}
		</span>
	);
}
