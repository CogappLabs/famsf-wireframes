/**
 * Render TMS bibliography text as a numbered list with hanging indent.
 *
 * Cataloguing guidelines (Bibliography section): CMOS 17th ed. NOTES
 * format, one citation per entry, chronological, blank line between
 * entries. The display target here is human-readable scholarly
 * bibliography rather than the curator's monospace edit view.
 *
 * Inputs may contain inline HTML (italic book/journal titles via
 * <em>/<i>, bold via <strong>/<b>); we sanitise to a small allow-list
 * before rendering.
 */

const ALLOWED_TAGS = new Set([
	"em",
	"strong",
	"i",
	"b",
	"u",
	"br",
	"sub",
	"sup",
]);

function sanitiseInline(html: string): string {
	return html.replace(/<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag) => {
		const t = String(tag).toLowerCase();
		if (!ALLOWED_TAGS.has(t)) return "";
		const closing = m.startsWith("</") ? "/" : "";
		const selfClose = t === "br" ? " /" : "";
		return `<${closing}${t}${selfClose}>`;
	});
}

/**
 * Inject CMOS-style italics into a single bibliography entry.
 *
 * Heuristics anchor on structural markers (parenthesised place-of-
 * publication, `exh. cat.` keyword, quoted article-title followed by
 * journal name). Skipped when input already has italic tags.
 *
 * Patterns (in order):
 *  1. Book / catalogue raisonné: ``, Title, (City: Publisher, Year)``
 *     The italicised title sits between `, ` and ` (City:`.
 *  2. Exhibition catalogue: ``, Title, exh. cat.``
 *     The italicised title sits between `, ` and `, exh. cat.`.
 *  3. Journal / newspaper: After `"Article Title,"` the next Title Case run
 *     ending before `,` is the periodical.
 *  4. Auction catalogue: ``, Title, Auction catalog,`` (same shape as book).
 *
 * False-positive guard: skip if candidate matches an honorific run
 * (`Dr.`, `Mr.`, etc) or is < 4 chars. Authors are protected because
 * they sit before the first comma; we only italicise *after* a comma.
 */
function italiciseBibliographyEntry(text: string): string {
	if (/<\s*(em|i)\b/i.test(text)) return text;

	let out = text;
	let matched = false;

	const applyOnce = (pattern: RegExp, minLen = 4): void => {
		if (matched) return;
		const next = out.replace(pattern, (_m, lead, title, tail) => {
			const t = (title as string).trim();
			if (t.length < minLen) return _m;
			matched = true;
			return `${lead}<em>${t}</em>${tail}`;
		});
		if (next !== out) out = next;
	};

	// 1+4. Book / catalogue raisonné / auction catalogue with vol/no marker:
	// `, Title, vol. N, City: Publisher, Year`. Try this first so the
	// `vol. N` doesn't get sucked into a less-specific pattern.
	applyOnce(
		/(,\s+)((?:[A-Z][^,()<>0-9]*?))(,\s+(?:vol\.|no\.)\s*\d+\s*,\s+\(?[A-Z][A-Za-zÀ-ÿ.\s'’-]*:\s*[^,()]+,\s*\d{4})/,
	);

	// 1+4b. Book / catalogue raisonné / auction catalogue (no vol marker):
	// `, Title, (City: Publisher, Year)` OR `, Title, City: Publisher, Year`.
	applyOnce(
		/(,\s+)((?:[A-Z][^,()<>0-9]*?))(,?\s+\(?[A-Z][A-Za-zÀ-ÿ.\s'’-]*:\s*[^,()]+,\s*\d{4})/,
	);

	// 2. Exhibition catalogue: `, Title, exh. cat.`
	applyOnce(/(,\s+)((?:[A-Z][^,()<>]*?))(,\s+exh\.\s*cat\.)/);

	// 3. Journal / newspaper after closed-quote article title.
	// `"Article Title," Journal Name,` followed by vol/no/year/date words.
	// Curly + straight quotes both supported. Month names + 4-digit years
	// also count as a periodical-date tail.
	const monthAlt =
		"Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
	const journalTail = `(?:\\d|vol\\.|no\\.|\\d+\\s*,\\s*no\\.|${monthAlt}\\b|\\d{4})`;
	// Title runs until the first digit (volume) or comma.
	applyOnce(
		new RegExp(
			`([”"],?\\s+)((?:[A-Z][^,()<>"”0-9]*?))(\\s+(?:${journalTail})|,\\s+(?:${journalTail}))`,
		),
	);

	return out;
}

export interface BibliographyTextProps {
	value: string;
	className?: string;
	/** Flow entries across 2 CSS columns (two-column object-detail layout). */
	columns?: boolean;
}

export default function BibliographyText({
	value,
	className,
	columns = false,
}: BibliographyTextProps) {
	const entries = value
		.split(/\n\s*\n/)
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((text, order) => ({ text, order }));

	if (entries.length === 0) return null;

	// columns: CSS multi-column flows entries by height; `break-inside-avoid`
	// on each li stops a citation splitting across the column boundary. Drop
	// the flex column layout (incompatible with multi-column) for `block`.
	return (
		<ol
			className={`${columns ? "block columns-2 gap-x-10 [&>li]:mb-3 [&>li]:break-inside-avoid" : "flex flex-col gap-3"} ${className ?? ""}`}
		>
			{entries.map(({ text, order }) => (
				<li
					key={`${order}-${text.length}-${text.slice(0, 32)}`}
					className="grid grid-cols-[2rem_1fr] gap-2 text-body leading-snug text-gray-700 [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold"
				>
					<span className="font-mono text-label text-gray-400 tabular-nums">
						{order + 1}.
					</span>
					<span
						className="whitespace-pre-line"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised via allow-list
						dangerouslySetInnerHTML={{
							__html: sanitiseInline(italiciseBibliographyEntry(text)),
						}}
					/>
				</li>
			))}
		</ol>
	);
}
