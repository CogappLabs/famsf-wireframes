interface CategoryBadgeProps {
	children: React.ReactNode;
	className?: string;
}

export default function CategoryBadge({
	children,
	className = "",
}: CategoryBadgeProps) {
	return (
		<span
			className={`inline-block border border-gray-400 bg-gray-100 px-1.5 py-0.5 font-mono text-label uppercase ${className}`}
		>
			{children}
		</span>
	);
}
