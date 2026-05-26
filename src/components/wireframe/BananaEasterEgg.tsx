"use client";

import { useEffect, useRef, useState } from "react";

const TRIGGER = "banana";
const WIGGLE_MS = 1200;
const TOTAL_MS = 2400;

const WIGGLE_KEYFRAMES: Keyframe[] = [
	{ transform: "rotate(0deg) scale(1) translateY(0)", offset: 0 },
	{ transform: "rotate(-18deg) scale(1.15) translateY(0)", offset: 0.15 },
	{ transform: "rotate(16deg) scale(1.2) translateY(0)", offset: 0.3 },
	{ transform: "rotate(-14deg) scale(1.15) translateY(-8px)", offset: 0.45 },
	{ transform: "rotate(12deg) scale(1.1) translateY(0)", offset: 0.6 },
	{ transform: "rotate(-8deg) scale(1.05) translateY(0)", offset: 0.75 },
	{ transform: "rotate(0deg) scale(1) translateY(0)", offset: 1 },
];

const FLOAT_KEYFRAMES: Keyframe[] = [
	{
		transform: "translate(-50%, -200px) rotate(-12deg)",
		opacity: 0,
		offset: 0,
	},
	{ transform: "translate(-50%, 0) rotate(-12deg)", opacity: 1, offset: 0.25 },
	{ transform: "translate(-50%, 0) rotate(-12deg)", opacity: 1, offset: 0.75 },
	{
		transform: "translate(-50%, -200px) rotate(-12deg)",
		opacity: 0,
		offset: 1,
	},
];

export default function BananaEasterEgg() {
	const [visible, setVisible] = useState(false);
	const floatRef = useRef<HTMLDivElement | null>(null);
	const wiggleRef = useRef<SVGSVGElement | null>(null);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		let buffer = "";

		function trigger() {
			const tagged = document.querySelectorAll<HTMLElement | SVGElement>(
				"[data-banana]:not([data-banana-floating])",
			);
			for (const n of tagged) {
				(n as HTMLElement).style.transformOrigin = "center";
				n.animate(WIGGLE_KEYFRAMES, {
					duration: WIGGLE_MS,
					easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
					fill: "none",
				});
			}

			setVisible(true);
			if (timerRef.current) window.clearTimeout(timerRef.current);
			window.requestAnimationFrame(() => {
				if (floatRef.current) {
					floatRef.current.animate(FLOAT_KEYFRAMES, {
						duration: TOTAL_MS,
						easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
						fill: "both",
					});
				}
				if (wiggleRef.current) {
					wiggleRef.current.animate(WIGGLE_KEYFRAMES, {
						duration: WIGGLE_MS,
						delay: 400,
						easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
						fill: "none",
						composite: "add",
					});
				}
			});
			timerRef.current = window.setTimeout(() => setVisible(false), TOTAL_MS);
		}

		function onKey(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
					return;
				}
			}
			if (e.key.length !== 1) return;
			buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length);
			if (buffer === TRIGGER) {
				trigger();
				buffer = "";
			}
		}

		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);

	if (!visible) return null;

	return (
		<div
			ref={floatRef}
			data-banana
			data-banana-floating
			aria-hidden
			style={{
				position: "fixed",
				top: "20vh",
				left: "50%",
				zIndex: 9999,
				pointerEvents: "none",
				transformOrigin: "center",
			}}
		>
			<svg
				ref={wiggleRef}
				viewBox="0 0 100 55"
				width="200"
				height="110"
				style={{ display: "block", transformOrigin: "center" }}
			>
				<title>Banana</title>
				<path
					d="M10 42 Q 18 16, 50 12 Q 80 10, 92 22 Q 96 28, 92 32 Q 80 26, 56 30 Q 28 34, 20 48 Q 12 50, 10 42 Z"
					fill="#fde047"
					stroke="#ca8a04"
					strokeWidth="1.5"
				/>
				<path d="M10 42 q -4 -4 -5 -10 q 3 0 6 4 z" fill="#854d0e" />
				<circle cx="93" cy="23" r="2.2" fill="#713f12" />
			</svg>
		</div>
	);
}
