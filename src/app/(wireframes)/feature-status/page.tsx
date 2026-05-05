"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container, SectionLabel } from "@/components/wireframe";
import { MvpBadge } from "@/components/wireframe/StatusBadge";
import { pages } from "@/lib/data";
import { isPageMvp, listScopeRows } from "@/lib/scope";
import { t } from "@/lib/strings";

type Filter = "all" | "mvp" | "post-mvp";

const FILTERS: ReadonlyArray<readonly [Filter, string]> = [
	["all", "feature-status.filterAll"],
	["mvp", "feature-status.filterMvp"],
	["post-mvp", "feature-status.filterPostMvp"],
];

function PostMvpBadge() {
	return (
		<span className="inline-block border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-gray-500">
			Post-MVP
		</span>
	);
}

export default function FeatureStatusPage() {
	const [filter, setFilter] = useState<Filter>("all");
	const rows = useMemo(() => listScopeRows(), []);
	const visible = useMemo(
		() =>
			rows.filter((r) =>
				filter === "all" ? true : filter === "mvp" ? r.mvp : !r.mvp,
			),
		[rows, filter],
	);

	const mvpCount = rows.filter((r) => r.mvp).length;
	const postCount = rows.length - mvpCount;
	const mvpPageCount = pages.filter((p) => isPageMvp(p.id)).length;

	const grouped = useMemo(() => {
		const map = new Map<string, typeof visible>();
		for (const r of visible) {
			const list = map.get(r.pageId) ?? [];
			list.push(r);
			map.set(r.pageId, list);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [visible]);

	const pageTitle = (id: string) => pages.find((p) => p.id === id)?.title ?? id;

	return (
		<div className="min-h-screen bg-white">
			<Container className="py-12">
				<SectionLabel>{t("feature-status.label")}</SectionLabel>
				<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight uppercase">
					{t("feature-status.heading")}
				</h1>
				<p className="mt-3 max-w-[var(--container-md)] font-mono text-body text-gray-600">
					{t("feature-status.description")}
				</p>

				{/* Stats */}
				<div className="mt-6 flex flex-wrap gap-4 border-y border-gray-200 py-4">
					<Stat
						value={String(rows.length)}
						label={t("feature-status.statTotal")}
					/>
					<Stat
						value={String(mvpCount)}
						label={t("feature-status.statMvp")}
						tone="emerald"
					/>
					<Stat
						value={String(postCount)}
						label={t("feature-status.statPostMvp")}
					/>
					<Stat
						value={String(mvpPageCount)}
						label={t("feature-status.statPagesMvp")}
						tone="emerald"
					/>
				</div>

				{/* Filter toggles */}
				<div className="mt-6 flex flex-wrap gap-2">
					{FILTERS.map(([key, labelKey]) => (
						<button
							key={key}
							type="button"
							onClick={() => setFilter(key)}
							className={
								filter === key
									? "border-2 border-gray-900 bg-gray-100 px-3 py-1.5 font-mono text-meta font-medium uppercase tracking-wide text-gray-900"
									: "border border-gray-300 px-3 py-1.5 font-mono text-meta uppercase tracking-wide text-gray-600 hover:border-gray-500"
							}
						>
							{t(labelKey)}
						</button>
					))}
					<span className="ml-auto self-center font-mono text-label uppercase tracking-wide text-gray-400">
						{visible.length} of {rows.length} sections
					</span>
				</div>

				{/* Grouped table */}
				{grouped.length === 0 ? (
					<p className="mt-12 border border-dashed border-gray-300 px-4 py-12 text-center font-mono text-meta text-gray-500">
						{t("feature-status.empty")}
					</p>
				) : (
					<div className="mt-8 flex flex-col gap-8">
						{grouped.map(([pageId, sections]) => (
							<section key={pageId}>
								<div className="mb-2 flex items-baseline justify-between border-b border-gray-300 pb-1">
									<h2 className="font-mono text-card font-semibold uppercase tracking-wide">
										<Link
											href={`/${pageId}`}
											className="underline decoration-gray-300 hover:decoration-gray-700"
										>
											{pageTitle(pageId)}
										</Link>
									</h2>
									<span className="font-mono text-label uppercase tracking-wide text-gray-400">
										{sections.filter((s) => s.mvp).length} MVP /{" "}
										{sections.length} total
									</span>
								</div>
								<table className="w-full table-fixed border-collapse font-mono text-meta">
									<thead>
										<tr className="border-b border-gray-200 text-left">
											<th className="w-1/3 py-2 font-mono text-label uppercase tracking-wide text-gray-400">
												{t("feature-status.colSection")}
											</th>
											<th className="w-24 py-2 font-mono text-label uppercase tracking-wide text-gray-400">
												{t("feature-status.colStatus")}
											</th>
											<th className="py-2 font-mono text-label uppercase tracking-wide text-gray-400">
												{t("feature-status.colNotes")}
											</th>
											<th className="w-20 py-2 font-mono text-label uppercase tracking-wide text-gray-400">
												{t("feature-status.colTracker")}
											</th>
										</tr>
									</thead>
									<tbody>
										{sections.map((s) => (
											<tr
												key={s.key}
												className="border-b border-gray-100 align-top"
											>
												<td className="py-2 pr-3 text-gray-800">{s.label}</td>
												<td className="py-2 pr-3">
													{s.mvp ? <MvpBadge /> : <PostMvpBadge />}
												</td>
												<td className="py-2 pr-3 text-gray-600">
													{s.note ?? <span className="text-gray-300">—</span>}
												</td>
												<td className="py-2">
													{s.issueUrl ? (
														<a
															href={s.issueUrl}
															target="_blank"
															rel="noreferrer"
															className="text-gray-500 underline decoration-gray-300 hover:decoration-gray-700"
														>
															↗
														</a>
													) : (
														<span className="text-gray-300">—</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</section>
						))}
					</div>
				)}
			</Container>
		</div>
	);
}

function Stat({
	value,
	label,
	tone,
}: {
	value: string;
	label: string;
	tone?: "emerald";
}) {
	return (
		<div className="flex items-baseline gap-2">
			<span
				className={`font-mono text-card font-semibold tabular-nums ${
					tone === "emerald" ? "text-emerald-700" : "text-gray-800"
				}`}
			>
				{value}
			</span>
			<span className="font-mono text-label uppercase tracking-wide text-gray-500">
				{label}
			</span>
		</div>
	);
}
