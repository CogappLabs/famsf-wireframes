/**
 * Physical description section: marks, inscriptions, signed, labels,
 * identifying description. From TMS TextEntries with HTML stripped.
 */

import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import type { SampleObject } from "@/lib/sample-data";
import { t } from "@/lib/strings";

const ROWS: { key: keyof SampleObject; label: string }[] = [
	{
		key: "identifyingDescription",
		label: "object.fieldIdentifyingDescription",
	},
	{ key: "signed", label: "object.fieldSigned" },
	{ key: "marks", label: "object.fieldMarks" },
	{ key: "inscriptions", label: "object.fieldInscriptions" },
	{ key: "labelsOnObject", label: "object.fieldLabelsOnObject" },
];

export function PhysicalDescription({ obj }: { obj: SampleObject }) {
	const has = ROWS.some((r) => obj[r.key]);
	if (!has) return null;
	return (
		<WireframeSection
			label="Physical description"
			className="border-t border-gray-300 py-8"
		>
			<Container size="md">
				<SectionLabel className="mb-4">
					<span id="physical">{t("object.physicalHeading")}</span>
				</SectionLabel>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr]">
					{ROWS.map(({ key, label }) => {
						const v = obj[key];
						if (!v) return null;
						return (
							<div key={key} className="contents">
								<dt className="font-mono text-label uppercase tracking-wide text-gray-400">
									{t(label)}
								</dt>
								<dd className="font-mono text-meta text-gray-700">
									{String(v)}
								</dd>
							</div>
						);
					})}
				</dl>
			</Container>
		</WireframeSection>
	);
}
