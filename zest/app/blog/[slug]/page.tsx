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
    </div>
  );
}

function markdownToHtml(md: string): string {
  let h2Count = 0;
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, (_, text) => {
      h2Count++;
      if (h2Count === 2) {
        return `<h2>${text}</h2><div class="inline-cta"><p class="inline-cta-text">Set up your free booking link in 2 minutes — no card needed.</p><a href="/signup" class="inline-cta-btn">Get started free →</a></div>`;
      }
      return `<h2>${text}</h2>`;
    })
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
