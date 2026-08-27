import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllPosts } from "@/lib/blog";

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
          <time className="post-date">{post.date}</time>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-author">By {post.author}</p>

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
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
        .article {
          margin: 2rem 0 3rem;
        }
        .post-date {
          font-size: 13px;
          color: #a0a080;
        }
        .post-title {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 8px 0;
          line-height: 1.2;
        }
        .post-author {
          font-size: 14px;
          color: #7a7a60;
          margin: 0 0 2rem;
        }
        .post-content {
          font-size: 16px;
          line-height: 1.8;
          color: #3a3a28;
        }
        .post-content :global(h2) {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 2rem 0 0.75rem;
        }
        .post-content :global(h3) {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 1.5rem 0 0.5rem;
        }
        .post-content :global(p) {
          margin: 0 0 1rem;
        }
        .post-content :global(ul),
        .post-content :global(ol) {
          margin: 0 0 1rem;
          padding-left: 1.5rem;
        }
        .post-content :global(li) {
          margin-bottom: 0.4rem;
        }
        .post-content :global(strong) {
          color: #1a1a0f;
        }
        .post-content :global(a) {
          color: #c08b00;
          text-decoration: underline;
        }
        .cta-box {
          background: rgba(255, 255, 255, 0.7);
          border: 1.5px solid #e8e4cc;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin-bottom: 3rem;
        }
        .cta-title {
          font-family: var(--font-fraunces, "Fraunces"), serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 8px;
        }
        .cta-text {
          font-size: 15px;
          color: #7a7a60;
          margin: 0 0 20px;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f5c518;
          color: #1a1a0f;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.15s;
        }
        .cta-btn:hover {
          background: #e6b800;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.+)$/gm, (m) => {
      if (m.startsWith("<")) return m;
      return `<p>${m}</p>`;
    });
}
