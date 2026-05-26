"use client";

import { useState } from "react";

export default function CitationBlock({ citation }: { citation: string }) {
	const [copied, setCopied] = useState(false);

	const onCopy = () => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			void navigator.clipboard.writeText(citation).then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			});
		}
	};

	return (
		<div className="flex items-start gap-3 border border-gray-300 bg-gray-50 p-3">
			<p className="flex-1 whitespace-pre-line font-mono text-meta text-gray-700">
				{citation}
			</p>
			<button
				type="button"
				onClick={onCopy}
				aria-label="Copy citation to clipboard"
				className="shrink-0 border border-gray-400 bg-white px-2 py-1 font-mono text-label uppercase tracking-wide text-gray-700 hover:border-gray-700 hover:bg-gray-100"
			>
				{copied ? "Copied" : "Copy"}
			</button>
		</div>
	);
}
