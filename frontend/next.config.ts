import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "najemstarcall.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.najemstarcall.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.uploadthing.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Webpack config (used for both dev and production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Handle .cjs and .mjs files
    config.module.rules.push({
      test: /\.(cjs|mjs)$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Transpile these packages to ensure proper module resolution
  transpilePackages: ["@uploadthing/react", "@uploadthing/shared"],
};

export default nextConfig;
