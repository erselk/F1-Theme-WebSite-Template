import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
    unoptimized: true,  // Telefondan erişimde resim optimizasyon hatalarını önlemek için
  },
  i18n: {
    locales: ["tr", "en"],
    defaultLocale: "tr",
    localeDetection: true,
  },
  trailingSlash: false,
};

export default nextConfig;
