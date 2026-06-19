"use client";

/**
 * Horizontal jump-to navigation for long pages. Renders the sections as a row
 * of pill links. Clicking a pill smooth-scrolls to its section, offset so the
 * heading clears the sticky bar that overlays it. As the page scrolls, the
 * section currently under the bar is highlighted (scroll-spy). The bar sticks
 * to the top of the viewport and scrolls horizontally if the pills overflow.
 *
 * Scroll-spy picks the LAST target whose top has passed above the bar line, so
 * the highlight tracks the section actually under the bar regardless of section
 * height or whether the items array happens to match DOM order.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface JumpToNavProps {
	items: { label: string; id: string }[];
	className?: string;
	/** Fallback pixels to leave above the target when the bar height cannot be
	 * measured at runtime. Defaults to 64. */
	scrollOffset?: number;
}

export default function JumpToNav({
	items,
	className = "",
	scrollOffset = 64,
}: JumpToNavProps) {
	const [active, setActive] = useState<string | null>(null);
	const navRef = useRef<HTMLElement>(null);
	const activeRef = useRef<HTMLAnchorElement>(null);
	// While a click-scroll animates, the spy would otherwise light whatever
	// section the viewport passes through. Lock the active pill to the clicked
	// target until the smooth scroll settles.
	const lockUntil = useRef(0);
	// Mirror of `active` for use inside the scroll listener without re-binding it.
	const activeIdRef = useRef<string | null>(null);
	activeIdRef.current = active;

	// The bar's own height is the natural scroll offset: a section heading should
	// land just below the pinned bar. Measure it live (the bar is shorter than
	// the left-rail sticky offset), fall back to the prop.
	const barOffset = useCallback(() => {
		const h = navRef.current?.getBoundingClientRect().height;
		// Bar height + a gap so the section heading clears the bar rather than
		// sitting flush against its bottom edge.
		return h ? Math.round(h) + 28 : scrollOffset;
	}, [scrollOffset]);

	// Smooth-scroll to a section, offsetting for the sticky bar that overlays it.
	const scrollToId = useCallback(
		(id: string) => {
			const el = document.getElementById(id);
			if (!el) return;
			const top = el.getBoundingClientRect().top + window.scrollY - barOffset();
			// Lock the highlight to the clicked target for the duration of the
			// smooth scroll (cleared once the spy sees the target settle).
			lockUntil.current = Date.now() + 1000;
			setActive(id);
			window.scrollTo({ top, behavior: "smooth" });
		},
		[barOffset],
	);

	// Scroll-spy: highlight the last section whose top has scrolled above the
	// bar line. Runs on scroll/resize, throttled to one rAF per frame.
	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = barOffset() + 1;
			let current: string | null = null;
			for (const item of items) {
				const el = document.getElementById(item.id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= line) current = item.id;
				else break; // items are in DOM order, so the first one below the line ends it
			}
			const next = current ?? items[0]?.id ?? null;
			// While a click-scroll is animating, only let the spy take over once it
			// agrees with the locked target (i.e. the target has settled under the
			// bar). Otherwise the highlight flickers through intervening sections.
			if (Date.now() < lockUntil.current) {
				if (next === activeIdRef.current) lockUntil.current = 0;
				return;
			}
			setActive(next);
		};
		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [items, barOffset]);

	// Keep the active pill centred in the horizontal bar as the active id changes.
	useEffect(() => {
		if (!active) return;
		activeRef.current?.scrollIntoView({
			block: "nearest",
			inline: "center",
			behavior: "smooth",
		});
	}, [active]);

	return (
		<nav
			ref={navRef}
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
						onClick={(e) => {
							e.preventDefault();
							scrollToId(item.id);
						}}
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
