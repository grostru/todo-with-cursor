import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tus opciones actuales de Next.js...
  
  // Forzar a usar Webpack en lugar de Turbopack
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
