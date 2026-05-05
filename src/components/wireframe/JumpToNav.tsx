/**
 * Horizontal jump-to navigation bar for long pages.
 * Renders a row of anchor-style links that visually indicate
 * available sections on the page.
 */

interface JumpToNavProps {
	items: { label: string; id: string }[];
	className?: string;
}

export default function JumpToNav({ items, className }: JumpToNavProps) {
	return (
		<nav
			className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}
			aria-label="Jump to section"
		>
			{items.map((item, i) => (
				<span key={item.id} className="flex items-center gap-1">
					{i > 0 && (
						<span className="font-mono text-label text-gray-300">/</span>
					)}
					<a
						href={`#${item.id}`}
						className="font-mono text-label text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-900 hover:decoration-gray-500"
					>
						{item.label}
					</a>
				</span>
			))}
		</nav>
	);
}
