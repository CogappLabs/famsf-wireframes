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
			className={`font-mono text-label uppercase tracking-[0.08em] text-gray-500 ${className}`}
		>
			{children}
		</p>
	);
}
