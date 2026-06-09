import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js"],

  allowedDevOrigins: [
    "baffling-wrongful-prize.ngrok-free.dev",
  ],
};

export default nextConfig;