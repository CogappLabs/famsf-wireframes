"use client";

import Link from "next/link";
import { useState } from "react";
import { MvpBadge, StatusBadge } from "@/components/wireframe/StatusBadge";
import { pages } from "@/lib/data";
import { isPageMvp } from "@/lib/scope";
import { t } from "@/lib/strings";

export default function WireframeIndex() {
	const [mvpOnly, setMvpOnly] = useState(false);
	const filtered = mvpOnly ? pages.filter((p) => isPageMvp(p.id)) : pages;
	const mvpCount = pages.filter((p) => isPageMvp(p.id)).length;

	return (
		<div className="mx-auto max-w-[var(--container-sm)] px-[var(--margin-xl)] py-20">
			<h1 className="mb-2 font-mono text-page font-semibold leading-[1.15] tracking-tight uppercase">
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
					className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] transition-colors ${
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

			<div className="flex flex-col gap-3">
				{filtered.map((page) => (
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
							<span className="font-mono text-meta text-gray-500">&rarr;</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
