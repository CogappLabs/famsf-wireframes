import Link from "next/link";

interface ExhibitionRowProps {
	title: string;
	date?: string;
	venue?: string;
	city?: string;
	checklistNumber?: string;
	href?: string;
}

/**
 * FAMSF cataloguing guidelines (Exhibition History, lines 780–787) specify:
 *   `City, Venue, Month Day, Year – Month Day, Year. "Exhibition Title," no. X`
 * Exhibition title in quotation marks (not italics).
 */
export default function ExhibitionRow({
	title,
	date,
	venue,
	city,
	checklistNumber,
	href,
}: ExhibitionRowProps) {
	const venueLine = [city, venue, date].filter(Boolean).join(", ");
	const content = (
		<>
			{venueLine && (
				<p className="font-mono text-label text-gray-500">{venueLine}.</p>
			)}
			<p className="font-mono text-meta font-medium text-gray-700">
				&ldquo;{title}&rdquo;
				{checklistNumber && (
					<span className="text-gray-500">, no. {checklistNumber}</span>
				)}
			</p>
		</>
	);

	if (href) {
		return (
			<Link href={href} className="block border-l-2 border-gray-200 pl-3">
				{content}
			</Link>
		);
	}

	return (
		<article className="border-l-2 border-gray-200 pl-3">{content}</article>
	);
}
