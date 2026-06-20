import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: isPages ? "export" : undefined,
  basePath: isPages && basePath ? basePath : undefined,
  trailingSlash: isPages ? true : undefined,
  images: { unoptimized: isPages },
};

export default nextConfig;
