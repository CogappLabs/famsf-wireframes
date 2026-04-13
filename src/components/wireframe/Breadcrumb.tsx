import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav className="font-mono text-meta text-gray-500">
			{items.map((item, i) => (
				<span key={item.label}>
					{i > 0 && " / "}
					{item.href ? (
						<Link href={item.href} className="underline hover:text-gray-600">
							{item.label}
						</Link>
					) : (
						<span className="text-gray-600">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
