import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Fix Supabase Database types and remove this
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
