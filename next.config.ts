import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // 允许沙箱预览面板域名跨域访问 /_next/* 资源，
  // 消除 "Cross origin request detected" 警告（DevTools 的 1 Issue 来源）
  allowedDevOrigins: ["*.space-z.ai", "space-z.ai"],
};

export default nextConfig;
