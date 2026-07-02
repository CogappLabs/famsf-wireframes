import { redirect } from "next/navigation";
import { AREA_SLUGS } from "./[slug]/page";

// No standalone collection-areas index (removed 2026-06-19). The bare
// `/collection-area` link on the wireframe index redirects to the first
// area detail page so it isn't a dead link.
export default function CollectionAreaIndex() {
	redirect(`/collection-area/${AREA_SLUGS[0]}`);
}
