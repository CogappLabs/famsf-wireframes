import type { TranscriptionSegment } from "@/lib/collection-document";

/**
 * Render a list of parsed transcription segments per
 * §Inscriptions / §Mark(s) / §Labels / §Signed:
 *
 *     (side, location, medium) transcription
 *
 * Pipeline `parse_transcriptions` splits the curator string into
 * `{raw, location, transcription, is_watermark}` segments. We render
 * the parenthesised location metadata as a small grey kicker and the
 * transcription body as the focus. Watermark segments get a small
 * leading badge per §Mark(s) L1287.
 *
 * Falls back to the raw string when the segment didn't match the
 * structural template (curator note instead of templated transcription).
 */

export interface TranscriptionListProps {
	segments?: TranscriptionSegment[] | null;
	rawFallback?: string;
	className?: string;
}

export default function TranscriptionList({
	segments,
	rawFallback,
	className,
}: TranscriptionListProps) {
	if (!segments || segments.length === 0) {
		if (!rawFallback) return null;
		return (
			<p className={`font-mono text-meta text-gray-700 ${className ?? ""}`}>
				{rawFallback}
			</p>
		);
	}
	return (
		<ul className={`flex flex-col gap-2 ${className ?? ""}`}>
			{segments.map((s, i) => {
				const key = `${i}-${(s.raw ?? "").slice(0, 40)}`;
				if (s.transcription) {
					return (
						<li key={key} className="flex flex-col">
							{s.is_watermark && (
								<span className="mb-0.5 inline-block self-start border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-amber-800">
									Watermark
								</span>
							)}
							{s.location && (
								<span className="font-mono text-label text-gray-400">
									{s.location}
								</span>
							)}
							<span className="font-mono text-meta text-gray-700">
								{s.transcription}
							</span>
						</li>
					);
				}
				return (
					<li key={key} className="font-mono text-meta text-gray-700">
						{s.raw}
					</li>
				);
			})}
		</ul>
	);
}
