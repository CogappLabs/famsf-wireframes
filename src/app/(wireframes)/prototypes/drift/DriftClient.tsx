"use client";

import { useCallback, useMemo, useState } from "react";
import { Container } from "@/components/wireframe";
import { t } from "@/lib/strings";
import {
	type DriftObject,
	drift,
	hueSwatch,
	imageFor,
	THREAD_LABELS,
	type ThreadKey,
	thread,
} from "./fake-data";

const THREAD_ORDER: ThreadKey[] = ["artist", "era", "hue", "place", "medium"];

interface TrailStep {
	obj: DriftObject;
	/** How we arrived here. null for the opening object / a surprise jump. */
	via: string | null;
}

export default function DriftClient() {
	// Start on a deterministic object (first in the set) so SSR and the
	// first client render agree — no Math.random at module/render time.
	const [trail, setTrail] = useState<TrailStep[]>([
		{ obj: drift[0], via: null },
	]);

	const current = trail[trail.length - 1].obj;

	// Available threads for the current object: only those with somewhere
	// to go. Each carries its pool so the chip can show a count.
	const threads = useMemo(
		() =>
			THREAD_ORDER.map((key) => ({ key, ...thread(current, key) })).filter(
				(t) => t.pool.length > 0,
			),
		[current],
	);

	// Deterministic pick: index derived from trail length so repeated drifts
	// down the same thread cycle through the pool instead of sticking.
	const follow = useCallback(
		(key: ThreadKey) => {
			const { pool } = thread(current, key);
			if (pool.length === 0) return;
			const next = pool[trail.length % pool.length];
			setTrail((prev) => [...prev, { obj: next, via: THREAD_LABELS[key] }]);
		},
		[current, trail.length],
	);

	const surprise = useCallback(() => {
		// Step a deterministic distance through the set from the current
		// object — feels random, stays SSR-safe and never repeats current.
		const idx = drift.findIndex((o) => o.id === current.id);
		const next = drift[(idx + 7 + trail.length) % drift.length];
		setTrail((prev) => [
			...prev,
			{
				obj: next === current ? drift[(idx + 1) % drift.length] : next,
				via: null,
			},
		]);
	}, [current, trail.length]);

	const rewindTo = useCallback((i: number) => {
		setTrail((prev) => prev.slice(0, i + 1));
	}, []);

	const reset = useCallback(() => {
		setTrail([{ obj: drift[0], via: null }]);
	}, []);

	return (
		<Container size="lg" className="py-8">
			<header className="mb-6 flex items-end justify-between">
				<div>
					<h1 className="mb-1 font-mono text-page font-semibold leading-[1.15] tracking-tight">
						{t("drift.heading")}
					</h1>
					<p className="font-mono text-meta text-gray-500">
						{t("drift.subtitle")}
					</p>
				</div>
				<button
					type="button"
					onClick={reset}
					className="shrink-0 font-mono text-label tracking-[0.08em] text-gray-400 underline hover:text-gray-700"
				>
					{t("drift.reset")}
				</button>
			</header>

			{/* Trail */}
			<div className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-label text-gray-400">
				<span className="tracking-[0.08em] text-gray-500">
					{t("drift.trail")}
				</span>
				{trail.map((step, i) => {
					const isLast = i === trail.length - 1;
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: trail is an ordered path, index is the identity
						<span key={i} className="flex items-center gap-1.5">
							{i > 0 && <span className="text-gray-300">›</span>}
							<button
								type="button"
								onClick={() => rewindTo(i)}
								disabled={isLast}
								className={
									isLast
										? "font-medium text-gray-800"
										: "underline hover:text-gray-700"
								}
							>
								{step.obj.title}
							</button>
						</span>
					);
				})}
			</div>

			{/* Stage */}
			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<figure className="relative overflow-hidden bg-gray-100">
					{/* biome-ignore lint/performance/noImgElement: wireframe placeholder imagery */}
					<img
						key={current.id}
						src={imageFor(current)}
						alt={current.title}
						className="max-h-[68vh] w-full object-cover"
					/>
				</figure>

				<aside className="flex flex-col">
					{trail[trail.length - 1].via && (
						<p className="mb-2 font-mono text-label tracking-[0.08em] text-purple-500">
							{t("drift.arrivedVia")} {trail[trail.length - 1].via}
						</p>
					)}
					<h2 className="font-mono text-card font-medium leading-tight">
						{current.title}
					</h2>
					<p className="mt-0.5 font-mono text-meta text-gray-600">
						{current.artist}
					</p>
					<p className="font-mono text-meta text-gray-500">
						{formatYear(current.year)} · {current.place}
					</p>
					<p className="flex items-center gap-2 font-mono text-label text-gray-400">
						<span
							aria-hidden
							className="inline-block h-3 w-3 rounded-full border border-black/10"
							style={{ backgroundColor: hueSwatch(current.hue) }}
						/>
						{current.medium}
					</p>

					<div className="mt-6 border-t border-gray-200 pt-4">
						<p className="mb-3 font-mono text-label tracking-[0.08em] text-gray-500">
							{t("drift.followThread")}
						</p>
						<div className="flex flex-col gap-2">
							{threads.map((th) => (
								<button
									key={th.key}
									type="button"
									onClick={() => follow(th.key)}
									className="group flex items-center justify-between border border-gray-300 px-3 py-2 text-left font-mono text-meta transition-colors hover:border-purple-400 hover:bg-purple-50/50"
								>
									<span className="flex items-center">
										{THREAD_LABELS[th.key]}
										{th.key === "hue" ? (
											<span
												aria-hidden
												className="ml-2 inline-block h-3.5 w-3.5 rounded-full border border-black/10"
												style={{ backgroundColor: hueSwatch(th.value) }}
											/>
										) : (
											<span className="ml-2 text-gray-400">{th.value}</span>
										)}
									</span>
									<span className="text-gray-400 group-hover:text-purple-600">
										{th.pool.length} →
									</span>
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={surprise}
							className="mt-4 w-full border border-gray-800 bg-gray-900 px-3 py-2.5 font-mono text-meta text-white transition-colors hover:bg-gray-700"
						>
							↺ {t("drift.surprise")}
						</button>
					</div>
				</aside>
			</div>
		</Container>
	);
}

function formatYear(y: number): string {
	if (y < 0) return `${Math.abs(y)} BCE`;
	return String(y);
}
