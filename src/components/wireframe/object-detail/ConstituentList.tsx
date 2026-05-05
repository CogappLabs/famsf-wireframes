/**
 * Constituent list — makers + contributors grouped by Constituent ID.
 * Shows attribution qualifiers ("Possibly", "Attributed to") and
 * "Invisible Role" markers (record kept but not normally surfaced).
 */

import Link from "next/link";
import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { Constituent } from "@/lib/sample-data";
import { t } from "@/lib/strings";

export function ConstituentList({
	constituents,
}: {
	constituents?: Constituent[];
}) {
	if (!constituents || constituents.length === 0) return null;
	return (
		<WireframeSection
			label="Constituents"
			className="border-t border-gray-300 py-8"
		>
			<Container size="md">
				<SectionLabel className="mb-4">
					<span id="constituents">{t("object.constituentsHeading")}</span>
				</SectionLabel>
				<ul className="flex flex-col gap-3">
					{constituents.map((c) => (
						<li
							key={c.id}
							className={`border-l-2 pl-3 ${
								c.invisibleRole
									? "border-gray-200 opacity-60"
									: "border-gray-400"
							}`}
						>
							<div className="flex items-baseline gap-2">
								{c.attribution && (
									<span className="font-mono text-label italic text-gray-500">
										{c.attribution}
									</span>
								)}
								<Link
									href={`/artist-page?name=${encodeURIComponent(c.name)}`}
									className="font-mono text-meta font-medium text-gray-700 underline decoration-gray-300 hover:decoration-gray-600"
								>
									{c.name}
								</Link>
								<span className="font-mono text-label text-gray-400">
									ID {c.id}
								</span>
							</div>
							<p className="font-mono text-label text-gray-500">
								{c.role}
								{c.dates && ` · ${c.dates}`}
								{c.nationality && ` · ${c.nationality}`}
							</p>
							{c.invisibleRole && (
								<p className="mt-0.5 font-mono text-label uppercase tracking-wide text-amber-700">
									{t("object.constituentInvisible")}
								</p>
							)}
						</li>
					))}
				</ul>
			</Container>
		</WireframeSection>
	);
}
