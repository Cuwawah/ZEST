import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllProfileSlugs } from "@/app/actions/profile";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts().map((post) => ({
    url: `https://zestbook.org.ng/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const profileSlugs = await getAllProfileSlugs();
  const profiles = profileSlugs.map((slug) => ({
    url: `https://zestbook.org.ng/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://zestbook.org.ng",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://zestbook.org.ng/signup",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://zestbook.org.ng/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://zestbook.org.ng/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts,
    ...profiles,
    {
      url: "https://zestbook.org.ng/tutorial",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://zestbook.org.ng/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://zestbook.org.ng/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
