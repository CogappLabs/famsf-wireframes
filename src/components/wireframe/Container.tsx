interface ContainerProps {
	children: React.ReactNode;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
	className?: string;
	as?: "div" | "section" | "main";
}

const widths: Record<string, string> = {
	xs: "mx-auto max-w-[var(--container-xs)]",
	sm: "mx-auto max-w-[var(--container-sm)]",
	md: "mx-auto max-w-[var(--container-md)]",
	lg: "mx-auto max-w-[var(--container-lg)]",
	xl: "mx-auto max-w-[var(--container-xl)]",
	full: "",
};

export default function Container({
	children,
	size = "xl",
	className = "",
	as: Tag = "div",
}: ContainerProps) {
	return (
		<Tag
			className={`${widths[size]} px-[var(--margin-xl)] ${className}`.trim()}
		>
			{children}
		</Tag>
	);
}
