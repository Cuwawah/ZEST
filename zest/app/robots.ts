import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/book/manage"],
      },
    ],
    sitemap: "https://zestbook.org.ng/sitemap.xml",
  };
}
