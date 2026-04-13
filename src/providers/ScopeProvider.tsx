"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

// ── Scope toggle ─────────────────────────────────────────────────────

interface ScopeContextValue {
	showScope: boolean;
	setShowScope: (show: boolean) => void;
}

const ScopeContext = createContext<ScopeContextValue>({
	showScope: false,
	setShowScope: () => {},
});

export function ScopeProvider({ children }: { children: ReactNode }) {
	const [showScope, setShowScope] = useState(false);
	return (
		<ScopeContext.Provider value={{ showScope, setShowScope }}>
			{children}
		</ScopeContext.Provider>
	);
}

export function useScope() {
	return useContext(ScopeContext);
}

// ── Page ID context ──────────────────────────────────────────────────

const ScopePageContext = createContext<string | undefined>(undefined);

export function ScopePage({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	return (
		<ScopePageContext.Provider value={id}>{children}</ScopePageContext.Provider>
	);
}

export function useScopePageId() {
	return useContext(ScopePageContext);
}
