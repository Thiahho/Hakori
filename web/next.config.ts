import type { NextConfig } from "next";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5207").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The browser calls the backend through this same-origin proxy so the cart
  // cookie is first-party — a cross-site cookie (Vercel → Render) is never
  // sent back, which made checkout see an empty cart.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
