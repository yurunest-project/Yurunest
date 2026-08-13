import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return ["/", "/about", "/recruit", "/privacy", "/tokushoho"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
