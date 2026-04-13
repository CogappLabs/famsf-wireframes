const encoder = new TextEncoder();

export async function signToken(value: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(value),
	);
	const hex = Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `${value}.${hex}`;
}

export async function verifyToken(token: string, secret: string) {
	const dotIndex = token.lastIndexOf(".");
	if (dotIndex === -1) return false;
	const value = token.slice(0, dotIndex);
	const expected = await signToken(value, secret);
	return token === expected;
}
