import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
  ],
  turbopack: {},
};

export default nextConfig;