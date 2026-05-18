"use client";

import { useFieldDebug } from "@/providers/FieldDebugProvider";

/**
 * Toggle button for the "Show source" field-debug mode.
 * Renders in the wireframe layout header alongside ScopeToggle.
 */
export default function FieldDebugToggle() {
	const { showFieldDebug, setShowFieldDebug } = useFieldDebug();
	return (
		<button
			type="button"
			onClick={() => setShowFieldDebug(!showFieldDebug)}
			className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-label uppercase tracking-[0.08em] transition-colors ${
				showFieldDebug
					? "border-violet-400 bg-violet-50 text-violet-700"
					: "border-gray-300 text-gray-400 hover:border-gray-400"
			}`}
		>
			<span
				className={`inline-block h-2 w-2 border ${
					showFieldDebug ? "border-violet-500 bg-violet-500" : "border-gray-400"
				}`}
			/>
			Source
		</button>
	);
}
