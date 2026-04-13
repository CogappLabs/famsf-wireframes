"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useVariationContext } from "@/providers/VariationProvider";

export interface Variation {
	key: string;
	label: string;
}

interface VariationToggleProps {
	param?: string;
	variations: readonly Variation[];
}

/**
 * Register variations with the layout top bar and read the active one.
 * Call once per page component. The toggle renders automatically in the header.
 */
export function usePageVariations(
	variations: readonly Variation[],
	param = "variation",
): string {
	const { setVariations } = useVariationContext();

	useEffect(() => {
		setVariations(variations);
		return () => setVariations([]);
	}, [variations, setVariations]);

	return useVariation(variations, param);
}

export function useVariation(
	variations: readonly Variation[],
	param = "variation",
): string {
	const searchParams = useSearchParams();
	const current = searchParams.get(param);
	const valid = variations.find((v) => v.key === current);
	return valid ? valid.key : variations[0].key;
}

export default function VariationToggle({
	param = "variation",
	variations,
}: VariationToggleProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const current = useVariation(variations, param);

	function setVariation(key: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (key === variations[0].key) {
			params.delete(param);
		} else {
			params.set(param, key);
		}
		const qs = params.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname);
	}

	return (
		<div className="flex gap-1">
			{variations.map((v) => (
				<button
					key={v.key}
					type="button"
					onClick={() => setVariation(v.key)}
					className={`px-2.5 py-1 font-mono text-label uppercase transition-colors ${
						current === v.key
							? "bg-gray-800 text-white"
							: "bg-gray-100 text-gray-500 hover:bg-gray-200"
					}`}
				>
					{v.label}
				</button>
			))}
		</div>
	);
}
