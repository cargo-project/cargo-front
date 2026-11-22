import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: process.env.CARGO_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
