import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to allow API routes to work
  // API routes require a Node.js server and cannot be statically exported
};

export default nextConfig;
