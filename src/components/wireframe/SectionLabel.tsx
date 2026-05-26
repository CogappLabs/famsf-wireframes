interface SectionLabelProps {
	children: React.ReactNode;
	className?: string;
}

export default function SectionLabel({
	children,
	className = "",
}: SectionLabelProps) {
	return (
		<p
			className={`font-mono text-label tracking-[0.04em] text-gray-500 ${className}`}
		>
			{children}
		</p>
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
