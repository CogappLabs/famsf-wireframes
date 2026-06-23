import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ExternalLinkProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	href: string;
	children: ReactNode;
	/** Hide the inline ↗ glyph (the new-tab announcement is still made). Use with
	 *  `corner` so a card shows the badge instead of an inline glyph. */
	hideIcon?: boolean;
	/** Pin a boxed ↗ badge to the top-right corner. For block/card links where an
	 *  inline glyph reads weakly; the link must be positioned (this adds
	 *  `relative`). */
	corner?: boolean;
}

/** Does this href leave the site? True for absolute http(s) URLs, `mailto:`,
 *  and `tel:`; false for in-app paths and fragments. */
export function isExternalHref(href: string): boolean {
	return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}

/** A link that makes its external destination obvious: a ↗ marker (inline or a
 *  top-right corner badge), a screen-reader "(opens in new tab)" announcement,
 *  and `target="_blank"` with `rel="noopener noreferrer"`. `mailto:`/`tel:`
 *  links get the marker but open in the same context (no new tab). Use for every
 *  link that leaves the site (famsf.org, email, external resources). */
export default function ExternalLink({
	href,
	children,
	hideIcon = false,
	corner = false,
	className = "",
	...rest
}: ExternalLinkProps) {
	const isMailOrTel = /^(mailto|tel):/.test(href);
	const opensNewTab = !isMailOrTel;
	const showInlineIcon = !hideIcon && !corner;

	return (
		<a
			href={href}
			className={`${corner ? "relative" : ""} ${className}`.trim()}
			{...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
			{...rest}
		>
			{corner && (
				<span
					aria-hidden="true"
					className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center border-b border-l border-gray-300 bg-gray-50 font-mono text-meta text-gray-500"
				>
					↗
				</span>
			)}
			{children}
			{showInlineIcon && (
				<span aria-hidden="true" className="ml-0.5 inline-block">
					↗
				</span>
			)}
			{opensNewTab && <span className="sr-only"> (opens in new tab)</span>}
		</a>
	);
}
