"use client";

import { useActionState } from "react";
import { login } from "./action";

export function LoginForm() {
	const [error, formAction, pending] = useActionState(login, null);

	return (
		<form action={formAction}>
			<input
				type="password"
				name="password"
				placeholder="Password"
				required
				className="mb-3 w-full border border-gray-300 px-4 py-3 font-mono text-body focus:border-gray-500 focus:outline-none"
			/>
			{error && (
				<p className="mb-3 font-mono text-meta text-red-600">{error}</p>
			)}
			<button
				type="submit"
				disabled={pending}
				className="w-full border border-gray-900 bg-gray-900 px-4 py-3 font-mono text-body text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
			>
				{pending ? "..." : "Continue"}
			</button>
		</form>
	);
}
