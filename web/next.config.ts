import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Turbopack guess the wrong
  // workspace root; pin it to this app.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
