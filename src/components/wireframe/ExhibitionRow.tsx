import Link from "next/link";

interface ExhibitionRowProps {
	title: string;
	date?: string;
	venue?: string;
	href?: string;
}

export default function ExhibitionRow({
	title,
	date,
	venue,
	href,
}: ExhibitionRowProps) {
	const content = (
		<>
			<p className="font-mono text-meta font-medium text-gray-700">{title}</p>
			{(date || venue) && (
				<p className="font-mono text-label text-gray-500">
					{[date, venue].filter(Boolean).join(" · ")}
				</p>
			)}
		</>
	);

	if (href) {
		return (
			<Link href={href} className="border-l-2 border-gray-200 pl-3">
				{content}
			</Link>
		);
	}

	return (
		<article className="border-l-2 border-gray-200 pl-3">{content}</article>
	);
}
