import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	const secret = process.env.WIREFRAME_SECRET;

	// No secret configured = no auth required (local dev)
	if (!secret) return NextResponse.next();

	// Bypass auth for allowed IPs (comma-separated env var)
	const allowedIps = process.env.WIREFRAME_ALLOWED_IPS?.split(",").map((ip) =>
		ip.trim(),
	);
	if (allowedIps?.length) {
		const clientIp = request.headers
			.get("x-forwarded-for")
			?.split(",")[0]
			?.trim();
		if (clientIp && allowedIps.includes(clientIp)) {
			return NextResponse.next();
		}
	}

	const token = request.cookies.get("wireframe-session")?.value;
	if (token && (await verifyToken(token, secret))) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
