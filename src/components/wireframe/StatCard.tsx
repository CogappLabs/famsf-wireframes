interface StatCardProps {
	value: string;
	label: string;
	className?: string;
}

export default function StatCard({
	value,
	label,
	className = "",
}: StatCardProps) {
	return (
		<div
			className={`border border-gray-300 px-4 py-3 text-center ${className}`}
		>
			<span className="block font-mono text-section font-medium">{value}</span>
			<span className="font-mono text-meta text-gray-500">{label}</span>
		</div>
	);
}
