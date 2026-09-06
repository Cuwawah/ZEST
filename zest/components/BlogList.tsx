"use client";

import Link from "next/link";
import { useState } from "react";
import type { BlogCategory } from "@/lib/blog";

type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: BlogCategory;
};

const categoryLabels: Record<BlogCategory, string> = {
  "founder-notes": "Founder Notes",
  guides: "Guides",
};

export default function BlogList({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      <div className="blog-tabs">
        <button
          className={`blog-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        <button
          className={`blog-tab ${activeCategory === "founder-notes" ? "active" : ""}`}
          onClick={() => setActiveCategory("founder-notes")}
        >
          Founder Notes
        </button>
        <button
          className={`blog-tab ${activeCategory === "guides" ? "active" : ""}`}
          onClick={() => setActiveCategory("guides")}
        >
          Guides
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No posts yet. Check back soon!</p>
      ) : (
        <div className="posts">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="post-card"
            >
              <div className="post-meta">
                <span className={`category-badge category-${post.category}`}>
                  {categoryLabels[post.category]}
                </span>
                <time className="post-date">{post.date}</time>
              </div>
              <h2 className="post-title">{post.title}</h2>
              <p className="post-desc">{post.description}</p>
              <span className="post-read">Read more →</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
