import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogCategory = "founder-notes" | "guides";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: BlogCategory;
  content: string;
}

function toTime(date: string): number {
  const t = new Date(date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// Dates are authored as "September 8, 2026". A plain string comparison sorts
// those wrong once the day reaches two digits ("September 15" sorts below
// "September 8"), so compare parsed timestamps.
export function compareByDateDesc(
  a: { date: string },
  b: { date: string }
): number {
  return toTime(b.date) - toTime(a.date);
}

export function getAllPosts(): Omit<BlogPost, "content">[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        author: data.author || "Zest Team",
        category: data.category || "guides",
      };
    })
    .sort(compareByDateDesc);
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "Zest Team",
    category: data.category || "guides",
    content,
  };
}
