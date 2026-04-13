"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { Variation } from "@/components/wireframe/VariationToggle";

interface VariationContextValue {
	variations: readonly Variation[];
	setVariations: (v: readonly Variation[]) => void;
}

const VariationContext = createContext<VariationContextValue>({
	variations: [],
	setVariations: () => {},
});

export function VariationProvider({ children }: { children: ReactNode }) {
	const [variations, setVariations] = useState<readonly Variation[]>([]);
	return (
		<VariationContext.Provider value={{ variations, setVariations }}>
			{children}
		</VariationContext.Provider>
	);
}

export function useVariationContext() {
	return useContext(VariationContext);
}
