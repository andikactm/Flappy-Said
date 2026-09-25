import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const basePath = phase === PHASE_PRODUCTION_BUILD && process.env.GITHUB_ACTIONS === "true"
    ? "/Flappy-Said"
    : "";

  return {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    basePath,
    assetPrefix: basePath,
    // Inline the same prefix for public assets loaded directly by Phaser.
    // No .env file or repository secret is needed.
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
  };
};
export default nextConfig;
