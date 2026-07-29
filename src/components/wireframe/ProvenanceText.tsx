import type { ReactNode } from "react";
import type { ProvenanceStructured } from "@/lib/collection-document";

/**
 * Render structured provenance from the pipeline. Each body line is
 * rendered verbatim with inline `[N]` markers converted to superscript
 * anchor links that jump to the matching footnote block.
 *
 * Falls back to plain `whitespace-pre-line` rendering if no structured
 * payload (legacy / unparsed records).
 */

const INLINE_REF = /\[(\d+)\]/g;

function renderWithRefs(
	text: string,
	footnoteNums: Set<number>,
	idPrefix: string,
): ReactNode[] {
	const out: ReactNode[] = [];
	let last = 0;
	let key = 0;
	for (const m of text.matchAll(INLINE_REF)) {
		const idx = m.index ?? 0;
		if (idx > last) out.push(text.slice(last, idx));
		const num = Number(m[1]);
		if (footnoteNums.has(num)) {
			out.push(
				<sup key={`ref-${key++}`}>
					<a
						href={`#${idPrefix}-${num}`}
						className="px-0.5 text-blue-700 no-underline hover:underline"
					>
						[{num}]
					</a>
				</sup>,
			);
		} else {
			out.push(m[0]);
		}
		last = idx + m[0].length;
	}
	if (last < text.length) out.push(text.slice(last));
	return out;
}

export interface ProvenanceTextProps {
	structured?: ProvenanceStructured | null;
	rawFallback?: string;
	idPrefix?: string;
	className?: string;
	bodyClassName?: string;
	footnoteClassName?: string;
}

export default function ProvenanceText({
	structured,
	rawFallback,
	idPrefix = "prov-footnote",
	className,
	bodyClassName = "whitespace-pre-line font-mono text-meta leading-relaxed text-gray-700",
	footnoteClassName = "font-mono text-label leading-relaxed text-gray-500",
}: ProvenanceTextProps) {
	if (!structured) {
		if (!rawFallback) return null;
		return (
			<p className={`${bodyClassName} ${className ?? ""}`}>{rawFallback}</p>
		);
	}
	const footnoteNums = new Set(structured.footnotes.map((f) => f.num));
	const hasFootnotes = structured.footnotes.length > 0;
	// Footnotes are a reference apparatus, so they sit in their own right-hand
	// column rather than interleaved with the lines they annotate.
	return (
		<div
			className={`${hasFootnotes ? "grid gap-x-10 gap-y-4 lg:grid-cols-2 lg:items-start" : ""} ${className ?? ""}`}
		>
			<ol className="marker:text-gray-300 flex list-none flex-col gap-1.5">
				{structured.lines.map((line) => (
					<li
						key={line.order}
						className={`${bodyClassName} ${line.is_uncertain ? "italic text-gray-500" : ""}`}
						title={line.is_uncertain ? "Uncertain provenance entry" : undefined}
					>
						{renderWithRefs(line.text, footnoteNums, idPrefix)}
					</li>
				))}
			</ol>
			{hasFootnotes && (
				<ol className="flex list-none flex-col gap-1.5 border-l border-gray-200 pl-4 lg:mt-0">
					{structured.footnotes.map((f) => (
						<li
							key={f.num}
							id={`${idPrefix}-${f.num}`}
							className={`flex gap-2 target:bg-yellow-50 ${footnoteClassName}`}
						>
							<span className="shrink-0 text-gray-400">[{f.num}]</span>
							<span className="whitespace-pre-line">{f.text}</span>
						</li>
					))}
				</ol>
			)}
		</div>
	);
}
