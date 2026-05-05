/**
 * In-copyright modal — three alternatives to direct download.
 * CMA pattern: metadata download / image order / open access FAQs.
 */

export function InCopyrightModal({ onClose }: { onClose: () => void }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			role="dialog"
			aria-modal="true"
			tabIndex={-1}
		>
			<div className="w-full max-w-md border border-gray-300 bg-white">
				<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
					<h3 className="font-mono text-meta font-bold uppercase tracking-wide">
						This work is in copyright
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="font-mono text-meta text-gray-500 hover:text-gray-900"
					>
						Close
					</button>
				</div>
				<div className="p-4">
					<p className="font-mono text-meta text-gray-700">
						Direct download is not available for this image. Choose an option:
					</p>
					<ul className="mt-4 flex flex-col gap-2">
						<li>
							<button
								type="button"
								className="flex w-full items-start gap-3 border border-gray-300 px-3 py-3 text-left hover:border-gray-500"
							>
								<span className="font-mono text-meta font-semibold text-gray-700">
									1.
								</span>
								<span>
									<span className="font-mono text-meta font-medium text-gray-900">
										Download metadata
									</span>
									<span className="block font-mono text-label text-gray-500">
										CSV / JSON record for citation and research
									</span>
								</span>
							</button>
						</li>
						<li>
							<button
								type="button"
								className="flex w-full items-start gap-3 border border-gray-300 px-3 py-3 text-left hover:border-gray-500"
							>
								<span className="font-mono text-meta font-semibold text-gray-700">
									2.
								</span>
								<span>
									<span className="font-mono text-meta font-medium text-gray-900">
										Order an image
									</span>
									<span className="block font-mono text-label text-gray-500">
										Request a high-resolution image for licensed use
									</span>
								</span>
							</button>
						</li>
						<li>
							<button
								type="button"
								className="flex w-full items-start gap-3 border border-gray-300 px-3 py-3 text-left hover:border-gray-500"
							>
								<span className="font-mono text-meta font-semibold text-gray-700">
									3.
								</span>
								<span>
									<span className="font-mono text-meta font-medium text-gray-900">
										Open access FAQs
									</span>
									<span className="block font-mono text-label text-gray-500">
										What can I do with FAMSF collection images?
									</span>
								</span>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
