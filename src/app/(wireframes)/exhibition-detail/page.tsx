import ExhibitionDetailClient from "./ExhibitionDetailClient";

export interface ExhibitionSummary {
	id: number;
	title: string;
	date: string;
	venue: string;
	objectIds: number[];
}

// The served index has no structured exhibition records (only pre-formatted
// exhibition_history_lines[] prose per object), so there is nothing to look
// an exhibition up by. ExhibitionDetailClient renders a not-available note
// in place of the exhibition record.
export default function ExhibitionDetailPage() {
	return <ExhibitionDetailClient exhibitions={[]} docs={[]} slugById={{}} />;
}
