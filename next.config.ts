import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // 允许预览与同源/子路径嵌入
  allowedDevOrigins: [
    "*.space-z.ai",
    "space-z.ai",
    "localhost",
    "127.0.0.1",
    "uniqorn.com.my",
    "*.uniqorn.com.my",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' http://localhost:* https://uniqorn.com.my https://*.uniqorn.com.my;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
