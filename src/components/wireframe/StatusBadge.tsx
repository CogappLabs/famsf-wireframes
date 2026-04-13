import { type ReviewStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/data";

export function StatusBadge({ status }: { status: ReviewStatus }) {
	return (
		<span
			className={`inline-block border px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.08em] ${STATUS_STYLES[status]}`}
		>
			{STATUS_LABELS[status]}
		</span>
	);
}

export function MvpBadge() {
	return (
		<span className="inline-block border border-emerald-400 bg-emerald-50 px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-emerald-700">
			MVP
		</span>
	);
}
