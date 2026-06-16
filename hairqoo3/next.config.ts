import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Wszystkie obrazy encji serwowane lokalnie z /public/assets/images/
    unoptimized: false,
  },
};

export default nextConfig;
