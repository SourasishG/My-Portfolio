import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "styles")],
  },
  turbopack: {
    rules: {
      "*.glsl": {
        loaders: ["./scripts/glsl-loader.cjs"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
