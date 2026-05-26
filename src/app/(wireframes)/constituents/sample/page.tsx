import Link from "next/link";
import { Container, SectionLabel } from "@/components/wireframe";
import {
	type ConstituentSampleEntry,
	loadConstituentSamples,
} from "@/lib/constituent-samples-registry";
import { ScopePage } from "@/providers/ScopeProvider";

function SampleCard({ entry }: { entry: ConstituentSampleEntry }) {
	const { slug, label, group, doc, tags, populatedFields, reason } = entry;
	const isSpread = group === "spread";
	const heading = isSpread ? (doc.name ?? "Unknown") : label;
	return (
		<div className="border border-gray-300 hover:border-gray-500 hover:bg-gray-50">
			<Link
				href={`/constituents/sample/${slug}`}
				className="flex items-start justify-between px-5 py-4"
			>
				<div className="flex-1">
					{isSpread && (
						<span className="mr-2 inline-block border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-mono text-label tracking-[0.08em] text-amber-800">
							{label}
						</span>
					)}
					<span className="font-mono text-card font-medium">{heading}</span>
					{doc.display_date && (
						<span className="ml-3 font-mono text-label text-gray-400">
							{doc.display_date}
						</span>
					)}
					{!isSpread && doc.nationality && (
						<p className="mt-1 font-mono text-meta text-gray-500">
							{doc.nationality}
						</p>
					)}
					{reason && (
						<p className="mt-2 font-mono text-label text-gray-500">{reason}</p>
					)}
					{tags.length > 0 && (
						<p className="mt-1 font-mono text-label tracking-[0.08em] text-gray-400">
							{tags.join(" / ")}
						</p>
					)}
				</div>
				<div className="ml-6 shrink-0 text-right">
					<span className="block font-mono text-page font-semibold leading-none text-gray-700">
						{populatedFields}
					</span>
					<span className="font-mono text-label text-gray-400">fields</span>
					<span className="mt-2 block font-mono text-meta text-gray-500">
						&rarr;
					</span>
				</div>
			</Link>
		</div>
	);
}

export default function SampleConstituentsIndex() {
	const entries = loadConstituentSamples();
	const spread = entries.filter((e) => e.group === "spread");
	const named = entries.filter((e) => e.group === "named");

	return (
		<ScopePage id="constituents/sample">
			<Container className="py-12">
				<SectionLabel className="mb-3">Sample people</SectionLabel>
				<h1 className="mb-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
					Real ETL pipeline people records
				</h1>
				<p className="mb-10 font-mono text-meta text-gray-500">
					Artist and institution records from the FAMSF pipeline. New JSON files
					in{" "}
					<code className="text-gray-700">src/data/sample-constituents/</code>{" "}
					auto-appear on next build.
				</p>

				{spread.length > 0 && (
					<section className="mb-10">
						<h2 className="mb-4 border-b border-gray-200 pb-1.5 font-mono text-label tracking-[0.08em] text-gray-500">
							Field-population spread (auto-pick)
						</h2>
						<div className="flex flex-col gap-4">
							{spread.map((e) => (
								<SampleCard key={e.slug} entry={e} />
							))}
						</div>
					</section>
				)}

				{named.length > 0 && (
					<section className="mb-10">
						<h2 className="mb-4 border-b border-gray-200 pb-1.5 font-mono text-label tracking-[0.08em] text-gray-500">
							Named records
						</h2>
						<div className="flex flex-col gap-4">
							{named.map((e) => (
								<SampleCard key={e.slug} entry={e} />
							))}
						</div>
					</section>
				)}
			</Container>
		</ScopePage>
	);
}
