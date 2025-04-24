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
  // i18n artık App Router'da farklı şekilde yapılandırılıyor
  // middleware.ts dosyasında dil yönlendirmesi yapılmalı
  trailingSlash: false,
  // Netlify için output yapılandırması
  output: 'standalone',
};

export default nextConfig;
