import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // A restored Turbopack build cache on Vercel kept serving an old Tailwind stylesheet
    // (new utility classes were missing), so builds always compile from scratch.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos uploaded from the admin live in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
