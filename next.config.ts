import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
