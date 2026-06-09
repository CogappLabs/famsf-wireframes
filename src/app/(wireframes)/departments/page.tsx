import { redirect } from "next/navigation";

// "Departments" was renamed to the public-facing "Collection areas" (CW-30 —
// same entities). Old links redirect to the canonical route.
export default function DepartmentsRedirect() {
	redirect("/collection-areas");
}
