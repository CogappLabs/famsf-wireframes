interface TombstoneLabelProps {
	children: React.ReactNode;
	className?: string;
}

export default function TombstoneLabel({
	children,
	className = "",
}: TombstoneLabelProps) {
	return (
		<span
			className={`font-mono text-label uppercase tracking-[0.08em] text-gray-400 ${className}`}
		>
			{children}
		</span>
	);
}
