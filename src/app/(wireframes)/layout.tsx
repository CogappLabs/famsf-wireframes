"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink } from "@/components/wireframe";
import BananaEasterEgg from "@/components/wireframe/BananaEasterEgg";
import FieldDebugToggle from "@/components/wireframe/FieldDebugToggle";
import FloatingSearch from "@/components/wireframe/FloatingSearch";
import GlobalNav from "@/components/wireframe/GlobalNav";
import ScopeToggle from "@/components/wireframe/ScopeToggle";
import { MvpBadge, StatusBadge } from "@/components/wireframe/StatusBadge";
import VariationToggle from "@/components/wireframe/VariationToggle";
import { mvpFooterGroups, pages } from "@/lib/data";
import { isPageMvp } from "@/lib/scope";
import { t } from "@/lib/strings";
import { useVariationContext } from "@/providers/VariationProvider";

function VariationSlot() {
	const { variations } = useVariationContext();
	if (variations.length === 0) return null;
	return <VariationToggle variations={variations} />;
}

export default function WireframeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const pageId = pathname.replace(/^\//, "").split("/")[0];
	const page = pages.find((p) => p.id === pageId);
	// Prototype pages live at /prototypes/<id> but are listed on the
	// main index, so the back-link always returns to "/".
	const inPrototypes = pageId === "prototypes";

	return (
		<>
			<BananaEasterEgg />
			<header className="relative z-50 flex items-center justify-between border-b border-gray-300 bg-white px-[var(--margin-xl)] py-2">
				<Link
					href="/"
					className="font-mono text-body text-gray-500 underline hover:text-gray-600"
				>
					&larr; {t("nav.backToIndex")}
				</Link>
				<Suspense>
					<VariationSlot />
				</Suspense>
				<div className="flex items-center gap-2">
					<FieldDebugToggle />
					<ScopeToggle />
					{page ? (
						<>
							{isPageMvp(page.id) && <MvpBadge />}
							<StatusBadge status={page.status} />
						</>
					) : inPrototypes ? (
						<span className="border border-purple-400 px-2 py-0.5 font-mono text-label tracking-[0.08em] text-purple-600">
							{t("nav.prototype")}
						</span>
					) : (
						<span className="font-mono text-label text-gray-500">
							{t("nav.wireframe")}
						</span>
					)}
				</div>
			</header>

			<GlobalNav />

			<main className="flex-1">{children}</main>

			<FloatingSearch />

			<footer className="border-t border-gray-300">
				<div className="px-[var(--margin-xl)] py-8">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
						{/* Identity */}
						<div>
							<span className="font-mono text-body font-bold tracking-wide">
								{t("footer.name")}
							</span>
							<span className="ml-2 font-mono text-body text-gray-400">
								Collection
							</span>
							<p className="mt-1 font-mono text-meta text-gray-500">
								{t("footer.tagline")}
							</p>

							{/* Cross-property links */}
							<ul className="mt-4 flex flex-col gap-1">
								<li>
									<ExternalLink
										href="https://www.famsf.org/"
										className="font-mono text-meta text-gray-600 underline hover:text-gray-900"
									>
										{t("footer.crossLinkMain")}
									</ExternalLink>
								</li>
								<li>
									<ExternalLink
										href="https://www.famsf.org/visit"
										className="font-mono text-meta text-gray-600 underline hover:text-gray-900"
									>
										{t("footer.crossLinkVisit")}
									</ExternalLink>
								</li>
								<li>
									<ExternalLink
										href="https://tickets.famsf.org/"
										className="font-mono text-meta text-gray-600 underline hover:text-gray-900"
									>
										{t("footer.crossLinkTickets")}
									</ExternalLink>
								</li>
								<li>
									<Link
										href="/accessibility-statement"
										className="font-mono text-meta text-gray-600 underline hover:text-gray-900"
									>
										{t("footer.crossLinkAccessibility")}
									</Link>
								</li>
							</ul>
						</div>

						{/* Link groups */}
						{mvpFooterGroups.map((group) => (
							<div key={group.heading}>
								<p className="mb-2 font-mono text-label text-gray-500">
									{group.heading}
								</p>
								<ul className="flex flex-col gap-1">
									{group.links.map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="font-mono text-meta text-gray-600 underline hover:text-gray-900"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<p className="mt-8 border-t border-gray-200 pt-4 font-mono text-meta text-gray-500">
						{t("footer.disclaimer")}
					</p>
				</div>
			</footer>
		</>
	);
}
