"use client";

import { useMemo, useState } from "react";

interface UpstreamDep {
	asset: string;
	column: string;
}

interface ChainHop {
	asset: string;
	column: string;
	kind: string;
	extra_deps: number;
}

export interface FieldRow {
	es_field: string;
	dtype: string;
	nullable: boolean;
	kind: string;
	upstream_deps: UpstreamDep[];
	lineage_chain: ChainHop[];
	is_multi_source: boolean;
	es_type: string | null;
	es_subfields: string[];
	es_nested_properties: string[];
}

type DisplayHop = ChainHop & { collapsed_count?: number };

function collapseChain(chain: ChainHop[]): DisplayHop[] {
	if (chain.length === 0) return [];
	const out: DisplayHop[] = [];
	let i = 0;
	while (i < chain.length) {
		const start = chain[i];
		let j = i;
		while (j + 1 < chain.length && chain[j + 1].column === start.column) {
			j++;
		}
		const collapsed = j - i;
		out.push(collapsed > 0 ? { ...start, collapsed_count: collapsed } : start);
		i = j + 1;
	}
	return out;
}

interface Badge {
	label: string;
	tone: string;
}

function classify(row: FieldRow): Badge[] {
	const badges: Badge[] = [];
	switch (row.kind) {
		case "passthrough":
			badges.push({
				label: "passthrough",
				tone: "border-gray-300 text-gray-500",
			});
			break;
		case "derived":
			badges.push({
				label: "derived",
				tone: "border-amber-400 bg-amber-50 text-amber-700",
			});
			break;
		default:
			badges.push({
				label: row.kind,
				tone: "border-gray-300 text-gray-400",
			});
	}
	if (row.is_multi_source) {
		badges.push({
			label: "multi-source",
			tone: "border-purple-400 bg-purple-50 text-purple-700",
		});
	}
	return badges;
}

type KindFilter = "all" | "passthrough" | "derived" | "multi-source";

const KIND_FILTERS: { value: KindFilter; label: string; tone: string }[] = [
	{ value: "all", label: "All", tone: "border-gray-400 text-gray-700" },
	{
		value: "passthrough",
		label: "Passthrough",
		tone: "border-gray-300 text-gray-500",
	},
	{
		value: "derived",
		label: "Derived",
		tone: "border-amber-400 bg-amber-50 text-amber-700",
	},
	{
		value: "multi-source",
		label: "Multi-source",
		tone: "border-purple-400 bg-purple-50 text-purple-700",
	},
];

function fieldMatchesKind(row: FieldRow, kind: KindFilter): boolean {
	if (kind === "all") return true;
	if (kind === "multi-source") return row.is_multi_source;
	return row.kind === kind;
}

function fieldMatchesSearch(row: FieldRow, query: string): boolean {
	if (!query) return true;
	const q = query.toLowerCase();
	if (row.es_field.toLowerCase().includes(q)) return true;
	for (const dep of row.upstream_deps) {
		if (
			dep.asset.toLowerCase().includes(q) ||
			dep.column.toLowerCase().includes(q)
		)
			return true;
	}
	for (const hop of row.lineage_chain) {
		if (
			hop.asset.toLowerCase().includes(q) ||
			hop.column.toLowerCase().includes(q)
		)
			return true;
	}
	return false;
}

function fieldMatchesTms(row: FieldRow, tmsTable: string): boolean {
	if (tmsTable === "all") return true;
	const target = `tms.${tmsTable}`;
	return row.lineage_chain.some((hop) => hop.asset === target);
}

export default function LineageTable({ fields }: { fields: FieldRow[] }) {
	const [search, setSearch] = useState("");
	const [kindFilter, setKindFilter] = useState<KindFilter>("all");
	const [tmsFilter, setTmsFilter] = useState<string>("all");

	const tmsTables = useMemo(() => {
		const set = new Set<string>();
		for (const row of fields) {
			for (const hop of row.lineage_chain) {
				if (hop.asset.startsWith("tms.")) {
					set.add(hop.asset.slice(4));
				}
			}
		}
		return Array.from(set).sort();
	}, [fields]);

	const filtered = useMemo(
		() =>
			fields.filter(
				(f) =>
					fieldMatchesKind(f, kindFilter) &&
					fieldMatchesSearch(f, search) &&
					fieldMatchesTms(f, tmsFilter),
			),
		[fields, search, kindFilter, tmsFilter],
	);

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-3 border border-gray-200 bg-gray-50 p-3">
				<div className="flex-1 min-w-[240px]">
					<label
						htmlFor="schema-search"
						className="font-mono text-label uppercase tracking-wide text-gray-500"
					>
						Search
					</label>
					<input
						id="schema-search"
						type="search"
						placeholder="ES field, asset, or column…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="mt-1 block w-full border border-gray-300 px-2 py-1 font-mono text-meta text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
					/>
				</div>
				<div>
					<div className="font-mono text-label uppercase tracking-wide text-gray-500">
						TMS table
					</div>
					<select
						value={tmsFilter}
						onChange={(e) => setTmsFilter(e.target.value)}
						className="mt-1 block border border-gray-300 bg-white px-2 py-1 font-mono text-meta text-gray-800 focus:border-gray-500 focus:outline-none"
					>
						<option value="all">All</option>
						{tmsTables.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div>
					<div className="font-mono text-label uppercase tracking-wide text-gray-500">
						Kind
					</div>
					<div className="mt-1 flex flex-wrap gap-1">
						{KIND_FILTERS.map((k) => {
							const active = kindFilter === k.value;
							return (
								<button
									key={k.value}
									type="button"
									onClick={() => setKindFilter(k.value)}
									className={`border px-2 py-1 font-mono text-label uppercase tracking-wide transition ${
										active
											? `${k.tone} font-semibold`
											: "border-gray-200 text-gray-500 hover:border-gray-400"
									}`}
								>
									{k.label}
								</button>
							);
						})}
					</div>
				</div>
				<div className="ml-auto font-mono text-meta text-gray-500">
					Showing {filtered.length} / {fields.length}
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse font-mono text-meta">
					<thead>
						<tr className="border-b-2 border-gray-300 text-left">
							<th className="px-2 py-2 font-mono text-label uppercase tracking-wide text-gray-500">
								ES field
							</th>
							<th className="px-2 py-2 font-mono text-label uppercase tracking-wide text-gray-500">
								Kind
							</th>
							<th className="px-2 py-2 font-mono text-label uppercase tracking-wide text-gray-500">
								Lineage chain → TMS
							</th>
							<th className="px-2 py-2 font-mono text-label uppercase tracking-wide text-gray-500">
								ES type
							</th>
							<th className="px-2 py-2 font-mono text-label uppercase tracking-wide text-gray-500">
								Polars dtype
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-2 py-6 text-center font-mono text-meta italic text-gray-500"
								>
									No fields match.
								</td>
							</tr>
						)}
						{filtered.map((row) => {
							const badges = classify(row);
							return (
								<tr
									key={row.es_field}
									id={row.es_field}
									className="border-b border-gray-200 align-top hover:bg-gray-50"
								>
									<td className="px-2 py-2 text-gray-900">{row.es_field}</td>
									<td className="px-2 py-2">
										<div className="flex flex-col gap-0.5">
											{badges.map((b) => (
												<span
													key={b.label}
													className={`border px-1 ${b.tone} font-mono text-label uppercase tracking-wide`}
												>
													{b.label}
												</span>
											))}
										</div>
									</td>
									<td className="px-2 py-2 text-gray-700">
										{row.lineage_chain.length === 0 ? (
											<span className="italic text-gray-400">–</span>
										) : (
											<ol className="space-y-0.5">
												{collapseChain(row.lineage_chain).map((hop, i) => {
													const isTms = hop.asset.startsWith("tms.");
													return (
														<li
															key={`${hop.asset}.${hop.column}`}
															className="leading-tight"
														>
															<span className="text-gray-400">{i + 1}.</span>{" "}
															{isTms && (
																<span className="mr-1 border border-violet-400 bg-violet-50 px-1 font-mono text-label uppercase tracking-wide text-violet-700">
																	TMS
																</span>
															)}
															<span
																className={
																	isTms ? "text-violet-700" : "text-gray-500"
																}
															>
																{hop.asset.replace(/^tms\./, "")}.
															</span>
															<span className={isTms ? "text-violet-900" : ""}>
																{hop.column}
															</span>
															{hop.collapsed_count &&
																hop.collapsed_count > 0 && (
																	<span className="ml-1 text-gray-400">
																		(+{hop.collapsed_count} unchanged hops)
																	</span>
																)}
															{hop.extra_deps > 0 && (
																<span className="ml-1 text-purple-600">
																	(+{hop.extra_deps} more{" "}
																	{hop.extra_deps === 1 ? "source" : "sources"})
																</span>
															)}
														</li>
													);
												})}
											</ol>
										)}
									</td>
									<td className="px-2 py-2 text-gray-700">
										{row.es_type ? (
											<>
												<code className="bg-gray-100 px-1">{row.es_type}</code>
												{row.es_subfields.length > 0 && (
													<span className="ml-1 text-gray-500">
														{row.es_subfields.map((sub) => `.${sub}`).join(" ")}
													</span>
												)}
												{row.es_nested_properties.length > 0 && (
													<span className="ml-1 text-gray-400">
														(nested: {row.es_nested_properties.length})
													</span>
												)}
											</>
										) : (
											<span className="text-gray-400">–</span>
										)}
									</td>
									<td className="px-2 py-2 text-gray-700">
										<code className="bg-gray-100 px-1">{row.dtype}</code>
										{row.nullable && (
											<span className="ml-1 text-gray-400 italic">
												nullable
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
