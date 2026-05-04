import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Loads images directly from source (faster for external CDNs)
  },
};

export default nextConfig;
