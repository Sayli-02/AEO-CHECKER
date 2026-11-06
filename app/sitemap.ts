import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/aeo-checker", "/about", "/contact", "/privacy", "/terms"];
  return paths.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date("2026-11-06"),
    changeFrequency: "weekly",
    priority: path === "/aeo-checker" || path === "" ? 1 : 0.6,
  }));
}
