"use client";

import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

// Image orders / licensing is handled on the main famsf.org site, not in the
// collection site. This page is a thin signpost: intro + outbound link to the
// rights & reproductions team, rather than an in-site request form.
const FAMSF_LICENSING_URL = "https://www.famsf.org/about/image-licensing";

export default function ImageOrdersClient() {
	return (
		<ScopePage id="image-orders">
			<div className="min-h-screen bg-white">
				<WireframeSection
					label="Header"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel>{t("image-orders.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{t("image-orders.heading")}
						</h1>
						<p className="mt-3 font-mono text-body text-gray-700">
							{t("image-orders.intro")}
						</p>
					</Container>
				</WireframeSection>

				{/* Linkout: licensing + reproduction requests live on famsf.org. */}
				<WireframeSection label="Linkout" className="py-8">
					<Container size="md">
						<p className="font-mono text-body text-gray-700">
							{t("image-orders.linkoutBody")}
						</p>
						<a
							href={FAMSF_LICENSING_URL}
							target="_blank"
							rel="noreferrer"
							className="mt-4 inline-block border border-gray-900 bg-gray-900 px-4 py-2 font-mono text-meta text-white hover:bg-gray-700"
						>
							{t("image-orders.linkoutCta")}
						</a>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
