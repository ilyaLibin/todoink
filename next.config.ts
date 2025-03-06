import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "onnxruntime-node": "onnxruntime-node",
      },
    },
  },
};

export default nextConfig;
