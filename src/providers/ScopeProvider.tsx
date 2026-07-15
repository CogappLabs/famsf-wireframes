"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

// ── Scope toggle ─────────────────────────────────────────────────────

interface ScopeContextValue {
	showScope: boolean;
	setShowScope: (show: boolean) => void;
	// When true, post-MVP sections are hidden entirely so the page shows the
	// Phase 1 build only. Independent of showScope (the annotation overlay).
	mvpOnly: boolean;
	setMvpOnly: (mvpOnly: boolean) => void;
}

const ScopeContext = createContext<ScopeContextValue>({
	showScope: false,
	setShowScope: () => {},
	mvpOnly: false,
	setMvpOnly: () => {},
});

export function ScopeProvider({ children }: { children: ReactNode }) {
	const [showScope, setShowScope] = useState(false);
	// Default the review view to MVP-only: the page loads showing the Phase 1
	// build, post-MVP sections hidden. Reviewers flip it off to see everything.
	const [mvpOnly, setMvpOnly] = useState(true);
	return (
		<ScopeContext.Provider
			value={{ showScope, setShowScope, mvpOnly, setMvpOnly }}
		>
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
