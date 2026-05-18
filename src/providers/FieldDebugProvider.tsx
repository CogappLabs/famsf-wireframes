"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

interface FieldDebugContextValue {
	showFieldDebug: boolean;
	setShowFieldDebug: (show: boolean) => void;
	badgeCount: number;
	registerBadge: () => () => void;
}

const FieldDebugContext = createContext<FieldDebugContextValue>({
	showFieldDebug: false,
	setShowFieldDebug: () => {},
	badgeCount: 0,
	registerBadge: () => () => {},
});

export function FieldDebugProvider({ children }: { children: ReactNode }) {
	const [showFieldDebug, setShowFieldDebug] = useState(false);
	const [badgeCount, setBadgeCount] = useState(0);
	const countRef = useRef(0);

	const registerBadge = useCallback(() => {
		countRef.current += 1;
		setBadgeCount(countRef.current);
		return () => {
			countRef.current -= 1;
			setBadgeCount(countRef.current);
		};
	}, []);

	return (
		<FieldDebugContext.Provider
			value={{ showFieldDebug, setShowFieldDebug, badgeCount, registerBadge }}
		>
			{children}
		</FieldDebugContext.Provider>
	);
}

export function useFieldDebug() {
	return useContext(FieldDebugContext);
}

export function useRegisterFieldBadge() {
	const { registerBadge } = useContext(FieldDebugContext);
	useEffect(() => registerBadge(), [registerBadge]);
}
