import type { Metadata } from "next";
import { FieldDebugProvider } from "@/providers/FieldDebugProvider";
import { ScopeProvider } from "@/providers/ScopeProvider";
import { VariationProvider } from "@/providers/VariationProvider";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		template: "%s | Wireframes",
		default: "Wireframes",
	},
	description: "Interactive wireframes for stakeholder review",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="flex min-h-full flex-col font-mono">
				<FieldDebugProvider>
					<ScopeProvider>
						<VariationProvider>{children}</VariationProvider>
					</ScopeProvider>
				</FieldDebugProvider>
			</body>
		</html>
	);
}
