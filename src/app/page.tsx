"use client";

import Link from "next/link";
import { useState } from "react";
import { MvpBadge, StatusBadge } from "@/components/wireframe/StatusBadge";
import {
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	MATURITY_LABELS,
	MATURITY_STYLES,
	type PageCategory,
	pages,
	prototypes,
	type WireframePage,
} from "@/lib/data";
import { isPageMvp } from "@/lib/scope";
import { t } from "@/lib/strings";

export default function WireframeIndex() {
	const [mvpOnly, setMvpOnly] = useState(true);
	const filtered = mvpOnly ? pages.filter((p) => isPageMvp(p.id)) : pages;
	const mvpCount = pages.filter((p) => isPageMvp(p.id)).length;

	// Group by category in declared order. Pages with no category fall
	// into the "other" bucket rendered last so nothing gets dropped.
	const grouped = new Map<PageCategory | "other", WireframePage[]>();
	for (const page of filtered) {
		const key = page.category ?? "other";
		const list = grouped.get(key) ?? [];
		list.push(page);
		grouped.set(key, list);
	}

	const orderedKeys: (PageCategory | "other")[] = [
		...CATEGORY_ORDER.filter((c) => grouped.has(c)),
		...(grouped.has("other") ? (["other"] as const) : []),
	];

	return (
		<div className="mx-auto max-w-[var(--container-sm)] px-[var(--margin-xl)] py-20">
			<h1 className="mb-2 font-mono text-page font-semibold leading-[1.15] tracking-tight ">
				{t("index.heading")}
			</h1>
			<p className="mb-1 font-mono text-meta text-gray-500">
				{t("index.subtitle")}
			</p>
			<p className="mb-12 font-mono text-meta text-gray-500">
				{t("index.phase")}
			</p>

			<div className="mb-6 flex items-center gap-3">
				<button
					type="button"
					onClick={() => setMvpOnly(!mvpOnly)}
					className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-label tracking-[0.08em] transition-colors ${
						mvpOnly
							? "border-emerald-400 bg-emerald-50 text-emerald-700"
							: "border-gray-300 text-gray-400 hover:border-gray-400"
					}`}
				>
					<span
						className={`inline-block h-2.5 w-2.5 border ${
							mvpOnly ? "border-emerald-500 bg-emerald-500" : "border-gray-400"
						}`}
					/>
					MVP only
				</button>
				<span className="font-mono text-meta text-gray-400">
					{mvpOnly
						? `${mvpCount} of ${pages.length} pages`
						: `${pages.length} pages (${mvpCount} MVP)`}
				</span>
			</div>

			<div className="flex flex-col gap-10">
				{orderedKeys.map((key) => {
					const items = grouped.get(key) ?? [];
					if (items.length === 0) return null;
					const heading =
						key === "other" ? "Other" : CATEGORY_LABELS[key as PageCategory];
					return (
						<section key={key} className="flex flex-col gap-3">
							<h2 className="mb-1 font-mono text-label tracking-[0.08em] text-gray-500">
								{heading}
							</h2>
							{items.map((page) => (
								<Link
									key={page.id}
									href={`/${page.id}`}
									className="flex items-center justify-between border border-gray-300 px-5 py-4 text-left transition-colors hover:border-gray-500 hover:bg-gray-50"
								>
									<div>
										<span className="font-mono text-card font-medium">
											{page.title}
										</span>
										<span className="mt-1 block font-mono text-meta text-gray-500">
											{page.description}
										</span>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										{isPageMvp(page.id) && <MvpBadge />}
										<StatusBadge status={page.status} />
										<span className="font-mono text-meta text-gray-500">
											&rarr;
										</span>
									</div>
								</Link>
							))}
						</section>
					);
				})}
			</div>

			{!mvpOnly && prototypes.length > 0 && (
				<div className="mt-16 border-t border-gray-200 pt-10">
					<h2 className="mb-1 font-mono text-label tracking-[0.08em] text-purple-500">
						{t("index.prototypesHeading")}
					</h2>
					<p className="mb-3 font-mono text-meta text-gray-500">
						{t("index.prototypesSubtitle")}
					</p>
					<div className="flex flex-col gap-3">
						{prototypes.map((proto) => (
							<Link
								key={proto.id}
								href={`/prototypes/${proto.id}`}
								className="flex items-center justify-between border border-gray-300 px-5 py-4 text-left transition-colors hover:border-purple-400 hover:bg-purple-50/40"
							>
								<div>
									<span className="font-mono text-card font-medium">
										{proto.title}
									</span>
									<span className="mt-1 block font-mono text-meta text-gray-500">
										{proto.description}
									</span>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<span
										className={`border px-2 py-0.5 font-mono text-label tracking-[0.08em] ${MATURITY_STYLES[proto.maturity]}`}
									>
										{MATURITY_LABELS[proto.maturity]}
									</span>
									<span className="font-mono text-meta text-gray-500">
										&rarr;
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
