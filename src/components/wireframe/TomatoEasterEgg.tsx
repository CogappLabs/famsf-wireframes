"use client";

import { useEffect, useRef, useState } from "react";

const TRIGGER = "tom";

// A splat lives only for this page session. Anchored to a splattable
// surface (data-splat-id) by fractional coords so it sits at any size.
interface Splat {
	id: string;
	target: string;
	fx: number; // 0..1 across width
	fy: number; // 0..1 down height
	seed: number; // shape/rotation variety
}

function makeId(count: number, fx: number, fy: number): string {
	return `s${count}-${Math.round(fx * 1000)}-${Math.round(fy * 1000)}`;
}

const TOMATO = (
	<svg viewBox="0 0 60 56" width="100%" height="100%" aria-hidden>
		<title>Tomato</title>
		<path
			d="M30 12 C 14 12, 6 24, 6 36 C 6 49, 18 54, 30 54 C 42 54, 54 49, 54 36 C 54 24, 46 12, 30 12 Z"
			fill="#e23b2e"
			stroke="#a3261c"
			strokeWidth="1.5"
		/>
		<path
			d="M30 14 C 27 8, 22 6, 18 7 M30 14 C 33 8, 38 6, 42 7 M30 14 C 30 7, 30 5, 30 3 M30 14 C 26 11, 22 11, 19 12 M30 14 C 34 11, 38 11, 41 12"
			stroke="#3c8a3c"
			strokeWidth="2.4"
			fill="none"
			strokeLinecap="round"
		/>
		<ellipse cx="22" cy="28" rx="5" ry="7" fill="#ff7a6e" opacity="0.7" />
	</svg>
);

export default function TomatoEasterEgg() {
	const [armed, setArmed] = useState(false); // tomato following cursor
	const [splats, setSplats] = useState<Splat[]>([]);
	const tomatoRef = useRef<HTMLDivElement | null>(null);
	// Persistent overlay per surface + the splat ids already drawn. Lets
	// us append (and animate) only NEW splats instead of re-rendering the
	// whole set — existing splats stay put and don't replay their pop-in.
	const overlaysRef = useRef<Map<string, HTMLElement>>(new Map());
	const drawnRef = useRef<Set<string>>(new Set());

	// Render only splats not yet drawn. On Wipe (splats emptied) tear the
	// overlays down.
	useEffect(() => {
		// Wipe: no splats left → remove every overlay, reset bookkeeping.
		if (splats.length === 0) {
			for (const o of overlaysRef.current.values()) o.remove();
			overlaysRef.current.clear();
			drawnRef.current.clear();
			return;
		}

		for (const s of splats) {
			if (drawnRef.current.has(s.id)) continue;
			const surface = document.querySelector<HTMLElement>(
				`[data-splat-id="${s.target}"]`,
			);
			if (!surface) continue;
			if (getComputedStyle(surface).position === "static") {
				surface.style.position = "relative";
			}
			let overlay = overlaysRef.current.get(s.target);
			if (!overlay?.isConnected) {
				overlay = document.createElement("div");
				overlay.dataset.tomatoOverlay = "true";
				overlay.style.cssText =
					"position:absolute;inset:0;pointer-events:none;z-index:5;overflow:hidden;";
				surface.appendChild(overlay);
				overlaysRef.current.set(s.target, overlay);
			}

			const el = document.createElement("div");
			const size = 92 + (s.seed % 36);
			const rest = `translate(-50%,-50%) rotate(${s.seed * 47}deg)`;
			el.style.cssText = `position:absolute;left:${s.fx * 100}%;top:${s.fy * 100}%;width:${size}px;height:${size}px;transform:${rest};transform-origin:center;`;
			el.innerHTML = splatterMarkup(s.seed);
			// Pop the splat in on impact (this splat only).
			el.animate(
				[
					{
						transform: `translate(-50%,-50%) scale(0.2) rotate(${s.seed * 47}deg)`,
						opacity: 0,
					},
					{ opacity: 1, offset: 0.4 },
					{ transform: rest, opacity: 1 },
				],
				{ duration: 220, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
			);
			overlay.appendChild(el);
			drawnRef.current.add(s.id);
		}
	}, [splats]);

	// Remove all overlays on unmount (route change).
	useEffect(() => {
		const overlays = overlaysRef.current;
		return () => {
			for (const o of overlays.values()) o.remove();
			overlays.clear();
		};
	}, []);

	// Type the trigger to arm the tomato.
	useEffect(() => {
		let buffer = "";
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
				setArmed(true);
				buffer = "";
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// While armed: tomato follows cursor, click resolves it.
	useEffect(() => {
		if (!armed) return;

		function place(x: number, y: number) {
			if (tomatoRef.current) {
				tomatoRef.current.style.left = `${x}px`;
				tomatoRef.current.style.top = `${y}px`;
			}
		}
		function onMove(e: MouseEvent) {
			place(e.clientX, e.clientY);
		}

		function onClick(e: MouseEvent) {
			const commit = () => setArmed(false);

			const land = (targetId: string, fx: number, fy: number) =>
				setSplats((prev) => [
					...prev,
					{
						id: makeId(prev.length, fx, fy),
						target: targetId,
						fx,
						fy,
						seed: prev.length * 7 + 3,
					},
				]);

			// Launch from the cursor, arc forward, overshoot past the click
			// point (gravity carry). Splat lands at the OVERSHOOT endpoint,
			// not the cursor.
			const launchX = e.clientX;
			const launchY = e.clientY;
			const carry = 38; // px the throw overshoots forward + down
			const landX = launchX + Math.round(carry * 0.5);
			const landY = launchY + carry;

			// What's under the actual landing point? Hide the tomato first so
			// elementFromPoint sees the surface beneath it.
			const el = tomatoRef.current;
			if (el) el.style.visibility = "hidden";
			const under = document
				.elementFromPoint(landX, landY)
				?.closest<HTMLElement>("[data-splattable]");
			if (el) el.style.visibility = "";

			let impact: { targetId: string; fx: number; fy: number } | null = null;
			if (under?.dataset.splatId) {
				const rect = under.getBoundingClientRect();
				impact = {
					targetId: under.dataset.splatId,
					fx: (landX - rect.left) / rect.width,
					fy: (landY - rect.top) / rect.height,
				};
			}

			if (el) {
				place(launchX, launchY);
				const dx = landX - launchX;
				const dy = landY - launchY;
				const apex = -42; // arc height
				const anim = el.animate(
					[
						{ transform: "translate(0,0) rotate(-8deg) scale(1)", opacity: 1 },
						{
							transform: `translate(${dx * 0.5}px, ${apex}px) rotate(4deg) scale(1)`,
							opacity: 1,
							offset: 0.6,
						},
						{
							transform: `translate(${dx}px, ${dy}px) rotate(12deg) scaleX(1.35) scaleY(0.55)`,
							opacity: 0,
						},
					],
					{ duration: 300, easing: "cubic-bezier(0.4,0,0.7,1)" },
				);
				anim.onfinish = () => {
					if (impact) land(impact.targetId, impact.fx, impact.fy);
					commit();
				};
			} else {
				if (impact) land(impact.targetId, impact.fx, impact.fy);
				commit();
			}
		}

		window.addEventListener("mousemove", onMove);
		// Defer click binding so the arming keystroke's trailing click
		// (if any) doesn't immediately disarm.
		const t = window.setTimeout(() => {
			window.addEventListener("click", onClick);
		}, 0);

		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("click", onClick);
			window.clearTimeout(t);
		};
	}, [armed]);

	return (
		<>
			{armed && (
				<div
					ref={tomatoRef}
					aria-hidden
					style={{
						position: "fixed",
						left: "50%",
						top: "50%",
						width: 56,
						height: 52,
						marginLeft: -28,
						marginTop: -26,
						zIndex: 9999,
						pointerEvents: "none",
						filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
						transform: "rotate(-8deg)",
					}}
				>
					{TOMATO}
				</div>
			)}
			{splats.length > 0 && (
				<button
					type="button"
					onClick={() => setSplats([])}
					className="fixed bottom-4 left-4 z-[9998] border border-red-300 bg-white/90 px-2.5 py-1 font-mono text-label tracking-[0.08em] text-red-600 backdrop-blur hover:border-red-500"
				>
					🍅 Wipe {splats.length} splat{splats.length > 1 ? "s" : ""}
				</button>
			)}
		</>
	);
}

// Organic splat: one irregular blob + a couple of thrown droplets +
// glossy highlight. Seed varies the silhouette so no two look identical.
function splatterMarkup(seed: number): string {
	const j = (base: number, n: number, amp: number) =>
		(base + ((seed * (n + 1)) % (amp * 2)) - amp).toFixed(1);
	// Irregular closed blob via cubic segments around centre (50,50).
	const blob = `M50 ${j(18, 1, 5)}
C ${j(70, 2, 6)} ${j(20, 3, 5)}, ${j(82, 4, 5)} ${j(36, 5, 6)}, ${j(80, 6, 5)} 50
C ${j(78, 7, 5)} ${j(70, 8, 6)}, ${j(66, 9, 6)} ${j(82, 1, 5)}, 50 ${j(82, 2, 5)}
C ${j(34, 3, 6)} ${j(82, 4, 5)}, ${j(20, 5, 5)} ${j(72, 6, 6)}, ${j(19, 7, 5)} 50
C ${j(18, 8, 5)} ${j(34, 9, 6)}, ${j(30, 1, 6)} ${j(20, 2, 5)}, 50 ${j(18, 3, 5)} Z`;
	return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block">
<path d="${blob}" fill="#c62f20" opacity="0.95"/>
<path d="${blob}" fill="#9e2417" opacity="0.35" transform="scale(0.62) translate(31 31)"/>
<circle cx="${j(80, 2, 6)}" cy="${j(30, 3, 6)}" r="${3 + (seed % 3)}" fill="#c62f20" opacity="0.9"/>
<circle cx="${j(24, 4, 6)}" cy="${j(72, 5, 6)}" r="${2 + (seed % 3)}" fill="#c62f20" opacity="0.9"/>
<circle cx="${j(74, 6, 8)}" cy="${j(76, 7, 8)}" r="2" fill="#9e2417" opacity="0.85"/>
<ellipse cx="42" cy="42" rx="6" ry="4" fill="#ff8a7a" opacity="0.55"/>
</svg>`;
}
