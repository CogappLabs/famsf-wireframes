import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Pin Turbopack workspace root to this project — silences the
	// "multiple lockfiles detected" warning when running from a parent
	// directory that also has a lockfile.
	turbopack: {
		root: path.join(__dirname),
	},
};

export default nextConfig;
