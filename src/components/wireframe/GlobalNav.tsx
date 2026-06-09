"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mvpSiteNavigation, type SiteNavItem } from "@/lib/data";
import { t } from "@/lib/strings";

type OpenMenu = string | null;

export default function GlobalNav() {
	const pathname = usePathname();
	const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	const toggle = useCallback(
		(label: string) => setOpenMenu((prev) => (prev === label ? null : label)),
		[],
	);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setOpenMenu(null);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpenMenu(null);
				setMobileOpen(false);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	const isItemActive = (item: SiteNavItem): boolean => {
		if (item.href !== "#" && pathname.startsWith(item.href)) return true;
		return (
			item.children?.some(
				(c) => c.href !== "#" && pathname.startsWith(c.href),
			) ?? false
		);
	};

	return (
		<>
			{/* Backdrop */}
			{openMenu && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
				// biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss
				<div
					className="fixed inset-0 z-40 bg-black/30"
					onClick={() => setOpenMenu(null)}
				/>
			)}

			<nav
				ref={navRef}
				className="relative z-50 border-b border-gray-300 bg-white"
			>
				<div className="flex items-center justify-between px-[var(--margin-xl)] py-3">
					{/* Logo / site name */}
					<Link
						href="/collection-landing"
						className="shrink-0 font-mono text-card font-bold tracking-[0.06em]"
					>
						{t("nav.siteName")}
						<span className="ml-3 font-normal normal-case tracking-normal text-gray-400">
							Collection
						</span>
					</Link>

					{/* Mobile toggle */}
					<button
						type="button"
						onClick={() => {
							setMobileOpen(!mobileOpen);
							setOpenMenu(null);
						}}
						className="font-mono text-meta text-gray-600 xl:hidden"
						aria-label="Toggle menu"
					>
						{mobileOpen ? t("nav.close") : t("nav.menu")}
					</button>

					{/* Desktop nav */}
					<div className="hidden items-center gap-6 xl:flex">
						{mvpSiteNavigation.map((item) =>
							item.children ? (
								<button
									key={item.label}
									type="button"
									onClick={() => toggle(item.label)}
									className={`font-mono text-meta tracking-[0.02em] ${
										isItemActive(item) || openMenu === item.label
											? "font-medium text-gray-900"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									{item.label}
									{openMenu === item.label ? " ▴" : " ▾"}
								</button>
							) : (
								<Link
									key={item.label}
									href={item.href}
									className={`font-mono text-meta tracking-[0.02em] ${
										isItemActive(item)
											? "font-medium text-gray-900"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									{item.label}
								</Link>
							),
						)}
					</div>
				</div>

				{/* Mobile menu */}
				{mobileOpen && (
					<div className="border-t border-gray-200 bg-white px-[var(--margin-xl)] py-4 xl:hidden">
						<div className="flex flex-col gap-1">
							{mvpSiteNavigation.map((item) => (
								<MobileNavItem
									key={item.label}
									item={item}
									pathname={pathname}
									onClose={() => setMobileOpen(false)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Desktop mega panels */}
				{mvpSiteNavigation.map(
					(item) =>
						item.children &&
						openMenu === item.label && (
							<MegaPanel
								key={item.label}
								items={item.children}
								pathname={pathname}
								onClose={() => setOpenMenu(null)}
							/>
						),
				)}
			</nav>
		</>
	);
}

function MobileNavItem({
	item,
	pathname,
	onClose,
}: {
	item: SiteNavItem;
	pathname: string;
	onClose: () => void;
}) {
	const [expanded, setExpanded] = useState(false);

	if (!item.children) {
		return (
			<Link
				href={item.href}
				onClick={onClose}
				className={`py-2 font-mono text-body ${
					item.href !== "#" && pathname.startsWith(item.href)
						? "font-bold"
						: "text-gray-600 hover:text-gray-900"
				}`}
			>
				{item.label}
			</Link>
		);
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center justify-between py-2 text-left font-mono text-body font-bold"
			>
				{item.label}
				<span className="font-mono text-body text-gray-500">
					{expanded ? "▴" : "▾"}
				</span>
			</button>
			{expanded && (
				<div className="flex flex-col gap-1 pb-2 pl-4">
					{item.children.map((child) => (
						<Link
							key={child.label}
							href={child.href}
							onClick={onClose}
							className={`py-1.5 font-mono text-body ${
								child.href !== "#" && pathname.startsWith(child.href)
									? "font-bold"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{child.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

function MegaPanel({
	items,
	pathname,
	onClose,
}: {
	items: SiteNavItem[];
	pathname: string;
	onClose: () => void;
}) {
	return (
		<div className="absolute inset-x-0 top-full z-50 hidden border-b border-gray-300 bg-white shadow-sm xl:block">
			<div
				className="grid gap-3 px-[var(--margin-xl)] py-6"
				style={{
					gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
				}}
			>
				{items.map((item) => (
					<Link
						key={item.label}
						href={item.href}
						onClick={onClose}
						className={`flex flex-col border p-4 text-left transition-colors hover:border-gray-500 hover:bg-gray-50 ${
							item.href !== "#" && pathname.startsWith(item.href)
								? "border-gray-500 bg-gray-50"
								: "border-gray-300"
						}`}
					>
						<span className="font-mono text-meta font-medium">
							{item.label}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
