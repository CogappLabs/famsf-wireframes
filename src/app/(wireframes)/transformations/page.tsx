import { promises as fs } from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	Container,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { ScopePage } from "@/providers/ScopeProvider";

const DOC_PATH = path.join(
	process.cwd(),
	"docs",
	"source-to-wireframe-transformations.md",
);

export default async function TransformationsPage() {
	let markdown: string;
	try {
		markdown = await fs.readFile(DOC_PATH, "utf-8");
	} catch {
		markdown =
			"_Doc file not found at build time. Check that `docs/source-to-wireframe-transformations.md` is committed and the Vercel project root is the wireframes repo._";
	}

	return (
		<ScopePage id="transformations">
			<WireframeSection
				label="Source-to-wireframe transformations"
				className="py-8"
			>
				<Container size="lg">
					<SectionLabel className="mb-6">
						Source → wireframe transformations
					</SectionLabel>
					<article
						className="prose prose-sm max-w-none
							[&_h1]:font-mono [&_h1]:text-page [&_h1]:font-semibold [&_h1]:mb-4 [&_h1]:tracking-tight
							[&_h2]:font-mono [&_h2]:text-heading [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-gray-300 [&_h2]:pb-1.5
							[&_h3]:font-mono [&_h3]:text-subheading [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
							[&_p]:my-3 [&_p]:text-body [&_p]:leading-relaxed [&_p]:text-gray-700
							[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1
							[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1
							[&_li]:text-body [&_li]:text-gray-700 [&_li]:leading-relaxed
							[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:font-mono [&_table]:text-meta
							[&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
							[&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-1.5 [&_td]:align-top [&_td]:text-gray-700
							[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-meta [&_code]:text-gray-800
							[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-50 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-meta
							[&_pre_code]:bg-transparent [&_pre_code]:p-0
							[&_strong]:font-semibold [&_strong]:text-gray-900
							[&_em]:italic
							[&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-blue-300 hover:[&_a]:decoration-blue-700
							[&_hr]:my-8 [&_hr]:border-gray-300"
					>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{markdown}
						</ReactMarkdown>
					</article>
				</Container>
			</WireframeSection>
		</ScopePage>
	);
}
