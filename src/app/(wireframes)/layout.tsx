"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import ScopeToggle from "@/components/wireframe/ScopeToggle";
import { MvpBadge, StatusBadge } from "@/components/wireframe/StatusBadge";
import VariationToggle from "@/components/wireframe/VariationToggle";
import { footerGroups, pages } from "@/lib/data";
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

	return (
		<>
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
					<ScopeToggle />
					{page ? (
						<>
							{isPageMvp(page.id) && <MvpBadge />}
							<StatusBadge status={page.status} />
						</>
					) : (
						<span className="font-mono text-label uppercase text-gray-500">
							{t("nav.wireframe")}
						</span>
					)}
				</div>
			</header>

			<main className="flex-1">{children}</main>

			<footer className="border-t border-gray-300">
				<div className="px-[var(--margin-xl)] py-8">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
						{/* Identity */}
						<div>
							<span className="font-mono text-body font-bold uppercase tracking-wide">
								{t("footer.name")}
							</span>
							<p className="mt-1 font-mono text-meta text-gray-500">
								{t("footer.tagline")}
							</p>
						</div>

						{/* Link groups */}
						<div className="flex gap-10">
							{footerGroups.map((group) => (
								<div key={group.heading}>
									<p className="mb-2 font-mono text-label uppercase text-gray-500">
										{group.heading}
									</p>
									<ul className="flex flex-col gap-1">
										{group.links.map((link) => (
											<li key={link.href}>
												<Link
													href={link.href}
													className="font-mono text-body text-gray-600 underline hover:text-gray-900"
												>
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						{/* Disclaimer */}
						<div className="flex flex-col gap-2">
							<p className="font-mono text-meta text-gray-500">
								{t("footer.disclaimer")}
							</p>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}
