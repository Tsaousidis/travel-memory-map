import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep test compilation and locks separate from the user's running app.
  distDir: process.env.AUTH_TEST_MODE === "1" ? ".next/auth-test" : ".next",
};

export default nextConfig;
