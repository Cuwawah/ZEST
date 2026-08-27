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

      <style jsx>{`
        .blog-page {
          min-height: 100vh;
          background: #fffbf0;
          font-family: var(--font-dm-sans, "DM Sans"), sans-serif;
        }
        .container {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }
        .back-link {
          color: #c08b00;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .heading {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 1.5rem 0 0.5rem;
        }
        .subtitle {
          font-size: 16px;
          color: #7a7a60;
          margin: 0 0 2.5rem;
        }
        .empty {
          font-size: 15px;
          color: #a0a080;
        }
        .posts {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .post-card {
          display: block;
          padding: 28px 32px;
          background: rgba(255, 255, 255, 0.7);
          border: 1.5px solid #e8e4cc;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.15s;
        }
        .post-card:hover {
          border-color: #f5c518;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.15);
        }
        .post-date {
          font-size: 13px;
          color: #a0a080;
        }
        .post-title {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 8px 0;
        }
        .post-desc {
          font-size: 15px;
          color: #7a7a60;
          line-height: 1.6;
          margin: 0 0 12px;
        }
        .post-read {
          font-size: 14px;
          color: #c08b00;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
