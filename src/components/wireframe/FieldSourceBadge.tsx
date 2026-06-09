"use client";

import { FIELD_MAP } from "@/lib/es-tms-field-map";
import {
	useFieldDebug,
	useRegisterFieldBadge,
} from "@/providers/FieldDebugProvider";

interface FieldSourceBadgeProps {
	/** ES field name, e.g. "title" or "constituents[].DisplayName" */
	field: string;
	/** Render as a block element instead of inline (default: inline) */
	block?: boolean;
}

/**
 * Renders a small monospace annotation showing the ES field name and its
 * canonical TMS source. Invisible when the "Show source" debug toggle is off.
 *
 * Usage:
 *   <FieldSourceBadge field="title" />
 *   <FieldSourceBadge field="accession_number" block />
 */
export default function FieldSourceBadge({
	field,
	block = false,
}: FieldSourceBadgeProps) {
	const { showFieldDebug } = useFieldDebug();
	useRegisterFieldBadge();

	if (!showFieldDebug) return null;

	const mapping = FIELD_MAP[field];
	const source = mapping?.source ?? "(see prepare/collection_documents.py)";
	const notes = mapping?.notes;

	const Tag = block ? "div" : "span";

	return (
		<Tag
			className={`border-l-2 border-violet-500 bg-violet-50 pl-1.5 font-mono text-label leading-snug text-violet-900 ${block ? "mt-0.5 block py-0.5" : "ml-1.5 inline-block align-middle"}`}
			title={notes ?? undefined}
		>
			<span className="text-violet-700">ES:</span> {field}{" "}
			<span className="text-violet-700">&#8592;</span>{" "}
			<span className="font-semibold text-violet-900">{source}</span>
			{notes && <span className="ml-1 text-violet-700 italic">({notes})</span>}
		</Tag>
	);
}
