"use client";

import type { ReactNode } from "react";
import { getAnnotation } from "@/lib/scope";
import { useScope, useScopePageId } from "@/providers/ScopeProvider";
import { IssueIcon } from "./IssueIcon";

interface WireframeSectionProps {
	children: ReactNode;
	label: string;
	className?: string;
}

export default function WireframeSection({
	children,
	label,
	className = "",
}: WireframeSectionProps) {
	const { showScope } = useScope();
	const pageId = useScopePageId();
	const entry = getAnnotation(pageId, label);

	if (!showScope || !entry) {
		return <section className={className}>{children}</section>;
	}

	const { mvp, note, issueUrl } = entry;
	const borderClass = mvp ? "border-emerald-400" : "border-gray-300";
	const bgClass = mvp
		? "border-emerald-400 bg-emerald-50 text-emerald-700"
		: "border-gray-300 bg-white text-gray-400";
	const textClass = mvp ? "text-emerald-700" : "text-gray-400";

	return (
		<section className={`relative ${className}`}>
			<div
				className={`pointer-events-none absolute inset-0 z-40 border-2 ${
					mvp ? "border-emerald-400" : `${borderClass} bg-gray-100/40`
				}`}
			/>
			<span
				className={`absolute top-2 right-2 z-50 flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.08em] ${bgClass}`}
			>
				<span>
					{mvp ? "MVP" : "Post-MVP"} — {label}
				</span>
				{note && (
					<span className="normal-case tracking-normal opacity-70">
						· {note}
					</span>
				)}
				{issueUrl && (
					<a
						href={issueUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`pointer-events-auto flex items-center hover:opacity-70 ${textClass}`}
						title="Open in issue tracker"
					>
						<IssueIcon />
					</a>
				)}
			</span>
			{children}
		</section>
	);
}

interface ScopeMarkProps {
	children: ReactNode;
	label: string;
}

export function ScopeMark({ children, label }: ScopeMarkProps) {
	const { showScope } = useScope();
	const pageId = useScopePageId();
	const entry = getAnnotation(pageId, label);

	if (!showScope || !entry) return <>{children}</>;

	const { mvp, note, issueUrl } = entry;
	const barColor = mvp ? "bg-emerald-400" : "bg-orange-300";
	const textClass = mvp ? "text-emerald-700" : "text-orange-500";

	return (
		<div className="relative py-1 pl-3">
			<div className={`absolute top-0 bottom-0 left-0 w-0.5 ${barColor}`} />
			<span
				className={`mb-1 flex items-center gap-1.5 font-mono text-label ${textClass}`}
			>
				<span className="uppercase tracking-[0.08em]">
					{mvp ? "MVP" : "Post-MVP"} — {label}
				</span>
				{note && <span className="opacity-70">· {note}</span>}
				{issueUrl && (
					<a
						href={issueUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center hover:opacity-70 ${textClass}`}
						title="Open in issue tracker"
					>
						<IssueIcon />
					</a>
				)}
			</span>
			{children}
		</div>
	);
}
