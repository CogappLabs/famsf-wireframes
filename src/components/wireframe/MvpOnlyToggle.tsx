"use client";

import { useScope } from "@/providers/ScopeProvider";

/**
 * Toggles between the default MVP-only review view (post-MVP sections hidden)
 * and the full page. Active (highlighted) means everything is shown.
 */
export default function MvpOnlyToggle() {
	const { mvpOnly, setMvpOnly } = useScope();
	const showingAll = !mvpOnly;
	return (
		<button
			type="button"
			onClick={() => setMvpOnly(!mvpOnly)}
			title="Show post-MVP sections as well as the Phase 1 build"
			className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-label tracking-[0.08em] transition-colors ${
				showingAll
					? "border-emerald-400 bg-emerald-50 text-emerald-700"
					: "border-gray-300 text-gray-400 hover:border-gray-400"
			}`}
		>
			<span
				className={`inline-block h-2 w-2 border ${
					showingAll ? "border-emerald-500 bg-emerald-500" : "border-gray-400"
				}`}
			/>
			Show post-MVP
		</button>
	);
}
