"use client";

import { useScope } from "@/providers/ScopeProvider";

export default function ScopeToggle() {
	const { showScope, setShowScope } = useScope();
	return (
		<button
			type="button"
			onClick={() => setShowScope(!showScope)}
			className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-label uppercase tracking-[0.08em] transition-colors ${
				showScope
					? "border-emerald-400 bg-emerald-50 text-emerald-700"
					: "border-gray-300 text-gray-400 hover:border-gray-400"
			}`}
		>
			<span
				className={`inline-block h-2 w-2 border ${
					showScope ? "border-emerald-500 bg-emerald-500" : "border-gray-400"
				}`}
			/>
			Scope
		</button>
	);
}
