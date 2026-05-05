"use client";

import { useEffect, useRef, useState } from "react";
import CollectionAutocomplete from "./CollectionAutocomplete";

/**
 * Floating collection search — fixed bottom-right pill on object pages.
 * Collapsed: icon button. Expanded: autocomplete combobox.
 *
 * Addresses the "embedded search bar on object detail" stakeholder ask
 * (European Paintings + American Art interviews) — most visitors arrive
 * via Google to a specific object page and need to pivot search without
 * scrolling back to the header.
 */
export default function FloatingSearch() {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		function onClickOutside(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		function onEscape(e: KeyboardEvent) {
			if (e.key === "Escape") setIsOpen(false);
		}
		document.addEventListener("mousedown", onClickOutside);
		document.addEventListener("keydown", onEscape);
		return () => {
			document.removeEventListener("mousedown", onClickOutside);
			document.removeEventListener("keydown", onEscape);
		};
	}, [isOpen]);

	return (
		<div
			ref={rootRef}
			className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
		>
			{isOpen && (
				<div className="w-[min(28rem,calc(100vw-3rem))] border border-gray-300 bg-white shadow-lg">
					<CollectionAutocomplete placeholder="Search the collection…" />
				</div>
			)}
			<button
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				aria-expanded={isOpen}
				aria-label={
					isOpen ? "Close collection search" : "Search the collection"
				}
				className="flex h-12 w-12 items-center justify-center border border-gray-400 bg-white font-mono text-body shadow-md transition-colors hover:bg-gray-100"
			>
				{isOpen ? "×" : "⌕"}
			</button>
		</div>
	);
}
