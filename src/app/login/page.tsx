import { LoginForm } from "./form";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-xs">
				<h1 className="mb-6 font-mono text-page font-semibold tracking-tight">
					Wireframes
				</h1>
				<p className="mb-6 font-mono text-meta text-gray-500">
					Enter the preview password to continue.
				</p>
				<LoginForm />
			</div>
		</div>
	);
}
