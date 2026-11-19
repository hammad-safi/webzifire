import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/journals/review"],
    },
    sitemap: "https://webzifire.com/sitemap.xml",
  };
}
