// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server actions if needed in future
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
