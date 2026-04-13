"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken } from "@/lib/auth";

export async function login(
	_prevState: string | null,
	formData: FormData,
): Promise<string | null> {
	const password = formData.get("password") as string;
	const expected = process.env.WIREFRAME_PASSWORD;
	const secret = process.env.WIREFRAME_SECRET;

	if (!expected || !secret) {
		return "Auth not configured.";
	}

	if (password !== expected) {
		return "Incorrect password.";
	}

	const token = await signToken("authenticated", secret);
	const cookieStore = await cookies();
	cookieStore.set("wireframe-session", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	redirect("/");
}
