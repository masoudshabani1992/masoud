import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/models/products";
import { listNews } from "@/lib/models/news";
import { listPages } from "@/lib/models/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "https://www.kooshakhodro.com";
  const staticRoutes = ["", "/products", "/news", "/agencies", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
  const productRoutes = listProducts({ onlyActive: true }).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));
  const newsRoutes = listNews({ onlyActive: true }).map((n) => ({
    url: `${base}/news/${n.slug}`,
    lastModified: new Date(n.updatedAt),
  }));
  const pageRoutes = listPages({ onlyActive: true }).map((p) => ({
    url: `${base}/page/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));
  return [...staticRoutes, ...productRoutes, ...newsRoutes, ...pageRoutes];
}
