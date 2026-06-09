/**
 * Issue tracker icon. The FAMSF collection work is tracked in the Jira CW
 * project, so this is the Jira Software logomark (two interlocking arrows).
 */
export function IssueIcon({ className }: { className?: string }) {
	return (
		<svg
			width={12}
			height={12}
			viewBox="0 0 32 32"
			fill="currentColor"
			className={className}
			role="img"
			aria-label="Jira issue"
		>
			<path
				d="M15.066 0 7.4 7.667a1.04 1.04 0 0 0 0 1.47l7.666 7.667 7.667-7.667a1.04 1.04 0 0 0 0-1.47L15.066 0Zm0 5.214a4.323 4.323 0 0 0 0 6.106l3.053-3.053-3.053-3.053Z"
				opacity="0"
			/>
			<path
				d="M16 14.4 8.333 22.067a1.04 1.04 0 0 0 0 1.47L16 31.2l7.667-7.663a1.04 1.04 0 0 0 0-1.47L16 14.4Z"
				opacity="0"
			/>
			<path d="M16.001 0 .468 15.533a1.04 1.04 0 0 0 0 1.47L10.4 26.935l5.6-5.6L8.135 13.47 16.001 5.6Z" />
			<path d="M16.002 31.2 31.535 15.667a1.04 1.04 0 0 0 0-1.47L21.602 4.265l-5.6 5.6 7.867 7.867L16.002 25.6Z" />
		</svg>
	);
}
