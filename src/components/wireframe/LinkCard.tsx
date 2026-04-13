import Link from "next/link";

interface LinkCardProps {
	title: string;
	description: string;
	href: string;
	arrow?: boolean;
	className?: string;
}

export default function LinkCard({
	title,
	description,
	href,
	arrow,
	className = "",
}: LinkCardProps) {
	return (
		<Link
			href={href}
			className={`flex flex-col border border-gray-300 p-5 text-left transition-colors hover:border-gray-500 hover:bg-gray-50 ${className}`}
		>
			{arrow ? (
				<div className="flex w-full items-center justify-between">
					<div>
						<span className="font-mono text-card font-medium">{title}</span>
						<span className="mt-1 block font-mono text-meta text-gray-500">
							{description}
						</span>
					</div>
					<span className="ml-4 font-mono text-meta text-gray-500">&rarr;</span>
				</div>
			) : (
				<>
					<span className="font-mono text-card font-medium">{title}</span>
					<span className="mt-1 font-mono text-meta text-gray-500">
						{description}
					</span>
				</>
			)}
		</Link>
	);
}
