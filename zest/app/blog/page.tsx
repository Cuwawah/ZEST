import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";

export const metadata: Metadata = {
  title: "Blog — Zest",
  description:
    "Tips, guides, and insights for service-based businesses in Nigeria. Learn about scheduling, client management, and growing your practice.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="blog-page">
      <div className="container">
        <Link href="/" className="back-link">
          ← Back to Zest
        </Link>

        <h1 className="heading">Blog</h1>
        <p className="subtitle">
          Tips, guides, and insights for service-based businesses in Nigeria.
        </p>

        <BlogList posts={posts} />
      </div>
    </div>
  );
}
