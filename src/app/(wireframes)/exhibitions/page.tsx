import ExhibitionsClient from "./ExhibitionsClient";

export interface ExhibitionListEntry {
	id: number;
	title: string;
	date: string;
	venue: string;
	objectCount: number;
	endYear: number | null;
}

// The served index has no structured exhibition data (only the pre-formatted
// exhibition_history_lines[] prose on each object), so there is no source to
// build an exhibition list from. ExhibitionsClient renders a not-available
// note in place of the results grid.
export default function ExhibitionsIndexPage() {
	return <ExhibitionsClient exhibitions={[]} />;
}
