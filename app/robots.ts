import type { MetadataRoute } from "next";
import { SITE } from "@/app/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/admin-login", "/account", "/api", "/forbidden"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}