import { constituentSlugByName } from "@/lib/constituent-samples-registry";
import PortfolioDetailClient from "./PortfolioDetailClient";

export default function PortfolioDetailPage() {
	return <PortfolioDetailClient slugByName={constituentSlugByName()} />;
}
