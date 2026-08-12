import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/book",
        destination: "/tickets/buy",
        permanent: true,
      },
      {
        source: "/book/success",
        destination: "/reservations",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
