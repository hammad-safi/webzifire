import { MetadataRoute } from "next";
import { services } from "@/data/services";
import { caseStudies } from "@/data/caseStudies";
import { getPublishedJournals } from "@/lib/journals";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://webzifire.com"
  ).replace(/\/+$/, "");

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/book`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic service routes
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Dynamic case study routes
  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${baseUrl}/work/${c.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic blog routes (Supabase published + static evergreen)
  const publishedArticles = await getPublishedJournals();
  const blogRoutes: MetadataRoute.Sitemap = publishedArticles.map((a) => ({
    url: `${baseUrl}/blog/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...caseStudyRoutes, ...blogRoutes];
}
