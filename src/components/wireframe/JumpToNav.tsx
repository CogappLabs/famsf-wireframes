"use client";

/**
 * Horizontal jump-to navigation for long pages. Renders the sections as a row
 * of pill links that scroll-spy the page: the section currently in view is
 * highlighted, and clicking a pill scrolls to it. The bar sticks to the top of
 * the viewport as the page scrolls, and scrolls horizontally if the pills
 * overflow.
 */

import { useEffect, useRef, useState } from "react";

interface JumpToNavProps {
	items: { label: string; id: string }[];
	className?: string;
}

export default function JumpToNav({ items, className = "" }: JumpToNavProps) {
	const [active, setActive] = useState<string | null>(null);
	const activeRef = useRef<HTMLAnchorElement>(null);

	// Scroll-spy: light up the section nearest the top of the viewport.
	// rootMargin pulls the active band down so a section activates just before
	// its heading hits the very top.
	useEffect(() => {
		const targets = items
			.map((i) => document.getElementById(i.id))
			.filter((el): el is HTMLElement => el != null);
		if (targets.length === 0) return;

		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) visible.add(e.target.id);
					else visible.delete(e.target.id);
				}
				const firstVisible = items.find((i) => visible.has(i.id));
				if (firstVisible) setActive(firstVisible.id);
			},
			{ rootMargin: "-20% 0px -70% 0px", threshold: 0 },
		);
		for (const t of targets) observer.observe(t);
		return () => observer.disconnect();
	}, [items]);

	// Keep the active pill in view within the horizontal bar.
	useEffect(() => {
		activeRef.current?.scrollIntoView({
			block: "nearest",
			inline: "center",
			behavior: "smooth",
		});
	}, []);

	return (
		<nav
			className={`flex gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
			aria-label="Jump to section"
		>
			{items.map((item) => {
				const isActive = active === item.id;
				return (
					<a
						key={item.id}
						ref={isActive ? activeRef : undefined}
						href={`#${item.id}`}
						aria-current={isActive ? "location" : undefined}
						className={`shrink-0 whitespace-nowrap border px-2.5 py-1 font-mono text-label transition-colors ${
							isActive
								? "border-gray-900 bg-gray-900 text-white"
								: "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
						}`}
					>
						{item.label}
					</a>
				);
			})}
		</nav>
	);
}
