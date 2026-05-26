"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import {
	Breadcrumb,
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";
import type { ExhibitionListEntry } from "./page";

type Status = "all" | "current" | "upcoming" | "past";

// Wireframe-only: sample data is historical, so "current" is a slim window
// near the most recent end-year. Production would use real start/end dates.
const NOW_YEAR = new Date().getFullYear();

function statusFor(entry: ExhibitionListEntry): Status {
	const y = entry.endYear;
	if (y === null) return "past";
	if (y > NOW_YEAR) return "upcoming";
	if (y >= NOW_YEAR - 1) return "current";
	return "past";
}

function ExhibitionsContent({
	exhibitions,
}: {
	exhibitions: ExhibitionListEntry[];
}) {
	const [status, setStatus] = useState<Status>("all");
	const [venue, setVenue] = useState<string>("all");

	const venues = useMemo(() => {
		const set = new Set<string>();
		for (const e of exhibitions) set.add(e.venue);
		return Array.from(set).sort();
	}, [exhibitions]);

	const filtered = useMemo(() => {
		return exhibitions.filter((e) => {
			if (status !== "all" && statusFor(e) !== status) return false;
			if (venue !== "all" && e.venue !== venue) return false;
			return true;
		});
	}, [exhibitions, status, venue]);

	return (
		<ScopePage id="exhibitions">
			<div className="min-h-screen bg-white">
				<Container className="border-b border-gray-200 py-2">
					<Breadcrumb
						items={[
							{
								label: t("object.breadcrumbCollection"),
								href: "/collection-landing",
							},
							{ label: t("exhibitions.label") },
						]}
					/>
				</Container>

				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel>{t("exhibitions.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("exhibitions.heading")}
						</h1>
						<p className="mt-4 max-w-[var(--container-md)] font-mono text-body text-gray-600">
							{t("exhibitions.intro")}
						</p>
					</Container>
				</WireframeSection>

				<WireframeSection
					label="Filters"
					className="border-b border-gray-300 py-8"
				>
					<Container>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
							<div>
								<SectionLabel className="mb-2">
									{t("exhibitions.filterStatus")}
								</SectionLabel>
								<div className="flex flex-wrap gap-2">
									{(
										[
											["all", t("exhibitions.statusAll")],
											["current", t("exhibitions.statusCurrent")],
											["upcoming", t("exhibitions.statusUpcoming")],
											["past", t("exhibitions.statusPast")],
										] as Array<[Status, string]>
									).map(([key, label]) => (
										<button
											key={key}
											type="button"
											onClick={() => setStatus(key)}
											className={`border px-3 py-1 font-mono text-meta transition-colors ${
												status === key
													? "border-gray-800 bg-gray-800 text-white"
													: "border-gray-300 text-gray-700 hover:border-gray-500"
											}`}
										>
											{label}
										</button>
									))}
								</div>
							</div>

							<div>
								<SectionLabel className="mb-2">
									{t("exhibitions.filterVenue")}
								</SectionLabel>
								<div className="flex flex-wrap items-center gap-2">
									{(() => {
										const PRIMARY = ["de Young", "Legion of Honor", "FAMSF"];
										const primaryVenues = venues.filter((v) =>
											PRIMARY.includes(v),
										);
										const otherVenues = venues.filter(
											(v) => !PRIMARY.includes(v),
										);
										return (
											<>
												<button
													type="button"
													onClick={() => setVenue("all")}
													className={`border px-3 py-1 font-mono text-meta transition-colors ${
														venue === "all"
															? "border-gray-800 bg-gray-800 text-white"
															: "border-gray-300 text-gray-700 hover:border-gray-500"
													}`}
												>
													{t("exhibitions.venueAll")}
												</button>
												{primaryVenues.map((v) => (
													<button
														key={v}
														type="button"
														onClick={() => setVenue(v)}
														className={`border px-3 py-1 font-mono text-meta transition-colors ${
															venue === v
																? "border-gray-800 bg-gray-800 text-white"
																: "border-gray-300 text-gray-700 hover:border-gray-500"
														}`}
													>
														{v}
													</button>
												))}
												{otherVenues.length > 0 && (
													<>
														<span className="font-mono text-label text-gray-400">
															or travelling venue:
														</span>
														<select
															value={
																otherVenues.includes(venue) ? venue : "__none"
															}
															onChange={(ev) => {
																const v = ev.target.value;
																setVenue(v === "__none" ? "all" : v);
															}}
															className="border border-gray-300 bg-white px-2 py-1 font-mono text-meta text-gray-700 hover:border-gray-500"
														>
															<option value="__none">Select venue…</option>
															{otherVenues.map((v) => (
																<option key={v} value={v}>
																	{v}
																</option>
															))}
														</select>
													</>
												)}
											</>
										);
									})()}
								</div>
							</div>
						</div>
					</Container>
				</WireframeSection>

				<WireframeSection label="Results" className="py-12">
					<Container>
						<SectionLabel className="mb-6">
							{filtered.length} {filtered.length === 1 ? "result" : "results"}
						</SectionLabel>
						{filtered.length === 0 ? (
							<p className="font-mono text-body text-gray-500">
								{t("exhibitions.empty")}
							</p>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{filtered.map((e) => {
									const s = statusFor(e);
									return (
										<Link
											key={e.id}
											href={`/exhibition-detail?id=${e.id}`}
											className="flex flex-col border border-gray-300 transition-colors hover:border-gray-500"
										>
											<ImagePlaceholder aspect="3/2" label={`[${e.title}]`} />
											<div className="flex flex-1 flex-col p-4">
												<p className="font-mono text-label tracking-wide text-gray-400">
													{s === "current"
														? t("exhibitions.statusCurrent")
														: s === "upcoming"
															? t("exhibitions.statusUpcoming")
															: t("exhibitions.statusPast")}{" "}
													&middot; {e.venue}
												</p>
												<h3 className="mt-1 font-mono text-card font-medium leading-snug">
													{e.title}
												</h3>
												<p className="mt-2 font-mono text-meta text-gray-500">
													{e.date}
												</p>
												<p className="mt-auto pt-3 font-mono text-meta text-gray-400">
													{e.objectCount} {t("exhibitions.worksSuffix")}
												</p>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</Container>
				</WireframeSection>

				<ScopeMark label="Pipeline gap">
					<WireframeSection
						label="Pipeline gap"
						className="border-t border-gray-300 py-8"
					>
						<Container size="md">
							<SectionLabel className="mb-2">Pipeline gap</SectionLabel>
							<p className="font-mono text-meta text-gray-500">
								This list is derived from per-object exhibition references in
								sample data. Production needs a dedicated{" "}
								<code className="rounded bg-gray-100 px-1 py-0.5">
									exhibition_documents
								</code>{" "}
								index with curatorial copy, install views, dates parsed to ISO,
								and venue normalised to a controlled vocab. Current
								<code className="mx-1 rounded bg-gray-100 px-1 py-0.5">
									ObjExhibitions
								</code>{" "}
								extract lacks City + Checklist Number columns (deviation row).
							</p>
						</Container>
					</WireframeSection>
				</ScopeMark>
			</div>
		</ScopePage>
	);
}

export default function ExhibitionsClient({
	exhibitions,
}: {
	exhibitions: ExhibitionListEntry[];
}) {
	return (
		<Suspense>
			<ExhibitionsContent exhibitions={exhibitions} />
		</Suspense>
	);
}
