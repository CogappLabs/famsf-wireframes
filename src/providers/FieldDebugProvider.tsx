"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface FieldDebugContextValue {
	showFieldDebug: boolean;
	setShowFieldDebug: (show: boolean) => void;
}

const FieldDebugContext = createContext<FieldDebugContextValue>({
	showFieldDebug: false,
	setShowFieldDebug: () => {},
});

export function FieldDebugProvider({ children }: { children: ReactNode }) {
	const [showFieldDebug, setShowFieldDebug] = useState(false);
	return (
		<FieldDebugContext.Provider value={{ showFieldDebug, setShowFieldDebug }}>
			{children}
		</FieldDebugContext.Provider>
	);
}

export function useFieldDebug() {
	return useContext(FieldDebugContext);
}
