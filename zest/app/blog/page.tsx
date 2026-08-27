import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

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

        {posts.length === 0 ? (
          <p className="empty">No posts yet. Check back soon!</p>
        ) : (
          <div className="posts">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="post-card"
              >
                <time className="post-date">{post.date}</time>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-desc">{post.description}</p>
                <span className="post-read">Read more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
