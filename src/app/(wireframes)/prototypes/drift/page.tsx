import { ScopePage } from "@/providers/ScopeProvider";
import DriftClient from "./DriftClient";

// Drift / serendipity feed. Fully fabricated dataset (./fake-data.ts) so
// every thread is dense — this is an interaction prototype, not wired to
// the ETL sample docs.
export default function DriftPage() {
	return (
		<ScopePage id="prototypes/drift">
			<DriftClient />
		</ScopePage>
	);
}
