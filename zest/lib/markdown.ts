import { marked } from "marked";

export const CTA_HTML =
  '<div class="inline-cta"><p class="inline-cta-text">Set up your free booking link in 2 minutes — no card needed.</p><a href="/signup" class="inline-cta-btn">Get started free →</a></div>';

export function renderPost(md: string): string {
  const withCta = md.replace(/<!--\s*cta\s*-->/g, `\n\n${CTA_HTML}\n\n`);
  return marked.parse(withCta, { gfm: true, async: false });
}
