import Link from "next/link";
import { MvpBadge } from "@/components/wireframe/StatusBadge";
import { type NavNode, navigation, pages } from "@/lib/data";
import { isPageMvp } from "@/lib/scope";
import { t } from "@/lib/strings";

function TreeNode({ node }: { node: NavNode }) {
	const isSection = node.href === "";

	return (
		<li>
			{isSection ? (
				<span className="font-mono text-card font-medium tracking-wide text-gray-500">
					{node.label}
				</span>
			) : (
				<span className="inline-flex items-center gap-2">
					<Link
						href={node.href}
						className="font-mono text-body underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-500"
					>
						{node.label}
					</Link>
					{isPageMvp(node.href.replace(/^\//, "")) && <MvpBadge />}
				</span>
			)}

			{node.children && (
				<ul className="mt-1.5 flex list-none flex-col gap-1.5 pl-8">
					{node.children.map((child) => (
						<TreeNode key={child.href + child.label} node={child} />
					))}
				</ul>
			)}
		</li>
	);
}

function countPages(nodes: NavNode[]): number {
	return nodes.reduce((sum, node) => {
		const self = node.href !== "" ? 1 : 0;
		const children = node.children ? countPages(node.children) : 0;
		return sum + self + children;
	}, 0);
}

export default function SiteMapPage() {
	const totalNav = countPages(navigation);

	return (
		<div className="mx-auto max-w-[var(--container-sm)] px-[var(--margin-xl)] py-20">
			<p className="mb-1 font-mono text-label uppercase text-gray-500">
				{t("sitemap.label")}
			</p>
			<h1 className="mb-2 font-mono text-page font-semibold leading-[1.15] tracking-tight uppercase">
				{t("sitemap.heading")}
			</h1>
			<p className="mb-1 font-mono text-meta text-gray-500">
				{t("sitemap.description")}
			</p>
			<p className="mb-12 font-mono text-meta text-gray-500">
				{pages.length} pages registered · {totalNav} in navigation tree
			</p>

			<ul className="flex list-none flex-col gap-2 p-0">
				{navigation.map((node) => (
					<TreeNode key={node.href + node.label} node={node} />
				))}
			</ul>
		</div>
	);
}
