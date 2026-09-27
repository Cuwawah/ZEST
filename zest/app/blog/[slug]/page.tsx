import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllPosts, type BlogCategory } from "@/lib/blog";
import { renderPost } from "@/lib/markdown";

const categoryLabels: Record<BlogCategory, string> = {
  "founder-notes": "Founder Notes",
  guides: "Guides",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://zestbook.org.ng/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="blog-page">
      <div className="container">
        <Link href="/blog" className="back-link">
          ← All posts
        </Link>

        <article className="article">
          <div className="post-meta">
            <span className={`category-badge category-${post.category}`}>
              {categoryLabels[post.category]}
            </span>
            <time className="post-date">{post.date}</time>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-author">By {post.author}</p>

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: renderPost(post.content) }}
          />
        </article>

        <div className="cta-box">
          <h2 className="cta-title">Ready to try Zest?</h2>
          <p className="cta-text">
            Start booking clients today — free plan, no card needed.
          </p>
          <Link href="/signup" className="cta-btn">
            Get started free →
          </Link>
        </div>
      </div>
    </div>
  );
}
