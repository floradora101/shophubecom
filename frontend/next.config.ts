import path from "path";
import type { NextConfig } from "next";

// Production build guard: fail if dev-only flags are set (prevents accidental mock/demo in prod)
if (process.env.NODE_ENV === "production") {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  const demoCheckout = process.env.NEXT_PUBLIC_DEMO_CHECKOUT === "true";
  if (useMocks || demoCheckout) {
    throw new Error(
      "[ShopHub] Production build rejected: NEXT_PUBLIC_USE_MOCKS and NEXT_PUBLIC_DEMO_CHECKOUT must be false. " +
        "Remove or set to false in your production environment."
    );
  }
}

// Bundle analyzer configuration
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization for external images to prevent 404 errors
    // External images (Unsplash, UploadThing) will be served directly
    unoptimized: false, // Keep optimization enabled but handle errors gracefully
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.uploadthing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "q37rrgwkji.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    // Add image domains for better compatibility
    domains: [],
    // Configure image formats
    formats: ["image/avif", "image/webp"],
    // Minimum cache time for optimized images
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.module.rules.push({
      test: /\.(cjs|mjs)$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  transpilePackages: ["@uploadthing/react", "@uploadthing/shared"],

  // Optimize bundle splitting
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
    ],
  },

  outputFileTracingRoot: path.resolve(__dirname, ".."),

  // Enable standalone output for Docker
  output: "standalone",
};

export default withBundleAnalyzer(nextConfig);
