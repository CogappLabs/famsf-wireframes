import en from "./en.json";

const strings: Record<string, string> = en;

export function t(key: string): string {
	return strings[key] ?? key;
}
